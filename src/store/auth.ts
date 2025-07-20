import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { setupWalletSelector } from '@near-wallet-selector/core';
import type { WalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupModal } from '@near-wallet-selector/modal-ui';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import * as nearAPI from 'near-api-js';

import type { 
  AuthState, 
  AuthConfig, 
  NEARConfig, 
  ToastNotification 
} from '../types';
import { 
  DEFAULT_NEAR_CONFIG, 
  createNearConnection, 
  getStakingInfo as fetchStakingInfo,
  stakeTokens as executeStake,
  unstakeTokens as executeUnstake,
  formatNearAmount
} from '../utils/near';
import { SessionManager } from '../utils/session';

interface NEARStakingAuthStore extends AuthState {
  config: AuthConfig | null;
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  near: nearAPI.Near | null;
  sessionManager: SessionManager | null;
  
  // Actions
  initialize: (config: AuthConfig) => Promise<void>;
  checkAuthStatus: (accountId: string) => Promise<void>;
  authenticateWithSession: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  stakeTokens: (amount: string) => Promise<void>;
  unstakeTokens: (amount: string) => Promise<void>;
  refreshStakingInfo: () => Promise<void>;
  
  // Toast notifications
  onToast?: (toast: ToastNotification) => void;
  setToastHandler: (handler: (toast: ToastNotification) => void) => void;
}

