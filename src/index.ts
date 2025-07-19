// Main components
export { NEARLogin } from './components/NEARLogin';
export type { NEARLoginProps } from './components/NEARLogin';

export { ProtectedRoute } from './components/ProtectedRoute';
export type { ProtectedRouteProps } from './components/ProtectedRoute';

// Hooks
export { useNEARLogin } from './hooks/useNEARLogin';

// Multi-chain authentication hooks
export { useMultiChainAuth, useSimpleMultiChainAuth } from './hooks/useMultiChainAuth';

// Multi-chain authentication classes
export { MultiChainAuthManager } from './utils/multi-chain-auth';
export { ChainSignatureContract, createChainSignatureContract } from './utils/chain-signature-contract';
export { MultiChainAddressDeriver } from './utils/multi-chain-deriver';

// Legacy exports (deprecated - use NEARLogin instead)
export { NEARLogin as NEARStakingAuth } from './components/NEARLogin';
export type { NEARLoginProps as NEARStakingAuthProps } from './components/NEARLogin';
export { useNEARLogin as useNEARStakingAuth } from './hooks/useNEARLogin';

// Types
export type {
  NEARConfig,
  ValidatorConfig,
  StakingInfo,
  AuthState,
  AuthConfig,
  ToastNotification,
  UseNEARLogin,
  // Legacy type exports
  UseNEARLogin as UseNEARStakingAuth,
} from './types';

// Multi-chain type exports
export type {
  SupportedChain,
  ChainConfig,
  ChainKeyType,
  MultiChainAuthConfig,
  ChainSignatureConfig,
  MultiChainSessionData,
  DerivedAddress,
  ChainSignatureOptions,
  ChainSignatureRequest,
  ChainSignatureResult,
  MultiChainAuthState,
  ChainSignatureError,
  ChainSignatureErrorCode,
  // Transaction types
  EVMTransactionRequest,
  BitcoinTransactionRequest,
  SolanaTransactionRequest,
  XRPTransactionRequest,
  AptosTransactionRequest,
  SuiTransactionRequest,
} from './types/chain-signatures';

// Store (for advanced usage)
export { useNEARStakingAuthStore } from './store/auth';

// Utilities
export {
  formatNearAmount,
  stakeTokens,
  unstakeTokens,
  getStakingInfo,
  validateStakingAmount,
  createNearConnection,
  DEFAULT_NEAR_CONFIG,
} from './utils/near';

// Multi-chain default configurations
export { DEFAULT_CHAIN_CONFIGS, DEFAULT_DERIVATION_PATHS } from './utils/multi-chain-deriver';
