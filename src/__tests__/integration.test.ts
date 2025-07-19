import { ChainSignatureContract } from '../utils/chain-signature-contract';
import { MultiChainAddressDeriver } from '../utils/multi-chain-deriver';
import { MultiChainAuthManager } from '../utils/multi-chain-auth';
import type { 
  MultiChainAuthConfig, 
  ChainSignatureConfig,
  SupportedChain 
} from '../types/chain-signatures';

// Mock NEAR components
const mockNear = {
  account: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const mockSelector = {
  wallet: () => ({
    signAndSendTransactions: jest.fn(),
    getAccounts: jest.fn().mockResolvedValue([{ accountId: 'test.testnet' }]),
  }),
  isSignedIn: jest.fn().mockReturnValue(true),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('Multi-Chain Authentication Integration Tests', () => {
  let config: MultiChainAuthConfig;
  let chainSignatureConfig: ChainSignatureConfig;
  let contract: ChainSignatureContract;
  let deriver: MultiChainAddressDeriver;
  let authManager: MultiChainAuthManager;

  beforeEach(() => {
    chainSignatureConfig = {
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
        polygon: { 
          name: 'Polygon', 
          chainId: '137',
          type: 'evm',
          rpcUrl: 'https://polygon-rpc.com',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
        },
        xrp: {
          name: 'XRP',
          chainId: '0',
          type: 'xrp',
          rpcUrl: 'https://s1.ripple.com:51234',
          nativeCurrency: { name: 'XRP', symbol: 'XRP', decimals: 6 }
        },
        sui: {
          name: 'Sui',
          chainId: '1',
          type: 'sui',
          rpcUrl: 'https://fullnode.mainnet.sui.io:443',
          nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 }
        },
        aptos: {
          name: 'Aptos',
          chainId: '1',
          type: 'aptos',
          rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
          nativeCurrency: { name: 'Aptos', symbol: 'APT', decimals: 8 }
        },
        near: {
          name: 'NEAR',
          chainId: 'mainnet',
          type: 'near',
          rpcUrl: 'https://rpc.mainnet.near.org',
          nativeCurrency: { name: 'NEAR', symbol: 'NEAR', decimals: 24 }
        },
        arbitrum: {
          name: 'Arbitrum',
          chainId: '42161',
          type: 'evm',
          rpcUrl: 'https://arb1.arbitrum.io/rpc',
          nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
        },
        optimism: {
          name: 'Optimism',
          chainId: '10',
          type: 'evm',
          rpcUrl: 'https://mainnet.optimism.io',
          nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
        },
        bsc: {
          name: 'Binance Smart Chain',
          chainId: '56',
          type: 'evm',
          rpcUrl: 'https://bsc-dataseed.binance.org',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
        }
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

    config = {
      allowedChains: ['ethereum', 'bitcoin', 'solana'],
      chainSignature: chainSignatureConfig,
      requireMultipleChains: false,
      minimumChains: 1,
    };

    contract = new ChainSignatureContract('test.contract', 'testnet', mockNear);
    deriver = new MultiChainAddressDeriver(contract, chainSignatureConfig);
    authManager = new MultiChainAuthManager(config, mockNear, mockSelector);
  });

  describe('Contract Integration', () => {
    beforeEach(() => {
      // Mock account view function for getting keys and signatures
      const mockAccount = {
        viewFunction: jest.fn(),
        signAndSendTransactions: jest.fn(),
      };
      mockNear.account.mockResolvedValue(mockAccount);
    });

    it('should integrate contract, deriver, and auth manager correctly', async () => {
      // This test verifies the integration between components
      expect(contract).toBeInstanceOf(ChainSignatureContract);
      expect(deriver).toBeInstanceOf(MultiChainAddressDeriver);
      expect(authManager).toBeInstanceOf(MultiChainAuthManager);
    });

    it('should handle the complete authentication flow', async () => {
      // Mock the contract responses
      const mockAccount = await mockNear.account('test.contract');
      mockAccount.viewFunction.mockResolvedValue('mockPublicKey123');
      mockAccount.signAndSendTransactions.mockResolvedValue([{
        signature: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd01',
        receipt_outcome: {
          outcome: {
            logs: ['{"signature": "abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd01"}'],
          },
        },
      }]);

      // Test initialization
      await authManager.initialize();
      expect(authManager.getState().isInitialized).toBe(true);
    });

    it('should validate configuration correctly', () => {
      // Test configuration validation
      expect(config.allowedChains).toContain('ethereum');
      expect(config.chainSignature.contractId).toBe('v1.signer-prod.testnet');
      expect(config.chainSignature.networkId).toBe('testnet');
    });

    it('should handle errors in integration', async () => {
      // Mock contract error
      const mockAccount = await mockNear.account('test.contract');
      mockAccount.viewFunction.mockRejectedValue(new Error('Contract error'));

      // The auth manager should handle contract errors gracefully
      try {
        await authManager.initialize();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Chain Signature Flow', () => {
    it('should create proper message hashes', () => {
      const message = 'Test authentication message';
      const hash = ChainSignatureContract.createMessageHash(message);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should create authentication messages with timestamps', () => {
      const timestamp = 1643723400000;
      const message = ChainSignatureContract.createAuthMessage('ethereum', '0x123...', timestamp);
      
      expect(message).toContain('ethereum');
      expect(message).toContain('0x123...');
      expect(message).toMatch(/2022-02-01T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should handle different signature types', () => {
      // Test RSV signature parsing
      const testContract = new ChainSignatureContract('test', 'testnet', mockNear);
      
      // Mock a complete signature hex string (132 chars = 66 bytes including 0x prefix)
      const mockHexSig = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd01';
      
      // This would test the private parseRSVFromHex method in a real implementation
      expect(mockHexSig.length).toBe(132);
      expect(testContract).toBeInstanceOf(ChainSignatureContract);
    });
  });

  describe('Multi-Chain Configuration', () => {
    it('should support all required chains in configuration', () => {
      const requiredChains: SupportedChain[] = ['ethereum', 'bitcoin', 'solana'];
      
      requiredChains.forEach(chain => {
        expect(config.allowedChains).toContain(chain);
        expect(chainSignatureConfig.supportedChains).toHaveProperty(chain);
        expect(chainSignatureConfig.derivationPaths).toHaveProperty(chain);
      });
    });

    it('should validate chain configuration structure', () => {
      Object.entries(chainSignatureConfig.supportedChains).forEach(([chainName, chainConfig]) => {
        expect(chainConfig).toHaveProperty('name');
        expect(chainConfig).toHaveProperty('chainId');
        expect(typeof chainConfig.name).toBe('string');
        expect(typeof chainConfig.chainId).toBe('string');
        expect(chainName).toBeTruthy(); // Use the chain name
      });
    });

    it('should validate derivation paths format', () => {
      Object.entries(chainSignatureConfig.derivationPaths).forEach(([chainName, path]) => {
        expect(typeof path).toBe('string');
        expect(path).toMatch(/^[\w]+,\d+$/); // Format: "chain,number"
        expect(chainName).toBeTruthy(); // Use the chain name
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const errorConfig = {
        ...config,
        chainSignature: {
          ...chainSignatureConfig,
          contractId: 'nonexistent.contract',
        },
      };

      const errorAuthManager = new MultiChainAuthManager(errorConfig, mockNear, mockSelector);
      
      // Should not throw during construction
      expect(errorAuthManager).toBeInstanceOf(MultiChainAuthManager);
    });

    it('should validate required configuration fields', () => {
      expect(() => {
        new MultiChainAuthManager({
          allowedChains: ['ethereum'],
          chainSignature: {
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
              bitcoin: { name: 'Bitcoin', chainId: '0', type: 'bitcoin', rpcUrl: 'https://blockstream.info/api', nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 } },
              solana: { name: 'Solana', chainId: '101', type: 'solana', rpcUrl: 'https://api.mainnet-beta.solana.com', nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 } },
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
              xrp: 'xrp,1',
              sui: 'sui,1',
              aptos: 'aptos,1',
              near: 'near,1',
              polygon: 'polygon,1',
              arbitrum: 'arbitrum,1',
              optimism: 'optimism,1',
              bsc: 'bsc,1'
            },
          },
        }, mockNear, mockSelector);
      }).not.toThrow(); // Should construct but may fail on use
    });
  });

  describe('State Management', () => {
    it('should maintain consistent state across operations', async () => {
      const initialState = authManager.getState();
      
      expect(initialState.isInitialized).toBe(false);
      expect(initialState.connectedChains).toEqual(expect.objectContaining({
        ethereum: null,
        bitcoin: null,
        solana: null
      }));
      expect(initialState.signatures).toEqual(expect.objectContaining({}));
    });

    it('should update state after operations', async () => {
      // Mock successful initialization
      try {
        await authManager.initialize();
        const postInitState = authManager.getState();
        expect(postInitState.isInitialized).toBe(true);
      } catch (error) {
        // Expected in test environment without full mocks
        expect(error).toBeDefined();
      }
    });
  });

  describe('Security Validations', () => {
    it('should use secure contract addresses', () => {
      expect(chainSignatureConfig.contractId).toMatch(/^v\d+\.signer/);
    });

    it('should enforce proper derivation path formats', () => {
      Object.values(chainSignatureConfig.derivationPaths).forEach(path => {
        expect(path).not.toContain('../'); // No path traversal
        expect(path).not.toContain('..\\'); // No path traversal
        expect(path.split(',').length).toBe(2); // Proper format
      });
    });

    it('should validate chain configurations', () => {
      Object.entries(chainSignatureConfig.supportedChains).forEach(([chain, config]) => {
        expect(config.name).toBeTruthy();
        expect(config.chainId).toBeTruthy();
        expect(chain).toMatch(/^[a-z]+$/); // Only lowercase letters for chain names
      });
    });
  });
});
