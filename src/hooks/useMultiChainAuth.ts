import { useState, useEffect, useCallback, useMemo } from 'react';
import type { WalletSelector } from '@near-wallet-selector/core';
import * as nearAPI from 'near-api-js';
import type {
  MultiChainAuthConfig,
  MultiChainAuthState,
  SupportedChain,
  DerivedAddress,
  ChainSignatureResult,
  ChainSignatureError,
} from '../types/chain-signatures';
import { MultiChainAuthManager } from '../utils/multi-chain-auth';

export interface UseMultiChainAuthOptions {
  config: MultiChainAuthConfig;
  near: nearAPI.Near;
  selector: WalletSelector;
  autoConnect?: boolean;
  enableNotifications?: boolean;
}

export interface UseMultiChainAuthReturn {
  // State
  state: MultiChainAuthState;
  isInitialized: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  error: ChainSignatureError | null;
  
  // Chain management
  connectedChains: SupportedChain[];
  activeChain: SupportedChain | null;
  
  // Actions
  initialize: () => Promise<void>;
  connectChain: (chain: SupportedChain, customPath?: string) => Promise<DerivedAddress>;
  connectMultipleChains: (chains: SupportedChain[]) => Promise<Record<SupportedChain, DerivedAddress>>;
  switchActiveChain: (chain: SupportedChain) => void;
  signAuthMessage: (chain: SupportedChain, message?: string) => Promise<ChainSignatureResult>;
  signMultipleAuthMessages: (chains: SupportedChain[], message?: string) => Promise<Record<SupportedChain, ChainSignatureResult>>;
  getChainAddress: (chain: SupportedChain) => DerivedAddress | null;
  getChainSignature: (chain: SupportedChain) => ChainSignatureResult | null;
  isChainAuthenticated: (chain: SupportedChain) => boolean;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * React hook for multi-chain authentication using NEAR Chain Signatures
 * 
 * Provides a complete authentication system that allows users to authenticate
 * with any supported blockchain wallet while maintaining a unified state.
 */
export function useMultiChainAuth({
  config,
  near,
  selector,
  autoConnect = true,
  enableNotifications = true,
}: UseMultiChainAuthOptions): UseMultiChainAuthReturn {
  
  const [state, setState] = useState<MultiChainAuthState>({
    connectedChains: {} as Record<SupportedChain, DerivedAddress | null>,
    activeChain: null,
    signatures: {} as Record<SupportedChain, ChainSignatureResult | null>,
    isInitialized: false,
    isConnecting: false,
  });
  
  const [error, setError] = useState<ChainSignatureError | null>(null);

  // Create auth manager instance (memoized to prevent recreation)
  const authManager = useMemo(() => {
    const onStateChange = (newState: MultiChainAuthState) => {
      setState(newState);
    };

    const onError = (authError: ChainSignatureError) => {
      setError(authError);
      
      if (enableNotifications && typeof window !== 'undefined') {
        // Show browser notification if permissions are granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Multi-Chain Auth Error', {
            body: authError.message,
            icon: '/favicon.ico',
          });
        }
      }
    };

