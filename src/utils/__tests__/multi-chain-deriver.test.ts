import { MultiChainAddressDeriver } from '../../utils/multi-chain-deriver';
import type { ChainSignatureConfig } from '../../types/chain-signatures';

// Mock the blockchain SDKs
jest.mock('viem', () => ({
  createPublicClient: jest.fn(),
  http: jest.fn(),
  keccak256: jest.fn(() => '0x' + '1234567890123456789012345678901234567890123456789012345678901234'),
  getAddress: jest.fn((address: string) => address.toLowerCase()),
}));

jest.mock('bitcoinjs-lib', () => ({
  payments: {
    p2wpkh: jest.fn(() => ({
      address: 'bc1qabcdef1234567890abcdef1234567890abcdef',
    })),
    p2pkh: jest.fn(() => ({
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    })),
  },
  networks: {
    bitcoin: { name: 'bitcoin' },
    testnet: { name: 'testnet' },
  },
}));

jest.mock('@solana/web3.js', () => ({
  PublicKey: jest.fn().mockImplementation(() => ({
    toString: () => '11111111111111111111111111111112',
    toBase58: () => '11111111111111111111111111111112',
  })),
}));

jest.mock('ripple-address-codec', () => ({
  encodeAccountID: jest.fn(() => 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'),
}));

jest.mock('@aptos-labs/ts-sdk', () => ({
  Ed25519PublicKey: jest.fn().mockImplementation(() => ({
    toUint8Array: () => new Uint8Array(32),
    toString: () => '0x1234567890123456789012345678901234567890123456789012345678901234',
  })),
}));

jest.mock('bech32', () => ({
  bech32: {
    encode: jest.fn(() => 'cosmos1abcdef1234567890abcdef1234567890abcdef'),
  },
}));

describe('MultiChainAddressDeriver', () => {
  let deriver: MultiChainAddressDeriver;
  let mockChainSignatureContract: any;
  let mockConfig: ChainSignatureConfig;

  beforeEach(() => {
    mockChainSignatureContract = {
      getDerivedPublicKey: jest.fn(),
    };
    
    mockConfig = {
      contractId: 'v1.signer-prod.testnet',
      networkId: 'testnet',
      supportedChains: {
        ethereum: { 
          name: 'Ethereum', 
          chainId: '1',
          type: 'evm',
          rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/demo',
          nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
        },
        bitcoin: { 
          name: 'Bitcoin', 
          chainId: '0',
          type: 'bitcoin',
          rpcUrl: 'https://blockstream.info/api',
          nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 }
        },
        solana: { 
          name: 'Solana', 
          chainId: '101',
          type: 'solana',
          rpcUrl: 'https://api.mainnet-beta.solana.com',
          nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 }
        },
        xrp: { name: 'XRP', chainId: '0', type: 'xrp', rpcUrl: 'https://s1.ripple.com:51234', nativeCurrency: { name: 'XRP', symbol: 'XRP', decimals: 6 } },
        sui: { name: 'Sui', chainId: '1', type: 'sui', rpcUrl: 'https://fullnode.mainnet.sui.io:443', nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 } },
        aptos: { name: 'Aptos', chainId: '1', type: 'aptos', rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1', nativeCurrency: { name: 'Aptos', symbol: 'APT', decimals: 8 } },
        near: { name: 'NEAR', chainId: 'mainnet', type: 'near', rpcUrl: 'https://rpc.mainnet.near.org', nativeCurrency: { name: 'NEAR', symbol: 'NEAR', decimals: 24 } },
        polygon: { name: 'Polygon', chainId: '137', type: 'evm', rpcUrl: 'https://polygon-rpc.com', nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 } },
        arbitrum: { name: 'Arbitrum', chainId: '42161', type: 'evm', rpcUrl: 'https://arb1.arbitrum.io/rpc', nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 } },
        optimism: { name: 'Optimism', chainId: '10', type: 'evm', rpcUrl: 'https://mainnet.optimism.io', nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 } },
        bsc: { name: 'Binance Smart Chain', chainId: '56', type: 'evm', rpcUrl: 'https://bsc-dataseed.binance.org', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 } }
      },
      derivationPaths: {
        ethereum: 'ethereum,1',
        bitcoin: 'bitcoin,1',
        solana: 'solana,1',
        polygon: 'polygon,1',
        arbitrum: 'arbitrum,1',
        optimism: 'optimism,1',
        bsc: 'bsc,1',
        xrp: 'xrp,1',
        aptos: 'aptos,1',
        sui: 'sui,1',
        near: 'near,1',
      },
    };
    
    deriver = new MultiChainAddressDeriver(mockChainSignatureContract, mockConfig);
  });

  it('should initialize correctly', () => {
    expect(deriver).toBeInstanceOf(MultiChainAddressDeriver);
  });

  it('should derive Ethereum address from secp256k1 public key', async () => {
    const mockPublicKey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result = await deriver.deriveAddress('test.testnet', 'ethereum');

    expect(result).toEqual({
      chain: 'ethereum',
      address: expect.any(String),
      publicKey: mockPublicKey,
      derivationPath: 'ethereum,1',
    });
    expect(result.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('should derive Bitcoin address', async () => {
    const mockPublicKey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result = await deriver.deriveAddress('test.testnet', 'bitcoin');

    expect(result).toEqual({
      chain: 'bitcoin',
      address: expect.any(String),
      publicKey: mockPublicKey,
      derivationPath: 'bitcoin,1',
    });
    expect(result.address).toMatch(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/);
  });

  it('should derive Solana address', async () => {
    const mockPublicKey = '1111111111111111111111111111111211111111111111111111111111111112';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result = await deriver.deriveAddress('test.testnet', 'solana');

    expect(result).toEqual({
      chain: 'solana',
      address: expect.any(String),
      publicKey: mockPublicKey,
      derivationPath: 'solana,1',
    });
    expect(result.address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  });

  it('should derive multiple addresses for different chains', async () => {
    const mockPublicKeySecp256k1 = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockPublicKeyEd25519 = '1111111111111111111111111111111211111111111111111111111111111112';
    
    mockChainSignatureContract.getDerivedPublicKey
      .mockImplementation((params: any) => {
        if (params.isEd25519) {
          return Promise.resolve(mockPublicKeyEd25519);
        }
        return Promise.resolve(mockPublicKeySecp256k1);
      });

    const result = await deriver.deriveMultipleAddresses('test.testnet', ['ethereum', 'bitcoin', 'solana']);

    expect(result).toHaveProperty('ethereum');
    expect(result).toHaveProperty('bitcoin');
    expect(result).toHaveProperty('solana');
    
    expect(result.ethereum?.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(result.bitcoin?.address).toMatch(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/);
    expect(result.solana?.address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  });

  it('should derive Polygon address (EVM compatible)', async () => {
    const mockPublicKey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result = await deriver.deriveAddress('test.testnet', 'polygon');

    expect(result).toEqual({
      chain: 'polygon',
      address: expect.any(String),
      publicKey: mockPublicKey,
      derivationPath: 'polygon,1',
    });
    expect(result.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('should derive XRP address', async () => {
    const mockPublicKey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result = await deriver.deriveAddress('test.testnet', 'xrp');

    expect(result).toEqual({
      chain: 'xrp',
      address: expect.any(String),
      publicKey: mockPublicKey,
      derivationPath: 'xrp,1',
    });
    expect(result.address).toMatch(/^r[a-zA-Z0-9]{24,34}$/);
  });

  it('should derive Aptos address', async () => {
    const mockPublicKey = '1111111111111111111111111111111211111111111111111111111111111112';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result = await deriver.deriveAddress('test.testnet', 'aptos');

    expect(result).toEqual({
      chain: 'aptos',
      address: expect.any(String),
      publicKey: mockPublicKey,
      derivationPath: 'aptos,1',
    });
    expect(result.address).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it('should use custom derivation path when provided', async () => {
    const mockPublicKey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const customPath = 'ethereum,44';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result = await deriver.deriveAddress('test.testnet', 'ethereum', customPath);

    expect(result.derivationPath).toBe(customPath);
    expect(mockChainSignatureContract.getDerivedPublicKey).toHaveBeenCalledWith({
      path: customPath,
      predecessor: 'test.testnet',
      isEd25519: false,
    });
  });

  it('should detect Ed25519 chains correctly', () => {
    expect(deriver.getKeyType('solana')).toBe('Eddsa');
    expect(deriver.getKeyType('aptos')).toBe('Eddsa');
    expect(deriver.getKeyType('sui')).toBe('Eddsa');
    expect(deriver.getKeyType('near')).toBe('Eddsa');
    
    expect(deriver.getKeyType('ethereum')).toBe('Ecdsa');
    expect(deriver.getKeyType('bitcoin')).toBe('Ecdsa');
    expect(deriver.getKeyType('xrp')).toBe('Ecdsa');
    expect(deriver.getKeyType('polygon')).toBe('Ecdsa');
  });

  it('should validate addresses correctly', () => {
    // EVM addresses
    expect(deriver.validateAddress('ethereum', '0x1234567890123456789012345678901234567890')).toBe(true);
    expect(deriver.validateAddress('ethereum', '0x123')).toBe(false);
    expect(deriver.validateAddress('polygon', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')).toBe(true);

    // Bitcoin addresses
    expect(deriver.validateAddress('bitcoin', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    expect(deriver.validateAddress('bitcoin', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(true);
    expect(deriver.validateAddress('bitcoin', 'invalid')).toBe(false);

    // Solana addresses
    expect(deriver.validateAddress('solana', '11111111111111111111111111111112')).toBe(true);
    expect(deriver.validateAddress('solana', 'invalid')).toBe(false);

    // XRP addresses
    expect(deriver.validateAddress('xrp', 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')).toBe(true);
    expect(deriver.validateAddress('xrp', 'invalid')).toBe(false);

    // Aptos addresses
    expect(deriver.validateAddress('aptos', '0x1234567890123456789012345678901234567890123456789012345678901234')).toBe(true);
    expect(deriver.validateAddress('aptos', '0x123')).toBe(false);
  });

  it('should throw error for unsupported chain', async () => {
    await expect(deriver.deriveAddress('test.testnet', 'unsupported' as any))
      .rejects.toThrow('Chain unsupported is not configured');
  });

  it('should handle contract errors gracefully', async () => {
    mockChainSignatureContract.getDerivedPublicKey.mockRejectedValue(new Error('Contract error'));

    await expect(deriver.deriveAddress('test.testnet', 'ethereum'))
      .rejects.toThrow('Failed to derive address for ethereum: Contract error');
  });

  it('should consistently derive same address for same inputs', async () => {
    const mockPublicKey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    mockChainSignatureContract.getDerivedPublicKey.mockResolvedValue(mockPublicKey);

    const result1 = await deriver.deriveAddress('test.testnet', 'ethereum');
    const result2 = await deriver.deriveAddress('test.testnet', 'ethereum');

    expect(result1.address).toBe(result2.address);
    expect(result1.publicKey).toBe(result2.publicKey);
  });

  it('should handle multiple chain derivation with some failures', async () => {
    mockChainSignatureContract.getDerivedPublicKey
      .mockImplementationOnce(() => Promise.resolve('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'))
      .mockImplementationOnce(() => Promise.reject(new Error('Failed for bitcoin')))
      .mockImplementationOnce(() => Promise.resolve('1111111111111111111111111111111211111111111111111111111111111112'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await deriver.deriveMultipleAddresses('test.testnet', ['ethereum', 'bitcoin', 'solana']);

    expect(result).toHaveProperty('ethereum');
    expect(result).not.toHaveProperty('bitcoin'); // Failed derivation
    expect(result).toHaveProperty('solana');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to derive address for bitcoin'),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});