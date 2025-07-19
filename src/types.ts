import type { ReactNode } from 'react';

export interface NEARConfig {
  networkId: 'mainnet' | 'testnet';
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
}

export interface ValidatorConfig {
  poolId: string;           // e.g., 'vitalpoint.pool.near'
  displayName?: string;     // Human-readable name for display
  description?: string;     // Description of the validator
  required?: boolean;       // Whether staking with this validator is required (default: true)
  minStake?: string;        // Minimum stake amount required (in NEAR)
}

export interface StakingInfo {
  accountId: string;
  stakedAmount: string;
  unstakedAmount: string;
  availableForWithdrawal: string;
  rewards: string;
  isStaking: boolean;
  poolId: string;
}

export interface AuthConfig {
  validator?: ValidatorConfig;  // Optional - if not provided, only wallet connection required
  nearConfig?: Partial<NEARConfig>;
  backend?: AuthBackendConfig;
  walletConnectOptions?: {
    contractId?: string;
    theme?: 'auto' | 'light' | 'dark';
  };
  sessionConfig?: {
    duration?: number; // Session duration in milliseconds
    storageKey?: string; // Local storage key for session
    rememberSession?: boolean; // Whether to persist sessions across browser sessions (default: true)
  };
  requireStaking?: boolean; // Global flag to require staking (default: true if validator provided, false otherwise)
}

export interface AuthState {
  isLoading: boolean;
  isConnected: boolean;
  accountId: string | null;
  isAuthenticated: boolean;
  isStaked: boolean;
  stakingInfo: StakingInfo | null;
  sessionToken: string | null;
  error: string | null;
}

export interface SessionData {
  accountId: string;
  isStaked: boolean;
  stakingInfo?: StakingInfo;  // Optional since staking might not be required
  expiresAt: number;
  signature?: string;
  validatorUsed?: string;     // Track which validator was used for staking check
}

export interface AuthBackendConfig {
  backendUrl?: string;
  sessionEndpoint?: string;
  verifyEndpoint?: string;
  stakingEndpoint?: string;
}

export interface ToastNotification {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export interface NEARLoginProps {
  children: ReactNode;
  config: AuthConfig;
  onToast?: (toast: ToastNotification) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string, retry: () => void) => ReactNode;
  renderUnauthorized?: (signIn: () => Promise<void>, stake?: (amount: string) => Promise<void>, config?: AuthConfig) => ReactNode;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireStaking?: boolean;
}

export interface WalletState {
  isConnected: boolean;
  accountId: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
}

// Hook return types
export interface UseNEARLogin extends AuthState {
  canStake: boolean;
  requiresStaking: boolean;  // Whether staking is required based on config
  config: AuthConfig | null;
  
  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  stake: (amount: string) => Promise<void>;
  unstake: (amount: string) => Promise<void>;
  refresh: () => Promise<void>;
  initialize: (config: AuthConfig) => Promise<void>;
  
  // Utilities
  getStakedAmount: () => string;
  getUnstakedAmount: () => string;
  getValidatorInfo: () => ValidatorConfig | null;
}
