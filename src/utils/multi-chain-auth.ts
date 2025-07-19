import * as nearAPI from 'near-api-js';
import type { WalletSelector } from '@near-wallet-selector/core';
import type { 
  SupportedChain,
  MultiChainAuthConfig,
  MultiChainSessionData,
  ChainSignatureOptions,
  ChainSignatureResult,
  DerivedAddress,
  MultiChainAuthState,
  ChainSignatureError,
} from '../types/chain-signatures';
import { 
  ChainSignatureContract, 
  createChainSignatureContract
} from './chain-signature-contract';
import { 
  MultiChainAddressDeriver,
  DEFAULT_CHAIN_CONFIGS,
  DEFAULT_DERIVATION_PATHS,
} from './multi-chain-deriver';
import { SessionManager } from './session';

/**
 * Multi-Chain Authentication Manager
 * 
 * Provides authentication using NEAR Chain Signatures across multiple blockchains.
 * Users can authenticate with any supported wallet (EVM, Bitcoin, Solana, etc.)
 * while maintaining a unified authentication state.
 */
export class MultiChainAuthManager {
  private config: MultiChainAuthConfig;
  private contract: ChainSignatureContract;
  private deriver: MultiChainAddressDeriver;
  private sessionManager: SessionManager;
  private state: MultiChainAuthState;
  private selector: WalletSelector;

  // Event handlers
  private onStateChange?: (state: MultiChainAuthState) => void;
  private onError?: (error: ChainSignatureError) => void;

  constructor(
    config: MultiChainAuthConfig,
    near: nearAPI.Near,
    selector: WalletSelector,
    onStateChange?: (state: MultiChainAuthState) => void,
    onError?: (error: ChainSignatureError) => void
  ) {
    // Merge with defaults
    this.config = {
      ...config,
      chainSignature: {
        ...config.chainSignature,
        supportedChains: { ...DEFAULT_CHAIN_CONFIGS, ...config.chainSignature.supportedChains },
        derivationPaths: { ...DEFAULT_DERIVATION_PATHS, ...config.chainSignature.derivationPaths },
      },
    };

    this.selector = selector;
    this.onStateChange = onStateChange;
    this.onError = onError;

    // Initialize MPC contract
    this.contract = createChainSignatureContract(
      this.config.chainSignature.networkId,
      near,
      this.config.chainSignature.contractId
    );

    // Initialize address deriver
    this.deriver = new MultiChainAddressDeriver(this.contract, this.config.chainSignature);

    // Initialize session manager with multi-chain support
    this.sessionManager = new SessionManager(undefined, undefined, undefined, undefined, this.config);

    // Initialize state
    this.state = {
      connectedChains: {} as Record<SupportedChain, DerivedAddress | null>,
      activeChain: null,
      signatures: {} as Record<SupportedChain, ChainSignatureResult | null>,
      isInitialized: false,
      isConnecting: false,
    };

    // Initialize supported chains
    const supportedChainKeys = Object.keys(this.config.chainSignature.supportedChains) as SupportedChain[];
    supportedChainKeys.forEach(chain => {
      this.state.connectedChains[chain] = null;
      this.state.signatures[chain] = null;
    });
  }

  /**
   * Initialize the multi-chain authentication system
   */
  async initialize(): Promise<void> {
    try {
      this.updateState({ isConnecting: true });

      // Check for existing session
      const existingSession = this.sessionManager.getSession() as MultiChainSessionData | null;
      if (existingSession && this.sessionManager.isSessionValid()) {
        // Restore state from session
        this.state.connectedChains = existingSession.connectedChains || this.state.connectedChains;
        this.state.activeChain = existingSession.activeChain || null;
        this.state.signatures = existingSession.chainSignatures || this.state.signatures;
        
        this.updateState({ 
          isInitialized: true, 
          isConnecting: false 
        });
        return;
      }

      // Check if NEAR wallet is connected
      const wallet = await this.selector.wallet();
      const accounts = await wallet.getAccounts();
      
      if (accounts.length > 0) {
        const nearAccount = accounts[0].accountId;
        await this.deriveAddressesForAccount(nearAccount);
      }

      this.updateState({ 
        isInitialized: true, 
        isConnecting: false 
      });

    } catch (error) {
      const chainError: ChainSignatureError = {
        name: 'ChainSignatureError',
        message: `Failed to initialize multi-chain auth: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'CHAIN_CONNECTION_FAILED',
        originalError: error instanceof Error ? error : undefined,
      };
      
      this.handleError(chainError);
      this.updateState({ isConnecting: false });
    }
  }

  /**
   * Connect to a specific chain by deriving its address
   */
  async connectChain(chain: SupportedChain, customPath?: string): Promise<DerivedAddress> {
    try {
      this.validateChainSupport(chain);
      
      const wallet = await this.selector.wallet();
      const accounts = await wallet.getAccounts();
      
      if (accounts.length === 0) {
        throw new Error('NEAR wallet not connected');
      }

      const nearAccount = accounts[0].accountId;
      const derivedAddress = await this.deriver.deriveAddress(nearAccount, chain, customPath);

      // Update state
      this.state.connectedChains[chain] = derivedAddress;
      if (!this.state.activeChain) {
        this.state.activeChain = chain;
      }
      
      this.updateState({});
      await this.saveSession();

      return derivedAddress;
    } catch (error) {
      const chainError: ChainSignatureError = {
        name: 'ChainSignatureError',
        message: `Failed to connect to ${chain}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'CHAIN_CONNECTION_FAILED',
        chain,
        originalError: error instanceof Error ? error : undefined,
      };
      
      this.handleError(chainError);
      throw chainError;
    }
  }

