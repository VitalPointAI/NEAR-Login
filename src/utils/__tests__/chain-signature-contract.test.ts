import { ChainSignatureContract, createChainSignatureContract, MPC_CONTRACTS } from '../../utils/chain-signature-contract';
import * as nearAPI from 'near-api-js';

// Mock NEAR API
jest.mock('near-api-js');

describe('ChainSignatureContract', () => {
  let mockNear: jest.Mocked<nearAPI.Near>;
  let mockAccount: jest.Mocked<nearAPI.Account>;
  let contract: ChainSignatureContract;

  beforeEach(() => {
    mockAccount = {
      viewFunction: jest.fn(),
      signAndSendTransactions: jest.fn(),
    } as any;

    mockNear = {
      account: jest.fn().mockResolvedValue(mockAccount),
    } as any;

    contract = new ChainSignatureContract('test.contract', 'testnet', mockNear);
  });

  describe('getMasterPublicKey', () => {
    it('should retrieve master public key successfully', async () => {
      const expectedKey = 'ed25519:ABC123...';
      mockAccount.viewFunction.mockResolvedValue(expectedKey);

      const result = await contract.getMasterPublicKey();

      expect(result).toBe(expectedKey);
      expect(mockAccount.viewFunction).toHaveBeenCalledWith({
        contractId: 'test.contract',
        methodName: 'public_key',
        args: {},
      });
    });

    it('should handle errors when retrieving master public key', async () => {
      mockAccount.viewFunction.mockRejectedValue(new Error('Network error'));

      await expect(contract.getMasterPublicKey()).rejects.toThrow(
        'Failed to get master public key from MPC contract'
      );
    });
  });

  describe('getDerivedPublicKey', () => {
    it('should derive public key for given path and predecessor', async () => {
      mockAccount.viewFunction.mockResolvedValue('XYZ789...');

      const result = await contract.getDerivedPublicKey({
        path: 'ethereum,1',
        predecessor: 'test.testnet',
      });

      expect(result).toBe('XYZ789...');
      expect(mockAccount.viewFunction).toHaveBeenCalledWith({
        contractId: 'test.contract',
        methodName: 'derived_public_key',
        args: {
          path: 'ethereum,1',
          predecessor: 'test.testnet',
        },
      });
    });

    it('should format Ed25519 key correctly', async () => {
      mockAccount.viewFunction.mockResolvedValue('ABC123...');

      const result = await contract.getDerivedPublicKey({
        path: 'test,1',
        predecessor: 'test.testnet',
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toBe('ABC123...');
    });

    it('should handle derivation errors', async () => {
      mockAccount.viewFunction.mockRejectedValue(new Error('Invalid path'));

      await expect(
        contract.getDerivedPublicKey({
          path: 'invalid,path',
          predecessor: 'test.testnet',
        })
      ).rejects.toThrow('Failed to derive public key for path: invalid,path');
    });
  });

  describe('sign', () => {
    const mockSignerAccount = {
      accountId: 'test.testnet',
      signAndSendTransactions: jest.fn(),
    };

    beforeEach(() => {
      mockSignerAccount.signAndSendTransactions.mockClear();
    });

    it('should create and send signature requests successfully', async () => {
      const payload = new Uint8Array([1, 2, 3, 4]);
      // 130-character hex signature (65 bytes: 32r + 32s + 1v)
      const mockSignature = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab1b';
      const mockResponse = [
        {
          receipt_outcome: {
            outcome: {
              logs: [`signature: ${mockSignature}`],
            },
          },
        },
      ];

      mockSignerAccount.signAndSendTransactions.mockResolvedValue(mockResponse);

      const result = await contract.sign({
        payloads: [payload],
        path: 'ethereum,1',
        keyType: 'Ecdsa',
        signerAccount: mockSignerAccount,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('r');
      expect(result[0]).toHaveProperty('s');
      expect(result[0]).toHaveProperty('v');
      expect(mockSignerAccount.signAndSendTransactions).toHaveBeenCalledWith({
        transactions: expect.arrayContaining([
          expect.objectContaining({
            signerId: 'test.testnet',
            receiverId: 'test.contract',
            actions: expect.arrayContaining([
              expect.objectContaining({
                type: 'FunctionCall',
                params: expect.objectContaining({
                  methodName: 'sign',
                  args: expect.objectContaining({
                    request: expect.objectContaining({
                      payload_v2: { Ecdsa: '01020304' },
                      path: 'ethereum,1',
                      domain_id: 0,
                    }),
                  }),
                }),
              }),
            ]),
          }),
        ]),
      });
    });

    it('should handle signing errors', async () => {
      mockSignerAccount.signAndSendTransactions.mockRejectedValue(
        new Error('Transaction failed')
      );

      await expect(
        contract.sign({
          payloads: [new Uint8Array([1, 2, 3])],
          path: 'ethereum,1',
          keyType: 'Ecdsa',
          signerAccount: mockSignerAccount,
        })
      ).rejects.toThrow('Failed to request signatures from MPC network');
    });
  });

  describe('createAuthMessage', () => {
    it('should create standard authentication message', () => {
      const timestamp = 1643723400000; // 2022-02-01T12:30:00.000Z
      const message = ChainSignatureContract.createAuthMessage(
        'ethereum',
        '0x123...',
        timestamp
      );

      const expectedDate = new Date(timestamp).toISOString();
      expect(message).toBe(
        `Authenticate with ethereum wallet 0x123... at ${expectedDate}`
      );
    });

    it('should use current timestamp when not provided', () => {
      const before = Date.now();
      const message = ChainSignatureContract.createAuthMessage('bitcoin', 'bc1q123...');
      const after = Date.now();

      expect(message).toMatch(/^Authenticate with bitcoin wallet bc1q123\.\.\. at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Extract timestamp from message and verify it's within expected range
      const timestampMatch = message.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/);
      expect(timestampMatch).toBeTruthy();
      const messageTimestamp = new Date(timestampMatch![1]).getTime();
      expect(messageTimestamp).toBeGreaterThanOrEqual(before);
      expect(messageTimestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('createMessageHash', () => {
    it('should create message hash from string', () => {
      const message = 'Test authentication message';
      const hash = ChainSignatureContract.createMessageHash(message);

      expect(hash).toBeDefined();
      expect(hash.constructor.name).toBe('Uint8Array');
      expect(hash.length).toBeGreaterThan(0);
      
      // Verify it matches expected encoding
      const expected = new TextEncoder().encode(message);
      expect(Array.from(hash)).toEqual(Array.from(expected));
    });
  });
});

describe('createChainSignatureContract', () => {
  let mockNear: jest.Mocked<nearAPI.Near>;

  beforeEach(() => {
    mockNear = {} as any;
  });

  it('should create contract with default mainnet address', () => {
    const contract = createChainSignatureContract('mainnet', mockNear);
    expect(contract).toBeInstanceOf(ChainSignatureContract);
  });

  it('should create contract with default testnet address', () => {
    const contract = createChainSignatureContract('testnet', mockNear);
    expect(contract).toBeInstanceOf(ChainSignatureContract);
  });

  it('should create contract with custom contract ID', () => {
    const customContractId = 'my-custom.testnet';
    const contract = createChainSignatureContract('testnet', mockNear, customContractId);
    expect(contract).toBeInstanceOf(ChainSignatureContract);
  });

  it('should use correct default contract addresses', () => {
    expect(MPC_CONTRACTS.mainnet).toBe('v1.signer');
    expect(MPC_CONTRACTS.testnet).toBe('v1.signer-prod.testnet');
  });
});
