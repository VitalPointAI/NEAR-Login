import React, { useEffect, type ReactNode } from 'react';
import { useNEARStakingAuthStore } from '../store/auth';
import type { AuthConfig, ToastNotification } from '../types';

export interface NEARLoginProps {
  config: AuthConfig;
  children: ReactNode;
  onToast?: (toast: ToastNotification) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string, retry: () => void) => ReactNode;
  renderUnauthorized?: (signIn: () => Promise<void>, stake?: (amount: string) => Promise<void>) => ReactNode;
}

const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p className="text-gray-600">Initializing NEAR authentication...</p>
    </div>
  </div>
);

const DefaultErrorComponent = ({ error, retry }: { error: string; retry: () => void }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const DefaultUnauthorizedComponent = ({ 
  signIn, 
  stake, 
  config 
}: { 
  signIn: () => Promise<void>; 
  stake?: (amount: string) => Promise<void>;
  config: AuthConfig;
}) => {
  const { isConnected, accountId, stakingInfo, isLoading } = useNEARStakingAuthStore();
  const [stakeAmount, setStakeAmount] = React.useState('');
  
  // Check if staking is required
  const requiresStaking = config ? (config.requireStaking !== false && config.validator) : false;
  const stakingRequired = requiresStaking && (config?.validator?.required !== false);

  const handleStake = () => {
    if (stakeAmount && parseFloat(stakeAmount) > 0 && stake) {
      stake(stakeAmount);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-xl font-semibold mb-4">NEAR Wallet Required</h2>
          <p className="text-gray-600 mb-6">
            Please connect your NEAR wallet to continue.
            {stakingRequired && config?.validator && (
              <span> You'll need to have tokens staked with{' '}
                <strong>{config.validator?.displayName || config.validator?.poolId}</strong> to access this application.
              </span>
            )}
          </p>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  // If staking is not required, show a different message
  if (!stakingRequired) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-4">Wallet Connected</h2>
          <p className="text-gray-600 mb-6">
            Welcome <strong>{accountId}</strong>! Your wallet is connected but there seems to be an issue with authentication.
          </p>
          <button
            onClick={() => useNEARStakingAuthStore.getState().signOut()}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Staking is required
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🥩</div>
        <h2 className="text-xl font-semibold mb-4">Staking Required</h2>
        <p className="text-gray-600 mb-4">
          Welcome <strong>{accountId}</strong>! To access this application, you need to stake NEAR tokens with{' '}
          <strong>{config.validator?.displayName || config.validator?.poolId}</strong>.
        </p>
        
        {stakingInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium mb-2">Your Staking Status:</h3>
            <div className="text-sm space-y-1">
              <div>Staked: {stakingInfo.stakedAmount} NEAR</div>
              <div>Unstaked: {stakingInfo.unstakedAmount} NEAR</div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Stake (NEAR)
          </label>
          <input
            id="stakeAmount"
            type="number"
            step="0.01"
            min={config.validator?.minStake || "0.1"}
            placeholder="Enter amount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          {stake && (
            <button
              onClick={handleStake}
              disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Staking...' : `Stake ${stakeAmount || '...'} NEAR`}
            </button>
          )}
          
          <button
            onClick={() => useNEARStakingAuthStore.getState().signOut()}
            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Minimum stake required: {config.validator?.minStake || '1'} NEAR
        </p>
      </div>
    </div>
  );
};

export const NEARLogin: React.FC<NEARLoginProps> = ({
  config,
  children,
  onToast,
  renderLoading = DefaultLoadingComponent,
  renderError = (error, retry) => <DefaultErrorComponent error={error} retry={retry} />,
  renderUnauthorized = (signIn, stake) => <DefaultUnauthorizedComponent signIn={signIn} stake={stake} config={config} />,
}) => {
  const {
    isLoading,
    isConnected,
    isAuthenticated,
    isStaked,
    error,
    initialize,
    signIn,
    stakeTokens,
    setToastHandler,
  } = useNEARStakingAuthStore();

  useEffect(() => {
    if (onToast) {
      setToastHandler(onToast);
    }
  }, [onToast, setToastHandler]);

  useEffect(() => {
    initialize(config);
  }, [config, initialize]);

  // Show loading while initializing
  if (isLoading && !isConnected) {
    return <>{renderLoading()}</>;
  }

  // Show error if initialization failed
  if (error && !isConnected) {
    return <>{renderError(error, () => initialize(config))}</>;
  }

  // Determine authentication requirements
  const requiresStaking = config ? (config.requireStaking !== false && config.validator) : false;
  const stakingRequired = requiresStaking && (config?.validator?.required !== false);
  
  // Check if user meets authentication requirements
  const isFullyAuthenticated = isConnected && (stakingRequired ? (isAuthenticated && isStaked) : isAuthenticated);

  // Show unauthorized if requirements not met
  if (!isFullyAuthenticated) {
    return <>{renderUnauthorized(signIn, stakingRequired ? stakeTokens : undefined)}</>;
  }

  // User is authenticated - show the protected content
  return <>{children}</>;
};

export default NEARLogin;