  /**
   * Connect to multiple chains simultaneously
   */
  async connectMultipleChains(chains: SupportedChain[]): Promise<Record<SupportedChain, DerivedAddress>> {
    try {
      const wallet = await this.selector.wallet();
      const accounts = await wallet.getAccounts();
      
      if (accounts.length === 0) {
        throw new Error('NEAR wallet not connected');
      }

      const nearAccount = accounts[0].accountId;
      
      // Validate all chains are supported
      chains.forEach(chain => this.validateChainSupport(chain));

      // Derive addresses in parallel
      const derivedAddresses = await this.deriver.deriveMultipleAddresses(nearAccount, chains);

      // Update state
      Object.entries(derivedAddresses).forEach(([chain, address]) => {
        this.state.connectedChains[chain as SupportedChain] = address;
      });

      if (!this.state.activeChain && chains.length > 0) {
        this.state.activeChain = chains[0];
      }

      this.updateState({});
      await this.saveSession();

      return derivedAddresses;
    } catch (error) {
      const chainError: ChainSignatureError = {
        name: 'ChainSignatureError',
        message: `Failed to connect to multiple chains: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'CHAIN_CONNECTION_FAILED',
        originalError: error instanceof Error ? error : undefined,
      };
      
      this.handleError(chainError);
      throw chainError;
    }
  }

  /**
   * Sign an authentication message with a specific chain
   */
  async signAuthMessage(
    chain: SupportedChain,
    options: Partial<ChainSignatureOptions> = {}
  ): Promise<ChainSignatureResult> {
    try {
      this.validateChainSupport(chain);

      const derivedAddress = this.state.connectedChains[chain];
      if (!derivedAddress) {
        throw new Error(`Not connected to ${chain}. Call connectChain() first.`);
      }

      const wallet = await this.selector.wallet();
      const accounts = await wallet.getAccounts();
      
      if (accounts.length === 0) {
        throw new Error('NEAR wallet not connected');
      }

      const nearAccount = accounts[0].accountId;
      const message = options.message || ChainSignatureContract.createAuthMessage(
        chain, 
        derivedAddress.address
      );
      
      const messageHash = ChainSignatureContract.createMessageHash(message);
      const keyType = this.deriver.getKeyType(chain);
      const derivationPath = options.derivationPath || derivedAddress.derivationPath;

      // Request signature from MPC network
      const signatures = await this.contract.sign({
        payloads: [messageHash],
        path: derivationPath,
        keyType,
        signerAccount: {
          accountId: nearAccount,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signAndSendTransactions: (args: any) => wallet.signAndSendTransactions(args),
        },
      });

      if (signatures.length === 0) {
        throw new Error('No signatures returned from MPC network');
      }

      const signature = signatures[0];
      const result: ChainSignatureResult = {
        signature,
        chain,
        address: derivedAddress.address,
        message,
        timestamp: Date.now(),
      };

      // Store signature in state
      this.state.signatures[chain] = result;
      this.updateState({});
      await this.saveSession();

      return result;
    } catch (error) {
      const chainError: ChainSignatureError = {
        name: 'ChainSignatureError',
        message: `Failed to sign message for ${chain}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'SIGNATURE_FAILED',
        chain,
        originalError: error instanceof Error ? error : undefined,
      };
      
      this.handleError(chainError);
      throw chainError;
    }
  }

  /**
   * Sign authentication messages for multiple chains
   */
  async signMultipleAuthMessages(
    chains: SupportedChain[],
    options: Partial<ChainSignatureOptions> = {}
  ): Promise<Record<SupportedChain, ChainSignatureResult>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: Record<SupportedChain, ChainSignatureResult> = {} as any;

    // Sign messages sequentially to avoid overwhelming the MPC network
    for (const chain of chains) {
      try {
        const result = await this.signAuthMessage(chain, { ...options, chain });
        results[chain] = result;
      } catch (error) {
        console.error(`Failed to sign message for ${chain}:`, error);
        // Continue with other chains
      }
    }

