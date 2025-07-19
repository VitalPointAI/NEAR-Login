import React from 'react';
import { NEARStakingAuth, useNEARStakingAuth } from '@vitalpointai/near-staking-auth';

// Configuration with session-based authentication
const config = {
  validator: {
    poolId: 'vitalpoint.pool.near',
    displayName: 'VitalPoint Validator'
  },
  nearConfig: {
    networkId: 'mainnet' as const
  },
  // Optional: Configure session behavior
  sessionConfig: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
    storageKey: 'my-app-near-session'
  },
  // Optional: Backend integration for server-side session verification
  backend: {
    backendUrl: 'https://your-api.com',
    sessionEndpoint: '/auth/create-session',
    verifyEndpoint: '/auth/verify-session',
    stakingEndpoint: '/auth/check-staking'
  }
};

// Component showing session-based authentication state
function SessionInfo() {
  const { 
    isLoading,
    isConnected,
    isAuthenticated, 
    accountId, 
    sessionToken,
    stakingInfo,
    signOut 
  } = useNEARStakingAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Session Status</h2>
      
      <div className="space-y-2 mb-4">
        <div>
          <strong>Account:</strong> {accountId}
        </div>
        <div>
          <strong>Connected:</strong> {isConnected ? '✅' : '❌'}
        </div>
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? '✅ Session Active' : '❌ No Session'}
        </div>
        <div>
          <strong>Session Token:</strong> {sessionToken ? `${sessionToken.slice(0, 10)}...` : 'None'}
        </div>
      </div>

      {stakingInfo && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Staking Info:</h3>
          <div className="text-sm space-y-1">
            <div>Staked: {stakingInfo.stakedAmount} NEAR</div>
            <div>Unstaked: {stakingInfo.unstakedAmount} NEAR</div>
            <div>Status: {stakingInfo.isStaking ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={signOut}
          className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      {isAuthenticated && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-sm text-green-700">
            🎉 You have full access! Your session will persist across browser sessions 
            and automatically refresh when needed.
          </div>
        </div>
      )}
    </div>
  );
}

// Protected content that requires session authentication
function ProtectedContent() {
  const { isAuthenticated, isStaked } = useNEARStakingAuth();

  if (!isAuthenticated || !isStaked) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-orange-600 mb-2">
          Session Authentication Required
        </h2>
        <p className="text-gray-600">
          You need to be staked and have an active session to view this content.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-green-50 rounded-lg">
      <h2 className="text-2xl font-bold text-green-800 mb-4">
        🎉 Welcome to Protected Content!
      </h2>
      <p className="text-green-700">
        This content is only visible to users who have:
      </p>
      <ul className="list-disc list-inside mt-2 text-green-700 space-y-1">
        <li>Connected their NEAR wallet</li>
        <li>Staked NEAR tokens with the required validator</li>
        <li>Successfully created an authentication session</li>
      </ul>
      <div className="mt-4 p-4 bg-white rounded border border-green-200">
        <p className="text-sm text-gray-600">
          <strong>Benefits of session-based auth:</strong>
        </p>
        <ul className="text-sm text-gray-600 mt-1 space-y-1">
          <li>• Persists across browser sessions</li>
          <li>• Reduces wallet popups</li>
          <li>• Enables server-side verification</li>
          <li>• Better user experience</li>
        </ul>
      </div>
    </div>
  );
}

// Main app with session-based authentication
function SessionBasedApp() {
  return (
    <NEARStakingAuth config={config}>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NEAR Session-Based Authentication
            </h1>
            <p className="text-gray-600">
              Enhanced authentication with persistent sessions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <SessionInfo />
            <ProtectedContent />
          </div>
        </div>
      </div>
    </NEARStakingAuth>
  );
}

export default SessionBasedApp;
