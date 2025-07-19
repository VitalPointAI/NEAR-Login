import React from 'react';
import { NEARStakingAuth, useNEARStakingAuth, ProtectedRoute } from '@vitalpointai/near-staking-auth';

// Configuration for your validator
const config = {
  validator: {
    poolId: 'vitalpoint.pool.near',
    displayName: 'VitalPoint Validator',
    description: 'Stake with VitalPoint to support NEAR ecosystem growth'
  },
  nearConfig: {
    networkId: 'mainnet' as const
  },
  walletConnectOptions: {
    theme: 'auto' as const
  }
};

// Example 1: Simple app wrapper
function SimpleApp() {
  return (
    <NEARStakingAuth config={config}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Protected App!</h1>
        <p>Only users staked with VitalPoint validator can see this content.</p>
      </div>
    </NEARStakingAuth>
  );
}

// Example 2: Using the hook for user info
function UserDashboard() {
  const { 
    isAuthenticated, 
    accountId, 
    stakingInfo, 
    signOut, 
    refresh,
    stake,
    canStake
  } = useNEARStakingAuth();

  const [stakeAmount, setStakeAmount] = React.useState('1');

  const handleStake = async () => {
    try {
      await stake(stakeAmount);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  if (!isAuthenticated) {
    return <div>Please connect and stake to continue...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Welcome, {accountId}!</h2>
      
      {stakingInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Your Staking Info:</h3>
          <div className="text-sm space-y-1">
            <div>Staked: {stakingInfo.stakedAmount} NEAR</div>
            <div>Unstaked: {stakingInfo.unstakedAmount} NEAR</div>
            <div>Status: {stakingInfo.isStaking ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
      )}

      {canStake && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Additional Stake Amount (NEAR):
          </label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full p-2 border rounded"
            min="0.1"
            step="0.1"
          />
          <button
            onClick={handleStake}
            className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Stake {stakeAmount} NEAR
          </button>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={refresh}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Refresh Staking Info
        </button>
        <button
          onClick={signOut}
          className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Example 3: Protected routes
function AdminPanel() {
  return (
    <ProtectedRoute
      fallback={
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p>Admin panel requires staking with VitalPoint validator</p>
        </div>
      }
    >
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p>This is sensitive admin content only for staked users.</p>
      </div>
    </ProtectedRoute>
  );
}

// Example 4: Custom toast integration (with react-hot-toast)
import { toast } from 'react-hot-toast';

function AppWithToasts() {
  const handleToast = (notification: any) => {
    switch (notification.variant) {
      case 'success':
        toast.success(notification.description, { 
          duration: 4000 
        });
        break;
      case 'destructive':
        toast.error(notification.description, { 
          duration: 6000 
        });
        break;
      default:
        toast(notification.description, { 
          duration: 4000 
        });
    }
  };

  return (
    <NEARStakingAuth 
      config={config}
      onToast={handleToast}
    >
      <UserDashboard />
    </NEARStakingAuth>
  );
}

// Example 5: Custom loading and error components
function AppWithCustomUI() {
  return (
    <NEARStakingAuth 
      config={config}
      renderLoading={() => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Connecting to NEAR...</p>
          </div>
        </div>
      )}
      renderError={(error, retry) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-8xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={retry}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      renderUnauthorized={(signIn, stake, config) => (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center max-w-lg p-8 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-3xl font-bold mb-4">Welcome to VitalPoint App</h1>
            <p className="text-gray-600 mb-6">
              To access this application, please connect your wallet and stake NEAR tokens 
              with <strong>{config.validator.displayName}</strong>.
            </p>
            <button
              onClick={signIn}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Connect Wallet & Stake
            </button>
          </div>
        </div>
      )}
    >
      <UserDashboard />
    </NEARStakingAuth>
  );
}

export { 
  SimpleApp, 
  UserDashboard, 
  AdminPanel, 
  AppWithToasts, 
  AppWithCustomUI 
};