    return new MultiChainAuthManager(
      config,
      near,
      selector,
      onStateChange,
      onError
    );
  }, [config, near, selector, enableNotifications]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoConnect && !state.isInitialized && !state.isConnecting) {
      initialize();
    }
  }, [autoConnect, state.isInitialized, state.isConnecting]);

  // Initialize the authentication system
  const initialize = useCallback(async () => {
    try {
      setError(null);
      await authManager.initialize();
    } catch (err) {
      console.error('Failed to initialize multi-chain auth:', err);
    }
  }, [authManager]);

  // Connect to a specific chain
  const connectChain = useCallback(async (chain: SupportedChain, customPath?: string) => {
    try {
      setError(null);
      return await authManager.connectChain(chain, customPath);
    } catch (err) {
      console.error(`Failed to connect to ${chain}:`, err);
      throw err;
    }
  }, [authManager]);

  // Connect to multiple chains
  const connectMultipleChains = useCallback(async (chains: SupportedChain[]) => {
    try {
      setError(null);
      return await authManager.connectMultipleChains(chains);
    } catch (err) {
      console.error('Failed to connect to multiple chains:', err);
      throw err;
    }
  }, [authManager]);

  // Switch active chain
  const switchActiveChain = useCallback((chain: SupportedChain) => {
    try {
      setError(null);
      authManager.switchActiveChain(chain);
    } catch (err) {
      console.error(`Failed to switch to ${chain}:`, err);
      if (err instanceof Error) {
        setError({
          name: 'ChainSignatureError',
          message: err.message,
          code: 'CHAIN_SWITCH_FAILED',
          chain,
        });
      }
    }
  }, [authManager]);

  // Sign authentication message for a chain
  const signAuthMessage = useCallback(async (chain: SupportedChain, message?: string) => {
    try {
      setError(null);
      return await authManager.signAuthMessage(chain, { message });
    } catch (err) {
      console.error(`Failed to sign message for ${chain}:`, err);
      throw err;
    }
  }, [authManager]);

  // Sign authentication messages for multiple chains
  const signMultipleAuthMessages = useCallback(async (chains: SupportedChain[], message?: string) => {
    try {
      setError(null);
      return await authManager.signMultipleAuthMessages(chains, { message });
    } catch (err) {
      console.error('Failed to sign multiple auth messages:', err);
      throw err;
    }
  }, [authManager]);

  // Get address for a specific chain
  const getChainAddress = useCallback((chain: SupportedChain) => {
    return authManager.getChainAddress(chain);
  }, [authManager, state.connectedChains]);

  // Get signature for a specific chain
  const getChainSignature = useCallback((chain: SupportedChain) => {
    return authManager.getChainSignature(chain);
  }, [authManager, state.signatures]);

  // Check if a specific chain is authenticated
  const isChainAuthenticated = useCallback((chain: SupportedChain) => {
    return authManager.isChainAuthenticated(chain);
  }, [authManager, state.signatures]);

  // Logout and clear all authentication
  const logout = useCallback(async () => {
    try {
      setError(null);
      await authManager.logout();
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  }, [authManager]);

  // Clear current error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const connectedChains = useMemo(() => {
    return Object.entries(state.connectedChains)
      .filter(([, address]) => address !== null)
      .map(([chain]) => chain as SupportedChain);
  }, [state.connectedChains]);

  const isAuthenticated = useMemo(() => {
    return authManager.isAuthenticated();
  }, [authManager, state.signatures]);

  // Request notification permissions on mount
  useEffect(() => {
    if (enableNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enableNotifications]);

  return {
    // State
    state,
    isInitialized: state.isInitialized,
    isConnecting: state.isConnecting,
    isAuthenticated,
    error,
    
    // Chain management
    connectedChains,
    activeChain: state.activeChain,
    
    // Actions
    initialize,
    connectChain,
    connectMultipleChains,
    switchActiveChain,
    signAuthMessage,
    signMultipleAuthMessages,
    getChainAddress,
    getChainSignature,
    isChainAuthenticated,
    logout,
    clearError,
  };
}

/**
 * Hook for simplified multi-chain authentication with sensible defaults
 */
export function useSimpleMultiChainAuth(
  config: Omit<MultiChainAuthConfig, 'chainSignature'> & {
    supportedChains?: ('ethereum' | 'bitcoin' | 'solana')[];
    contractId?: string;
    networkId?: 'mainnet' | 'testnet';
  },
  near: nearAPI.Near,
  selector: WalletSelector
): Pick<UseMultiChainAuthReturn, 
  | 'isAuthenticated' 
  | 'connectedChains' 
  | 'activeChain' 
  | 'connectChain' 
  | 'signAuthMessage' 
  | 'logout'
> {
  
  const supportedChains = config.supportedChains || ['ethereum', 'bitcoin', 'solana'];
  const networkId = config.networkId || 'testnet';
  const contractId = config.contractId || (networkId === 'mainnet' ? 'v1.signer' : 'v1.signer-prod.testnet');

  const fullConfig: MultiChainAuthConfig = {
    ...config,
    allowedChains: supportedChains,
    chainSignature: {
      contractId,
      networkId,
      supportedChains: {} as Record<SupportedChain, any>,
      derivationPaths: {} as Record<SupportedChain, string>,
    },
  };

  const result = useMultiChainAuth({
    config: fullConfig,
    near,
    selector,
  });

  return {
    isAuthenticated: result.isAuthenticated,
    connectedChains: result.connectedChains,
    activeChain: result.activeChain,
    connectChain: result.connectChain,
    signAuthMessage: result.signAuthMessage,
    logout: result.logout,
  };
}
