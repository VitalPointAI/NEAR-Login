import React, { type ReactNode } from 'react';
import { useNEARStakingAuthStore } from '../store/auth';
import type { AuthConfig } from '../types';

export interface ProtectedRouteProps {
  children: ReactNode;
  config?: AuthConfig;
  fallback?: ReactNode;
  requireStaking?: boolean;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
      <p className="text-gray-600">
        This route requires NEAR wallet authentication and staking.
      </p>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  config,
  fallback = <DefaultFallback />,
  requireStaking = true,
}) => {
  const { 
    isLoading, 
    isConnected, 
    isStaked,
    initialize 
  } = useNEARStakingAuthStore();

  // Initialize if config is provided and not already initialized
  React.useEffect(() => {
    if (config) {
      initialize(config);
    }
  }, [config, initialize]);

  // Still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user meets requirements
  const hasAccess = isConnected && (requireStaking ? isStaked : true);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
