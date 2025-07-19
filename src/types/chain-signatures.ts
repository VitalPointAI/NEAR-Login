// Multi-chain signature types and interfaces
import type { SessionSecurityConfig, SessionData } from '../types';

export type SupportedChain = 
  | 'ethereum' 
  | 'bitcoin' 
  | 'solana' 
  | 'xrp' 
  | 'sui' 
  | 'aptos' 
  | 'near'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'bsc';

export type ChainKeyType = 'Ecdsa' | 'Eddsa';

export interface ChainConfig {
  chainId: string;
  name: string;
  type: 'evm' | 'bitcoin' | 'solana' | 'xrp' | 'sui' | 'aptos' | 'near' | 'cosmos';
  rpcUrl: string;
  explorerUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ChainSignatureConfig {
  // MPC contract configuration
  contractId: string; // 'v1.signer' for mainnet, 'v1.signer-prod.testnet' for testnet
  networkId: 'mainnet' | 'testnet';
  
  // Supported chains configuration
  supportedChains: Record<SupportedChain, ChainConfig>;
  
  // Default derivation paths
  derivationPaths: Record<SupportedChain, string>;
  
  // Chain signature specific settings
  maxSignatureRetries?: number;
  signatureTimeout?: number; // in milliseconds
}

export interface ChainSignatureOptions {
  chain?: SupportedChain;
  derivationPath?: string;
  message?: string; // Custom message to sign
  useTypedData?: boolean; // For EVM chains
}

export interface DerivedAddress {
  chain: SupportedChain;
  address: string;
  publicKey: string;
  derivationPath: string;
}

export interface ChainSignatureRequest {
  chain: SupportedChain;
  message: string | Uint8Array;
  derivationPath: string;
  keyType: 'Ecdsa' | 'Eddsa';
}

export interface ChainSignatureResult {
  signature: {
    r: string;
    s: string;
    v: number;
  };
  chain: SupportedChain;
  address: string;
  message: string;
  timestamp: number;
}

export interface MultiChainAuthState {
  connectedChains: Record<SupportedChain, DerivedAddress | null>;
  activeChain: SupportedChain | null;
  signatures: Record<SupportedChain, ChainSignatureResult | null>;
  isInitialized: boolean;
  isConnecting: boolean;
}

export interface MultiChainAuthConfig extends SessionSecurityConfig {
  // Chain signature configuration
  chainSignature: ChainSignatureConfig;
  
  // Authentication requirements
  allowedChains?: SupportedChain[]; // If specified, only these chains are allowed
  requireMultipleChains?: boolean; // Require signatures from multiple chains
  minimumChains?: number; // Minimum number of chains required
  
  // Enhanced security for multi-chain
  crossChainVerification?: boolean; // Verify signatures across chains
  chainLinking?: boolean; // Link addresses across chains for same user
}

// Extended session data for multi-chain support
export interface MultiChainSessionData extends SessionData {
  // Multi-chain specific data
  connectedChains: Record<SupportedChain, DerivedAddress | null>;
  activeChain: SupportedChain | null;
  chainSignatures: Record<SupportedChain, ChainSignatureResult | null>;
  
  // Cross-chain verification
  chainLinkingProof?: string; // Proof that all addresses belong to same user
  crossChainHash?: string; // Hash linking all connected chains
}

// Error types for chain signatures
export type ChainSignatureErrorCode =
  | 'CHAIN_NOT_SUPPORTED'
  | 'DERIVATION_FAILED'
  | 'SIGNATURE_FAILED'
  | 'MPC_TIMEOUT'
  | 'INVALID_CHAIN_CONFIG'
  | 'CROSS_CHAIN_VERIFICATION_FAILED'
  | 'INSUFFICIENT_CHAINS'
  | 'CHAIN_CONNECTION_FAILED'
  | 'CHAIN_SWITCH_FAILED';

export interface ChainSignatureError extends Error {
  name: 'ChainSignatureError';
  message: string;
  code: ChainSignatureErrorCode;
  chain?: SupportedChain;
  originalError?: Error;
}

// Chain-specific transaction types
export interface EVMTransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
}

export interface BitcoinTransactionRequest {
  to: string;
  amount: number; // in satoshis
  feeRate?: number; // sat/byte
  utxos?: UTXO[];
}

export interface UTXO {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: string;
}

export interface SolanaTransactionRequest {
  to: string;
  amount: number; // in lamports
  instructions?: unknown[]; // Additional Solana instructions
}

export interface XRPTransactionRequest {
  to: string;
  amount: string; // in XRP
  destinationTag?: number;
  memo?: string;
}

export interface AptosTransactionRequest {
  to: string;
  amount: number; // in octas
  coinType?: string;
}

export interface SuiTransactionRequest {
  to: string;
  amount: number; // in MIST
  objectIds?: string[];
}

// Union type for all transaction requests
export type ChainTransactionRequest = 
  | { chain: 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'bsc'; tx: EVMTransactionRequest }
  | { chain: 'bitcoin'; tx: BitcoinTransactionRequest }
  | { chain: 'solana'; tx: SolanaTransactionRequest }
  | { chain: 'xrp'; tx: XRPTransactionRequest }
  | { chain: 'aptos'; tx: AptosTransactionRequest }
  | { chain: 'sui'; tx: SuiTransactionRequest };
