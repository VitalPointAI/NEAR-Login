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

export interface SecurityViolation {
  type: 'device_mismatch' | 'ip_mismatch' | 'session_expired' | 'idle_timeout' | 'reauth_required' | 'concurrent_session';
  message: string;
  timestamp: number;
}

export interface SessionSecurityConfig {
  // Session expiration and refresh
  maxAge?: number; // Maximum session age in milliseconds (default: 7 days)
  idleTimeout?: number; // Idle timeout in milliseconds (default: 24 hours)
  refreshThreshold?: number; // Refresh token when this close to expiration (default: 25% of maxAge)
  
  // Device and location binding
  deviceFingerprinting?: boolean; // Enable device fingerprinting (default: true)
  bindToIP?: boolean; // Bind session to IP address (default: false - can break mobile)
  requireReauth?: number; // Require re-authentication after this time in milliseconds
  
  // Storage security
  encryptStorage?: boolean; // Encrypt session data in localStorage (default: true)
  secureStorage?: boolean; // Use sessionStorage instead of localStorage (default: false)
  
  // Session validation
  validateOnFocus?: boolean; // Validate session when window gains focus (default: true)
  validateInterval?: number; // Background validation interval in milliseconds (default: 5 minutes)
  validateWithBackend?: string; // Backend endpoint for session validation
  
  // Cleanup and rotation
  rotateTokens?: boolean; // Rotate session tokens periodically (default: false)
  preventConcurrent?: boolean; // Prevent multiple concurrent sessions (default: false)
  clearOnError?: boolean; // Clear session on authentication errors (default: true)
  
  // Event handlers
  onSecurityViolation?: (violation: SecurityViolation) => void;
  onSessionExpired?: () => void;
  
  // Development vs Production
  allowInsecure?: boolean; // Allow insecure practices in development (default: false)
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
    duration?: number; // Session duration in milliseconds (DEPRECATED - use security.maxAge)
    storageKey?: string; // Local storage key for session
    rememberSession?: boolean; // Whether to persist sessions across browser sessions (default: true)
  };
  sessionSecurity?: SessionSecurityConfig; // Enhanced security configuration
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
  
  // Security metadata
  createdAt: number;          // When session was created
  lastActivity: number;       // Last activity timestamp
  timestamp?: number;         // Session creation timestamp (for compatibility)
  deviceFingerprint?: string; // Device fingerprint hash
  ipAddress?: string;         // IP address when session was created
  sessionId?: string;         // Unique session identifier
  refreshCount: number;       // Number of times session has been refreshed
  version: string;            // Session format version for migration
  
  // User data for convenience
  user?: {
    accountId: string;
    balance?: string;
    isStaked: boolean;
  };
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
