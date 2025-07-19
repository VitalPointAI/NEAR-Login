import { useCallback, useMemo, useEffect } from 'react';
import { useNEARStakingAuthStore } from '../store/auth';
import type { UseNEARLogin } from '../types';

export const useNEARLogin = (): UseNEARLogin => {
  const {
    isLoading,
    isConnected,
    accountId,
    isAuthenticated,
    isStaked,
    stakingInfo,
    sessionToken,
    error,
    config,
    signIn,
    signOut,
    stakeTokens,
    unstakeTokens,
    refreshStakingInfo,
    initialize,
    authenticateWithSession,
  } = useNEARStakingAuthStore();

  // Memoized computed values
  const canStake = useMemo(() => isConnected && !isStaked, [isConnected, isStaked]);
  
  // Check if staking is required based on configuration
  const requiresStaking = useMemo(() => {
    if (!config) return false;
    return !!(config.requireStaking !== false && config.validator && config.validator.required !== false);
  }, [config]);

  // Check for existing session on mount
  useEffect(() => {
    if (!isAuthenticated && !isLoading && config) {
      authenticateWithSession();
    }
  }, [authenticateWithSession, isAuthenticated, isLoading, config]);

  // Wrapped actions with error handling
  const handleSignIn = useCallback(async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, [signIn]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, [signOut]);

  const handleStake = useCallback(async (amount: string) => {
    try {
      await stakeTokens(amount);
    } catch (error) {
      console.error('Stake error:', error);
      throw error;
    }
  }, [stakeTokens]);

  const handleUnstake = useCallback(async (amount: string) => {
    try {
      await unstakeTokens(amount);
    } catch (error) {
      console.error('Unstake error:', error);
      throw error;
    }
  }, [unstakeTokens]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshStakingInfo();
    } catch (error) {
      console.error('Refresh error:', error);
      throw error;
    }
  }, [refreshStakingInfo]);

  const handleInitialize = useCallback(async (config: any) => {
    try {
      await initialize(config);
    } catch (error) {
      console.error('Initialize error:', error);
      throw error;
    }
  }, [initialize]);

  // Utility functions
  const getStakedAmount = useCallback(() => {
    return stakingInfo?.stakedAmount || '0';
  }, [stakingInfo]);

  const getUnstakedAmount = useCallback(() => {
    return stakingInfo?.unstakedAmount || '0';
  }, [stakingInfo]);

  const getValidatorInfo = useCallback(() => {
    return config?.validator || null;
  }, [config]);

  return {
    // State
    isLoading,
    isConnected,
    accountId,
    isAuthenticated,
    isStaked,
    stakingInfo,
    sessionToken,
    error,
    config,
    
    // Computed
    canStake,
    requiresStaking,
    
    // Actions
    signIn: handleSignIn,
    signOut: handleSignOut,
    stake: handleStake,
    unstake: handleUnstake,
    refresh: handleRefresh,
    initialize: handleInitialize,
    
    // Utilities
    getStakedAmount,
    getUnstakedAmount,
    getValidatorInfo,
  };
};

export default useNEARLogin;
