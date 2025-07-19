import { keccak256, getAddress } from 'viem';
import { PublicKey } from '@solana/web3.js';
import { encodeAccountID } from 'ripple-address-codec';
import * as bitcoin from 'bitcoinjs-lib';
import { Ed25519PublicKey } from '@aptos-labs/ts-sdk';

import { bech32 } from 'bech32';
import type { 
  SupportedChain, 
  DerivedAddress, 
  ChainConfig,
  ChainSignatureConfig 
} from '../types/chain-signatures';
import type { ChainSignatureContract } from './chain-signature-contract';

/**
 * Multi-chain address derivation utility
 * 
 * Derives addresses for different blockchain networks using NEAR Chain Signatures
 */
export class MultiChainAddressDeriver {
  private contract: ChainSignatureContract;
  private config: ChainSignatureConfig;

  constructor(contract: ChainSignatureContract, config: ChainSignatureConfig) {
    this.contract = contract;
    this.config = config;
  }

  /**
   * Derive address and public key for a specific chain
   */
  async deriveAddress(
    nearAccount: string,
    chain: SupportedChain,
    customPath?: string
  ): Promise<DerivedAddress> {
    const derivationPath = customPath || this.config.derivationPaths[chain];
    
    try {
      const chainConfig = this.config.supportedChains[chain];
      if (!chainConfig) {
        throw new Error(`Chain ${chain} is not configured`);
      }

      // Get derived public key from MPC contract
      const isEd25519Chain = this.isEd25519Chain(chain);
      const predecessor = nearAccount; // Use the NEAR account as predecessor
      const derivedPubKey = await this.contract.getDerivedPublicKey({
        path: derivationPath,
        predecessor,
        isEd25519: isEd25519Chain,
      });

      // Derive address based on chain type
      const address = await this.deriveAddressFromPublicKey(
        chain, 
        derivedPubKey, 
        chainConfig
      );

      return {
        chain,
        address,
        publicKey: derivedPubKey,
        derivationPath,
      };
    } catch (error) {
      console.error(`Failed to derive ${chain} address:`, error);
      throw new Error(`Failed to derive address for ${chain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive addresses for multiple chains
   */
  async deriveMultipleAddresses(
    predecessor: string,
    chains: SupportedChain[]
  ): Promise<Record<SupportedChain, DerivedAddress>> {
    const results: Record<SupportedChain, DerivedAddress> = {} as any;
    
    // Derive addresses in parallel
    await Promise.all(
      chains.map(async (chain) => {
        try {
          const derived = await this.deriveAddress(predecessor, chain);
          results[chain] = derived;
        } catch (error) {
          console.error(`Failed to derive address for ${chain}:`, error);
          // Don't fail the entire operation, just log the error
        }
      })
    );

    return results;
  }

  /**
   * Derive address from public key based on chain type
   */
  private async deriveAddressFromPublicKey(
    _chain: SupportedChain,
    publicKey: string,
    chainConfig: ChainConfig
  ): Promise<string> {
    const cleanPubKey = publicKey.replace('ed25519:', '').replace('secp256k1:', '');
    
    switch (chainConfig.type) {
      case 'evm':
        return this.deriveEVMAddress(cleanPubKey);
      
      case 'bitcoin':
        return this.deriveBitcoinAddress(cleanPubKey);
      
      case 'solana':
        return this.deriveSolanaAddress(cleanPubKey);
      
      case 'xrp':
        return this.deriveXRPAddress(cleanPubKey);
      
      case 'aptos':
        return this.deriveAptosAddress(cleanPubKey);
      
      case 'sui':
        return this.deriveSuiAddress(cleanPubKey);
      
      case 'near':
        return this.deriveNearAddress(cleanPubKey);
      
      case 'cosmos':
        return this.deriveCosmosAddress(cleanPubKey, chainConfig);
      
      default:
        throw new Error(`Unsupported chain type: ${chainConfig.type}`);
    }
  }

  /**
   * Derive EVM address from public key
   */
  private deriveEVMAddress(publicKey: string): string {
    try {
      // Remove '0x' prefix if present and ensure even length
      const cleanKey = publicKey.replace(/^0x/, '');
      const pubKeyBuffer = Buffer.from(cleanKey, 'hex');
      
      // For secp256k1, we need the uncompressed public key (65 bytes)
      let uncompressedPubKey: Buffer;
      
      if (pubKeyBuffer.length === 33) {
        // Compressed key - decompress it
        const { ECPair } = require('bitcoinjs-lib');
        const keyPair = ECPair.fromPublicKey(pubKeyBuffer);
        uncompressedPubKey = keyPair.publicKey;
      } else if (pubKeyBuffer.length === 65) {
        // Already uncompressed
        uncompressedPubKey = pubKeyBuffer;
      } else if (pubKeyBuffer.length === 64) {
        // Missing the 0x04 prefix for uncompressed key
        uncompressedPubKey = Buffer.concat([Buffer.from([0x04]), pubKeyBuffer]);
      } else {
        throw new Error(`Invalid public key length: ${pubKeyBuffer.length}`);
      }
      
      // Take the last 64 bytes (skip the 0x04 prefix) and hash with keccak256
      const pubKeyHash = keccak256(uncompressedPubKey.subarray(1));
      
      // Take the last 20 bytes as the address
      const addressBytes = pubKeyHash.slice(-20);
      
      // Convert to checksummed address
      return getAddress(`0x${Buffer.from(addressBytes).toString('hex')}`);
    } catch (error) {
      throw new Error(`Failed to derive EVM address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive Bitcoin address from public key
   */
  private deriveBitcoinAddress(publicKey: string): string {
    try {
      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      
      // Create P2WPKH (native segwit) address
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: pubKeyBuffer,
        network: bitcoin.networks.bitcoin, // Use testnet for testing
      });
      
      if (!address) {
        throw new Error('Failed to generate Bitcoin address');
      }
      
      return address;
    } catch (error) {
      throw new Error(`Failed to derive Bitcoin address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive Solana address from public key
   */
  private deriveSolanaAddress(publicKey: string): string {
    try {
      // For Ed25519, the public key is the address
      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      const solanaPublicKey = new PublicKey(pubKeyBuffer);
      return solanaPublicKey.toBase58();
    } catch (error) {
      throw new Error(`Failed to derive Solana address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive XRP address from public key
   */
  private deriveXRPAddress(publicKey: string): string {
    try {
      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      
      // XRP uses account ID encoding
      const accountId = encodeAccountID(pubKeyBuffer);
      return accountId;
    } catch (error) {
      throw new Error(`Failed to derive XRP address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive Aptos address from public key  
   */
  private deriveAptosAddress(publicKey: string): string {
    try {
      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      const aptosPublicKey = new Ed25519PublicKey(pubKeyBuffer);
      
      // Aptos address is the hash of the public key + 0x00
      const addressBytes = aptosPublicKey.toUint8Array();
      const fullBytes = new Uint8Array([...addressBytes, 0x00]);
      
      // Hash and take first 32 bytes as address
      const hash = keccak256(fullBytes);
      return `0x${hash.slice(2, 66)}`; // Remove 0x prefix and take first 32 bytes
    } catch (error) {
      throw new Error(`Failed to derive Aptos address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive Sui address from public key
   */
  private deriveSuiAddress(publicKey: string): string {
    try {
      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      
      // Sui address derivation is similar to Aptos but with different scheme
      const addressBytes = new Uint8Array([0x00, ...pubKeyBuffer]); // 0x00 for Ed25519
      const hash = keccak256(addressBytes);
      
      return `0x${hash.slice(2, 66)}`; // Take first 32 bytes
    } catch (error) {
      throw new Error(`Failed to derive Sui address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive NEAR address (just return the account ID)
   */
  private deriveNearAddress(publicKey: string): string {
    // For NEAR, we'd typically use the account ID that was used for derivation
    // This is a placeholder - in practice, you'd use the predecessor account
    return `${publicKey.slice(0, 8)}.near`;
  }

  /**
   * Derive Cosmos address from public key
   */
  private deriveCosmosAddress(publicKey: string, chainConfig: ChainConfig): string {
    try {
      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      
      // Cosmos uses bech32 encoding with different prefixes
      const prefix = this.getCosmosAddressPrefix(chainConfig.name);
      const hash = keccak256(pubKeyBuffer);
      const addressBytes = hash.slice(-20); // Last 20 bytes
      
      // Convert to bech32
      const words = bech32.toWords(Buffer.from(addressBytes));
      return bech32.encode(prefix, words);
    } catch (error) {
      throw new Error(`Failed to derive Cosmos address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Cosmos address prefix based on chain name
   */
  private getCosmosAddressPrefix(chainName: string): string {
    const prefixes: Record<string, string> = {
      'cosmos': 'cosmos',
      'osmosis': 'osmo',
      'juno': 'juno',
      'stargaze': 'stars',
      // Add more as needed
    };
    
    return prefixes[chainName.toLowerCase()] || 'cosmos';
  }

  /**
   * Check if a chain uses Ed25519 signatures
   */
  private isEd25519Chain(chain: SupportedChain): boolean {
    const ed25519Chains: SupportedChain[] = ['solana', 'aptos', 'sui', 'near'];
    return ed25519Chains.includes(chain);
  }

  /**
   * Get the key type for a chain
   */
  getKeyType(chain: SupportedChain): 'Ecdsa' | 'Eddsa' {
    return this.isEd25519Chain(chain) ? 'Eddsa' : 'Ecdsa';
  }

  /**
   * Validate a derived address format
   */
  validateAddress(chain: SupportedChain, address: string): boolean {
    try {
      const chainConfig = this.config.supportedChains[chain];
      if (!chainConfig) return false;

      switch (chainConfig.type) {
        case 'evm':
          return /^0x[a-fA-F0-9]{40}$/.test(address);
        
        case 'bitcoin':
          // Basic Bitcoin address validation (simplified)
          return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
        
        case 'solana':
          // Solana base58 address validation
          return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
        
        case 'xrp':
          // XRP address validation
          return /^r[a-zA-Z0-9]{24,34}$/.test(address);
        
        case 'aptos':
        case 'sui':
          return /^0x[a-fA-F0-9]{64}$/.test(address);
        
        case 'near':
          return /^[a-z0-9._-]+\.near$|^[a-fA-F0-9]{64}$/.test(address);
        
        case 'cosmos':
          // Bech32 validation
          return /^[a-z]+1[a-z0-9]{38,58}$/.test(address);
        
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}

/**
 * Default chain configurations
 */
export const DEFAULT_CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  ethereum: {
    chainId: '1',
    name: 'Ethereum',
    type: 'evm',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  polygon: {
    chainId: '137',
    name: 'Polygon',
    type: 'evm',
    rpcUrl: 'https://polygon.llamarpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  arbitrum: {
    chainId: '42161',
    name: 'Arbitrum',
    type: 'evm',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  optimism: {
    chainId: '10',
    name: 'Optimism',
    type: 'evm',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  bsc: {
    chainId: '56',
    name: 'Binance Smart Chain',
    type: 'evm',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  bitcoin: {
    chainId: 'bitcoin',
    name: 'Bitcoin',
    type: 'bitcoin',
    rpcUrl: 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  },
  solana: {
    chainId: 'solana',
    name: 'Solana',
    type: 'solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  },
  xrp: {
    chainId: 'xrp',
    name: 'XRP Ledger',
    type: 'xrp',
    rpcUrl: 'wss://xrplcluster.com',
    explorerUrl: 'https://xrpscan.com',
    nativeCurrency: { name: 'XRP', symbol: 'XRP', decimals: 6 },
  },
  aptos: {
    chainId: 'aptos',
    name: 'Aptos',
    type: 'aptos',
    rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
    explorerUrl: 'https://explorer.aptoslabs.com',
    nativeCurrency: { name: 'Aptos', symbol: 'APT', decimals: 8 },
  },
  sui: {
    chainId: 'sui',
    name: 'Sui',
    type: 'sui',
    rpcUrl: 'https://fullnode.mainnet.sui.io',
    explorerUrl: 'https://suiexplorer.com',
    nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 },
  },
  near: {
    chainId: 'near',
    name: 'NEAR',
    type: 'near',
    rpcUrl: 'https://rpc.mainnet.near.org',
    explorerUrl: 'https://explorer.near.org',
    nativeCurrency: { name: 'NEAR', symbol: 'NEAR', decimals: 24 },
  },
};

/**
 * Default derivation paths for each chain
 */
export const DEFAULT_DERIVATION_PATHS: Record<SupportedChain, string> = {
  ethereum: 'ethereum-1',
  polygon: 'polygon-1',
  arbitrum: 'arbitrum-1', 
  optimism: 'optimism-1',
  bsc: 'bsc-1',
  bitcoin: 'bitcoin-1',
  solana: 'solana-1',
  xrp: 'xrp-1',
  aptos: 'aptos-1',
  sui: 'sui-1',
  near: 'near-1',
};