    return results;
  }

  /**
   * Verify if authentication requirements are met
   */
  isAuthenticated(): boolean {
    if (!this.config.requireMultipleChains && !this.config.minimumChains) {
      // If no multi-chain requirements, check if any chain has a valid signature
      return Object.values(this.state.signatures).some(sig => sig !== null);
    }

    const validSignatures = Object.values(this.state.signatures).filter(sig => sig !== null);
    const minimumChains = this.config.minimumChains || 1;
    
    return validSignatures.length >= minimumChains;
  }

  /**
   * Get authentication status for a specific chain
   */
  isChainAuthenticated(chain: SupportedChain): boolean {
    return this.state.signatures[chain] !== null;
  }

  /**
   * Switch active chain
   */
  switchActiveChain(chain: SupportedChain): void {
    this.validateChainSupport(chain);
    
    if (!this.state.connectedChains[chain]) {
      throw new Error(`Not connected to ${chain}. Call connectChain() first.`);
    }

    this.state.activeChain = chain;
    this.updateState({});
  }

  /**
   * Get current authentication state
   */
  getState(): MultiChainAuthState {
    return { ...this.state };
  }

  /**
   * Get connected address for a specific chain
   */
  getChainAddress(chain: SupportedChain): DerivedAddress | null {
    return this.state.connectedChains[chain] || null;
  }

  /**
   * Get signature for a specific chain
   */
  getChainSignature(chain: SupportedChain): ChainSignatureResult | null {
    return this.state.signatures[chain] || null;
  }

  /**
   * Clear authentication state
   */
  async logout(): Promise<void> {
    // Clear state
    Object.keys(this.state.connectedChains).forEach(chain => {
      this.state.connectedChains[chain as SupportedChain] = null;
      this.state.signatures[chain as SupportedChain] = null;
    });
    
    this.state.activeChain = null;
    this.state.isInitialized = false;

    // Clear session
    this.sessionManager.clearSession();
    
    this.updateState({});
  }

  /**
   * Derive addresses for all supported chains for the given NEAR account
   */
  private async deriveAddressesForAccount(nearAccount: string): Promise<void> {
    const allowedChains = this.config.allowedChains || 
      Object.keys(this.config.chainSignature.supportedChains) as SupportedChain[];

    try {
      const derivedAddresses = await this.deriver.deriveMultipleAddresses(nearAccount, allowedChains);
      
      Object.entries(derivedAddresses).forEach(([chain, address]) => {
        this.state.connectedChains[chain as SupportedChain] = address;
      });

      // Set first connected chain as active
      const connectedChains = Object.keys(derivedAddresses) as SupportedChain[];
      if (connectedChains.length > 0 && !this.state.activeChain) {
        this.state.activeChain = connectedChains[0];
      }
    } catch (error) {
      console.error('Failed to derive addresses:', error);
      // Don't throw here, let the app continue with limited functionality
    }
  }

  /**
   * Save current state to session
   */
  private async saveSession(): Promise<void> {
    if (!this.state.isInitialized) return;

    try {
      const wallet = await this.selector.wallet();
      const accounts = await wallet.getAccounts();
      
      if (accounts.length === 0) return;

      const sessionData: MultiChainSessionData = {
        accountId: accounts[0].accountId,
        isStaked: false, // Multi-chain auth doesn't require staking
        expiresAt: Date.now() + (this.config.maxAge || 7 * 24 * 60 * 60 * 1000),
        createdAt: Date.now(),
        lastActivity: Date.now(),
        refreshCount: 0,
        version: '2.0.0',
        
        // Multi-chain specific data
        connectedChains: this.state.connectedChains,
        activeChain: this.state.activeChain,
        chainSignatures: this.state.signatures,
      };

      this.sessionManager.saveSession(sessionData);
    } catch (error) {
      console.error('Failed to save multi-chain session:', error);
    }
  }

  /**
   * Validate that a chain is supported
   */
  private validateChainSupport(chain: SupportedChain): void {
    if (!this.config.chainSignature.supportedChains[chain]) {
      const chainError: ChainSignatureError = {
        name: 'ChainSignatureError',
        message: `Chain ${chain} is not supported`,
        code: 'CHAIN_NOT_SUPPORTED',
        chain,
      };
      throw chainError;
    }

    if (this.config.allowedChains && !this.config.allowedChains.includes(chain)) {
      const chainError: ChainSignatureError = {
        name: 'ChainSignatureError', 
        message: `Chain ${chain} is not allowed by configuration`,
        code: 'CHAIN_NOT_SUPPORTED',
        chain,
      };
      throw chainError;
    }
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<MultiChainAuthState>): void {
    Object.assign(this.state, updates);
    this.onStateChange?.(this.state);
  }

  /**
   * Handle errors and notify listeners
   */
  private handleError(error: ChainSignatureError): void {
    console.error('Multi-chain auth error:', error);
    this.onError?.(error);
  }
}
