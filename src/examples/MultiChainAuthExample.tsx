/**
 * Multi-Chain Authentication Example
 * 
 * Example implementation showing how to use NEAR Chain Signatures
 * for universal wallet authentication across multiple blockchains.
 */

import React, { useState, useEffect } from 'react';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import * as nearAPI from 'near-api-js';

import { useMultiChainAuth } from '../hooks/useMultiChainAuth';
import type { 
  MultiChainAuthConfig,
  SupportedChain,
} from '../types/chain-signatures';
import { DEFAULT_CHAIN_CONFIGS, DEFAULT_DERIVATION_PATHS } from '../utils/multi-chain-deriver';

// Example configuration for multi-chain authentication
const MULTI_CHAIN_CONFIG: MultiChainAuthConfig = {
  // Allow these chains for authentication
  allowedChains: ['ethereum', 'bitcoin', 'solana', 'polygon', 'arbitrum'],
  
  // Require at least 2 chains to be authenticated
  minimumChains: 1,
  requireMultipleChains: false,
  
  // Session configuration
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Chain signature configuration
  chainSignature: {
    contractId: 'v1.signer-prod.testnet', // Use testnet for development
    networkId: 'testnet',
    supportedChains: DEFAULT_CHAIN_CONFIGS, // Use defaults
    derivationPaths: DEFAULT_DERIVATION_PATHS, // Use defaults
  },
};

// NEAR network configuration
const NEAR_CONFIG = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
};