export const useNEARStakingAuthStore = create<NEARStakingAuthStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isLoading: false,
    isConnected: false,
    accountId: null,
    isAuthenticated: false,
    isStaked: false,
    stakingInfo: null,
    sessionToken: null,
    error: null,
    config: null,
    selector: null,
    modal: null,
    near: null,
    sessionManager: null,
    onToast: undefined,

    setToastHandler: (handler) => {
      set({ onToast: handler });
    },

    initialize: async (config: AuthConfig) => {
      const state = get();
      if (state.selector) return; // Already initialized

      try {
        set({ isLoading: true, error: null, config });

        // Initialize session manager with security configuration
        const sessionManager = new SessionManager(
          config.sessionConfig?.duration, // Backward compatibility
          config.sessionConfig?.storageKey,
          config.backend,
          config.sessionConfig?.rememberSession,
          config.sessionSecurity // New security configuration
        );

        // Check for existing valid session first
        const existingSession = sessionManager.getSession();
        if (existingSession && sessionManager.isSessionValid()) {
          set({
            isConnected: true,
            accountId: existingSession.accountId,
            isAuthenticated: true,
            isStaked: existingSession.isStaked,
            stakingInfo: existingSession.stakingInfo,
            sessionToken: existingSession.signature || null,
            sessionManager,
            isLoading: false
          });
          return;
        }

        // Merge with default NEAR config
        const networkId = config.nearConfig?.networkId || 'mainnet';
        const nearConfig: NEARConfig = {
          ...DEFAULT_NEAR_CONFIG[networkId],
          ...config.nearConfig,
        };

        // Initialize NEAR connection
        const near = await createNearConnection(nearConfig);

        // Setup wallet selector
        const selector = await setupWalletSelector({
          network: nearConfig.networkId,
          debug: true,
          modules: [
            setupMyNearWallet(),
            setupMeteorWallet(),
          ],
        });

        // Setup modal
        const modal = setupModal(selector, {
          contractId: config.walletConnectOptions?.contractId || 'near',
          theme: config.walletConnectOptions?.theme || 'auto',
        });

        set({ 
          selector, 
          modal, 
          near,
          sessionManager,
          isLoading: false 
        });

        // Check if already signed in to a wallet (handle case where no wallet is selected)
        try {
          const wallet = await selector.wallet();
          const accounts = await wallet.getAccounts();
          
          if (accounts.length > 0) {
            const accountId = accounts[0].accountId;
            await get().checkAuthStatus(accountId);
          } else {
            set({ isLoading: false });
          }
        } catch (walletError) {
          // No wallet selected yet - this is normal, just continue
          console.log('No wallet selected yet, waiting for user interaction');
          set({ isLoading: false });
        }

      } catch (error) {
        console.error('Failed to initialize NEAR staking auth:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize wallet';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        state.onToast?.({
          title: 'Initialization Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    },

    authenticateWithSession: async () => {
      const { sessionManager, config } = get();
      if (!sessionManager || !config) return;

      try {
        const refreshed = sessionManager.refreshSession();
        if (refreshed) {
          const session = sessionManager.getSession();
          if (session) {
            set({
              isConnected: true,
              accountId: session.accountId,
              isAuthenticated: true,
              isStaked: session.isStaked,
              stakingInfo: session.stakingInfo,
              sessionToken: session.signature || null,
            });
          } else {
            // Session invalid, need to re-authenticate
            set({
              isConnected: false,
              accountId: null,
              isAuthenticated: false,
              isStaked: false,
              stakingInfo: null,
              sessionToken: null,
            });
          }
        } else {
          // Session refresh failed
          set({
            isConnected: false,
            accountId: null,
            isAuthenticated: false,
            isStaked: false,
            stakingInfo: null,
            sessionToken: null,
          });
        }
      } catch (error) {
        console.error('Session authentication failed:', error);
        set({
          isConnected: false,
          accountId: null,
          isAuthenticated: false,
          isStaked: false,
          stakingInfo: null,
          sessionToken: null,
          error: error instanceof Error ? error.message : 'Session authentication failed'
        });
      }
    },

    checkAuthStatus: async (accountId: string) => {
      const { near, config, sessionManager, selector, onToast } = get();
      if (!near || !config || !sessionManager || !selector) return;

      try {
        set({ isLoading: true });
        
        // Check if staking is required
        const requiresStaking = config.requireStaking !== false && config.validator;
        let stakingInfo = null;
        let isStaked = false;
        
        // Get staking info only if validator is configured
        if (config.validator) {
          stakingInfo = await fetchStakingInfo(
            near, 
            accountId, 
            config.validator.poolId
          );
          isStaked = !!(stakingInfo?.isStaking && stakingInfo.stakedAmount !== '0');
        }

        // Determine if user meets authentication requirements
        const stakingRequirement = requiresStaking ? (config.validator?.required !== false) : false;
        const meetsStakingRequirement = !stakingRequirement || isStaked;
        
        // For session-based auth, we need to create a session after verification
        if (meetsStakingRequirement) {
          try {
            // Get wallet to sign authentication message
            const wallet = await selector.wallet();
            const message = `Authenticate with NEAR account ${accountId} at ${new Date().toISOString()}`;
            
            // Sign the authentication message
            const signedMessage = await wallet.signMessage({
              message,
              recipient: accountId,
              nonce: Buffer.from(crypto.getRandomValues(new Uint8Array(32)))
            });

            if (signedMessage) {
              // Create session
              const session = sessionManager.createSession(
                accountId,
                signedMessage.signature,
                signedMessage.publicKey,
                stakingInfo
              );

              if (session) {
                set({
                  isConnected: true,
                  accountId,
                  isAuthenticated: true,
                  isStaked,
                  stakingInfo,
                  sessionToken: session.signature,
                  isLoading: false
                });

                onToast?.({
                  title: 'Access Granted',
                  description: stakingInfo && config.validator 
                    ? `Welcome! You have ${formatNearAmount(stakingInfo.stakedAmount)} NEAR staked with ${config.validator.displayName || config.validator.poolId}` 
                    : 'Welcome! Wallet authenticated successfully.',
                  variant: 'success'
                });
                return;
              }
            }
            
            throw new Error('Failed to sign authentication message or create session');
          } catch (sessionError) {
            console.error('Session creation failed:', sessionError);
            // Fall back to wallet-only connection
            set({
              isConnected: true,
              accountId,
              isAuthenticated: false,
              isStaked: !!isStaked,
              stakingInfo,
              sessionToken: null,
              isLoading: false
            });

            onToast?.({
              title: 'Session Creation Failed',
              description: 'Connected to wallet but session-based auth failed. Basic wallet access granted.',
              variant: 'destructive'
            });
          }
        } else {
          // Not staked - just wallet connection
          set({
            isConnected: true,
            accountId,
            isAuthenticated: false,
            isStaked: false,
            stakingInfo,
            sessionToken: null,
            isLoading: false
          });
        }

      } catch (error) {
        console.error('Failed to check auth status:', error);
        set({ 
          error: 'Failed to verify staking status',
          isLoading: false 
        });
      }
    },

    signIn: async () => {
      const { modal, onToast } = get();
      if (!modal) {
        onToast?.({
          title: 'Wallet Not Ready',
          description: 'Please wait for wallet initialization to complete',
          variant: 'destructive'
        });
        return;
      }

      try {
        set({ isLoading: true, error: null });
        modal.show();
      } catch (error) {
        console.error('Sign in failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
        set({ error: errorMessage, isLoading: false });
        
        onToast?.({
          title: 'Sign In Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    },

    signOut: async () => {
      const { selector, sessionManager, onToast } = get();
      if (!selector) return;

      try {
        // Clear session first
        if (sessionManager) {
          sessionManager.clearSession();
        }

        // Sign out from wallet
        const wallet = await selector.wallet();
        await wallet.signOut();
        
        set({
          isConnected: false,
          accountId: null,
          isAuthenticated: false,
          isStaked: false,
          stakingInfo: null,
          sessionToken: null,
          error: null
        });

        onToast?.({
          title: 'Signed Out',
          description: 'Successfully disconnected from wallet and cleared session',
          variant: 'default'
        });

      } catch (error) {
        console.error('Sign out failed:', error);
        // Force clear state even if wallet signout fails
        if (sessionManager) {
          sessionManager.clearSession();
        }
        
        set({
          isConnected: false,
          accountId: null,
          isAuthenticated: false,
          isStaked: false,
          stakingInfo: null,
          sessionToken: null,
          error: null
        });
      }
    },

    stakeTokens: async (amount: string) => {
      const { near, accountId, config, onToast } = get();
      if (!near || !accountId || !config || !config.validator) {
        onToast?.({
          title: 'Staking Not Available',
          description: 'Staking functionality is not configured or wallet not connected.',
          variant: 'destructive'
        });
        return;
      }

      try {
        set({ isLoading: true, error: null });

        await executeStake(near, accountId, config.validator.poolId, amount);

        onToast?.({
          title: 'Staking Transaction Submitted',
          description: 'Your staking transaction has been submitted. Please wait for confirmation.',
          variant: 'default'
        });

        // Wait a moment then refresh staking info
        setTimeout(async () => {
          await get().refreshStakingInfo();
        }, 5000);

      } catch (error) {
        console.error('Staking failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to stake tokens';
        set({ error: errorMessage, isLoading: false });
        
        onToast?.({
          title: 'Staking Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    },

    unstakeTokens: async (amount: string) => {
      const { near, accountId, config, onToast } = get();
      if (!near || !accountId || !config || !config.validator) {
        onToast?.({
          title: 'Unstaking Not Available',
          description: 'Unstaking functionality is not configured or wallet not connected.',
          variant: 'destructive'
        });
        return;
      }

      try {
        set({ isLoading: true, error: null });

        await executeUnstake(near, accountId, config.validator.poolId, amount);

        onToast?.({
          title: 'Unstaking Transaction Submitted',
          description: 'Your unstaking transaction has been submitted.',
          variant: 'default'
        });

        // Wait a moment then refresh staking info
        setTimeout(async () => {
          await get().refreshStakingInfo();
        }, 5000);

      } catch (error) {
        console.error('Unstaking failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to unstake tokens';
        set({ error: errorMessage, isLoading: false });
        
        onToast?.({
          title: 'Unstaking Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    },

    refreshStakingInfo: async () => {
      const { near, accountId, config } = get();
      if (!near || !accountId || !config || !config.validator) return;

      try {
        const stakingInfo = await fetchStakingInfo(
          near, 
          accountId, 
          config.validator.poolId
        );

        const isStaked = stakingInfo?.isStaking && stakingInfo.stakedAmount !== '0';
        
        set({
          isStaked: !!isStaked,
          stakingInfo,
          isLoading: false
        });

      } catch (error) {
        console.error('Failed to refresh staking info:', error);
        set({ isLoading: false });
      }
    },
  }))
);

// Subscribe to wallet selector events
if (typeof window !== 'undefined') {
  let currentSelector: WalletSelector | null = null;
  
  useNEARStakingAuthStore.subscribe(
    (state) => {
      if (state.selector !== currentSelector) {
        currentSelector = state.selector;
        
        if (currentSelector) {
          const subscription = currentSelector.store.observable.subscribe((walletState: { accounts: Array<{ accountId: string }> }) => {
            const { accounts } = walletState;
            
            if (accounts.length > 0) {
              const accountId = accounts[0].accountId;
              useNEARStakingAuthStore.getState().checkAuthStatus(accountId);
            } else {
              useNEARStakingAuthStore.setState({
                isConnected: false,
                accountId: null,
                isStaked: false,
                stakingInfo: null,
                isLoading: false
              });
            }
          });
          
          // Store subscription for cleanup (if needed)
          return () => subscription.unsubscribe();
        }
      }
    }
  );
}
