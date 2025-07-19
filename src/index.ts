// Main components
export { NEARLogin } from './components/NEARLogin';
export type { NEARLoginProps } from './components/NEARLogin';

export { ProtectedRoute } from './components/ProtectedRoute';
export type { ProtectedRouteProps } from './components/ProtectedRoute';

// Hooks
export { useNEARLogin } from './hooks/useNEARLogin';

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