export const MultiChainAuthExample: React.FC = () => {
  const [near, setNear] = useState<nearAPI.Near | null>(null);
  const [selector, setSelector] = useState<any>(null);
  const [modal, setModal] = useState<any>(null);

  // Initialize NEAR and wallet selector
  useEffect(() => {
    const initNear = async () => {
      try {
        // Initialize NEAR connection
        const nearConnection = await nearAPI.connect(NEAR_CONFIG);
        setNear(nearConnection);

        // Initialize wallet selector
        const walletSelector = await setupWalletSelector({
          network: 'testnet',
          modules: [
            setupMyNearWallet(),
            setupMeteorWallet(),
          ],
        });

        // Setup wallet modal
        const walletModal = setupModal(walletSelector, {
          contractId: 'your-contract.testnet',
        });

        setSelector(walletSelector);
        setModal(walletModal);
      } catch (error) {
        console.error('Failed to initialize NEAR:', error);
      }
    };

    initNear();
  }, []);

  // Use multi-chain authentication hook
  const {
    state,
    isInitialized,
    isConnecting,
    isAuthenticated,
    error,
    connectedChains,
    activeChain,
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
  } = useMultiChainAuth({
    config: MULTI_CHAIN_CONFIG,
    near: near!,
    selector: selector!,
    autoConnect: true,
    enableNotifications: true,
  });

  // Don't render until NEAR is initialized
  if (!near || !selector) {
    return (
      <div className="multi-chain-auth-example">
        <div className="loading">
          <h2>Initializing NEAR Connection...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const handleConnectWallet = () => {
    modal?.show();
  };

  const handleConnectChain = async (chain: SupportedChain) => {
    try {
      const address = await connectChain(chain);
      console.log(`Connected to ${chain}:`, address);
    } catch (error) {
      console.error(`Failed to connect to ${chain}:`, error);
    }
  };

  const handleConnectMultipleChains = async () => {
    try {
      const chains: SupportedChain[] = ['ethereum', 'bitcoin', 'solana'];
      const addresses = await connectMultipleChains(chains);
      console.log('Connected to multiple chains:', addresses);
    } catch (error) {
      console.error('Failed to connect to multiple chains:', error);
    }
  };

  const handleSignMessage = async (chain: SupportedChain) => {
    try {
      const signature = await signAuthMessage(chain, 'Hello from multi-chain auth!');
      console.log(`Signed message for ${chain}:`, signature);
    } catch (error) {
      console.error(`Failed to sign message for ${chain}:`, error);
    }
  };

  const handleSignMultipleMessages = async () => {
    try {
      const connectedChainsList = connectedChains.slice(0, 3); // Limit to 3 chains
      const signatures = await signMultipleAuthMessages(
        connectedChainsList,
        'Multi-chain authentication message'
      );
      console.log('Signed messages for multiple chains:', signatures);
    } catch (error) {
      console.error('Failed to sign multiple messages:', error);
    }
  };

  return (
    <div className="multi-chain-auth-example">
      <div className="header">
        <h1>NEAR Chain Signatures - Multi-Chain Authentication</h1>
        <p>
          Authenticate with any blockchain wallet using NEAR's Multi-Party Computation network.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <h3>Error: {error.name}</h3>
          <p>{error.message}</p>
          {error.chain && <p>Chain: {error.chain}</p>}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      <div className="status-section">
        <div className="status-item">
          <label>Initialized:</label>
          <span className={isInitialized ? 'status-success' : 'status-pending'}>
            {isInitialized ? '✓' : '⏳'}
          </span>
        </div>
        
        <div className="status-item">
          <label>Connecting:</label>
          <span className={isConnecting ? 'status-pending' : 'status-success'}>
            {isConnecting ? '⏳' : '✓'}
          </span>
        </div>
        
        <div className="status-item">
          <label>Authenticated:</label>
          <span className={isAuthenticated ? 'status-success' : 'status-error'}>
            {isAuthenticated ? '✓' : '✗'}
          </span>
        </div>
      </div>

      <div className="wallet-section">
        <h2>NEAR Wallet Connection</h2>
        <button onClick={handleConnectWallet} className="connect-wallet-btn">
          Connect NEAR Wallet
        </button>
      </div>

      {isInitialized && (
        <>
          <div className="chains-section">
            <h2>Chain Connections ({connectedChains.length} connected)</h2>
            
            <div className="chain-grid">
              {(['ethereum', 'bitcoin', 'solana', 'polygon', 'arbitrum'] as SupportedChain[]).map(chain => {
                const address = getChainAddress(chain);
                const signature = getChainSignature(chain);
                const isConnected = !!address;
                const isAuth = isChainAuthenticated(chain);
                
                return (
                  <div key={chain} className={`chain-card ${isConnected ? 'connected' : ''} ${isAuth ? 'authenticated' : ''}`}>
                    <h3>{chain.charAt(0).toUpperCase() + chain.slice(1)}</h3>
                    
                    <div className="chain-status">
                      <div>Connected: {isConnected ? '✓' : '✗'}</div>
                      <div>Authenticated: {isAuth ? '✓' : '✗'}</div>
                    </div>
                    
                    {address && (
                      <div className="address-info">
                        <label>Address:</label>
                        <code title={address.address}>
                          {address.address.slice(0, 10)}...{address.address.slice(-8)}
                        </code>
                      </div>
                    )}
                    
                    <div className="chain-actions">
                      {!isConnected && (
                        <button onClick={() => handleConnectChain(chain)}>
                          Connect
                        </button>
                      )}
                      
                      {isConnected && !isAuth && (
                        <button onClick={() => handleSignMessage(chain)}>
                          Sign Message
                        </button>
                      )}
                      
                      {isConnected && activeChain !== chain && (
                        <button onClick={() => switchActiveChain(chain)}>
                          Set Active
                        </button>
                      )}
                      
                      {activeChain === chain && (
                        <span className="active-badge">Active</span>
                      )}
                    </div>
                    
                    {signature && (
                      <div className="signature-info">
                        <label>Last Signature:</label>
                        <small>{new Date(signature.timestamp).toLocaleString()}</small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="bulk-actions">
              <button onClick={handleConnectMultipleChains}>
                Connect Multiple Chains
              </button>
              
              {connectedChains.length > 0 && (
                <button onClick={handleSignMultipleMessages}>
                  Sign Messages for All Connected Chains
                </button>
              )}
            </div>
          </div>

          <div className="debug-section">
            <h2>Debug Information</h2>
            <details>
              <summary>State Object</summary>
              <pre>{JSON.stringify(state, null, 2)}</pre>
            </details>
          </div>
        </>
      )}

      <div className="actions-section">
        {isAuthenticated && (
          <button onClick={logout} className="logout-btn">
            Logout & Clear All Authentication
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiChainAuthExample;
