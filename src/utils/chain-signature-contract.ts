import * as nearAPI from 'near-api-js';
import type { SupportedChain } from '../types/chain-signatures';

export interface RSVSignature {
  r: string;
  s: string;
  v: number;
}

export interface SignArgs {
  payloads: Uint8Array[];
  path: string;
  keyType: 'Ecdsa' | 'Eddsa';
  signerAccount: {
    accountId: string;
    signAndSendTransactions: (args: unknown) => Promise<unknown>;
  };
}

export interface MPCSignature {
  signature: string;
  receipt_outcome: {
    outcome: {
      logs: string[];
    };
  };
}

const NEAR_MAX_GAS = '300000000000000';

/**
 * Chain Signature Contract wrapper for NEAR MPC operations
 * 
 * This class provides an interface to interact with the NEAR MPC contract
 * for multi-chain signature generation using Chain Signatures.
 */
export class ChainSignatureContract {
  private contractId: string;
  private near: nearAPI.Near;

  constructor(
    contractId: string,
    _networkId: 'mainnet' | 'testnet',
    near: nearAPI.Near
  ) {
    this.contractId = contractId;
    this.near = near;
  }

  /**
   * Get the master public key from the MPC contract
   */
  async getMasterPublicKey(): Promise<string> {
    const account = await this.near.account(this.contractId);
    
    try {
      const result = await account.viewFunction({
        contractId: this.contractId,
        methodName: 'public_key',
        args: {},
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get master public key:', error);
      throw new Error('Failed to get master public key from MPC contract');
    }
  }

  /**
   * Derive a public key and address for a specific chain and path
   */
  async getDerivedPublicKey(args: {
    path: string;
    predecessor: string;
    isEd25519?: boolean;
  }): Promise<string> {
    const account = await this.near.account(this.contractId);
    
    try {
      const result = await account.viewFunction({
        contractId: this.contractId,
        methodName: 'derived_public_key',
        args: {
          path: args.path,
          predecessor: args.predecessor,
        },
      });
      
      if (args.isEd25519) {
        return `ed25519:${result}`;
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get derived public key:', error);
      throw new Error(`Failed to derive public key for path: ${args.path}`);
    }
  }

  /**
   * Request signatures from the MPC network
   */
  async sign(args: SignArgs): Promise<RSVSignature[]> {
    try {
      const transactions = args.payloads.map((payload) => ({
        signerId: args.signerAccount.accountId,
        receiverId: this.contractId,
        actions: [
          {
            type: 'FunctionCall' as const,
            params: {
              methodName: 'sign',
              args: {
                request: {
                  payload_v2: { 
                    [args.keyType]: this.uint8ArrayToHex(payload) 
                  },
                  path: args.path,
                  domain_id: args.keyType === 'Eddsa' ? 1 : 0,
                },
              },
              gas: NEAR_MAX_GAS,
              deposit: '1', // 1 yoctoNEAR
            },
          },
        ],
      }));

      const sentTxs = await args.signerAccount.signAndSendTransactions({
        transactions,
      }) as MPCSignature[];

      // Parse signatures from transaction receipts
      const signatures = sentTxs.map((tx) => 
        this.parseSignatureFromReceipt(tx)
      );

      return signatures;
    } catch (error) {
      console.error('MPC signature request failed:', error);
      throw new Error('Failed to request signatures from MPC network');
    }
  }

  /**
   * Parse RSV signature from MPC contract response
   */
  private parseSignatureFromReceipt(tx: MPCSignature): RSVSignature {
    try {
      // Look for signature in logs
      const logs = tx.receipt_outcome?.outcome?.logs || [];
      
      for (const log of logs) {
        try {
          const parsed = JSON.parse(log);
          if (parsed.signature) {
            return this.parseRSVFromHex(parsed.signature);
          }
        } catch {
          // Log might not be JSON, check for hex signature pattern
          if (log.includes('signature:')) {
            const sigMatch = log.match(/signature:\s*([a-fA-F0-9]+)/);
            if (sigMatch) {
              return this.parseRSVFromHex(sigMatch[1]);
            }
          }
        }
      }
      
      // Fallback: try to extract from signature field directly
      if (tx.signature) {
        return this.parseRSVFromHex(tx.signature);
      }
      
      throw new Error('No signature found in MPC response');
    } catch (error) {
      console.error('Failed to parse MPC signature:', error);
      throw new Error('Failed to parse signature from MPC response');
    }
  }

  /**
   * Convert hex signature to RSV format
   */
  private parseRSVFromHex(hexSig: string): RSVSignature {
    // Remove '0x' prefix if present
    const cleanHex = hexSig.startsWith('0x') ? hexSig.slice(2) : hexSig;
    
    if (cleanHex.length !== 130) { // 65 bytes * 2 hex chars
      throw new Error(`Invalid signature length: ${cleanHex.length}`);
    }
    
    const r = cleanHex.slice(0, 64);
    const s = cleanHex.slice(64, 128);
    const v = parseInt(cleanHex.slice(128, 130), 16);
    
    return { r, s, v };
  }

  /**
   * Convert Uint8Array to hex string
   */
  private uint8ArrayToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Helper method to create a standard authentication message
   */
  static createAuthMessage(
    chain: SupportedChain, 
    address: string, 
    timestamp: number = Date.now()
  ): string {
    return `Authenticate with ${chain} wallet ${address} at ${new Date(timestamp).toISOString()}`;
  }

  /**
   * Helper method to create message hash for signing
   */
  static createMessageHash(message: string): Uint8Array {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(message);
    } else {
      // Node.js fallback
      return new Uint8Array(Buffer.from(message, 'utf8'));
    }
  }
}

/**
 * Default MPC contract addresses
 */
export const MPC_CONTRACTS = {
  mainnet: 'v1.signer',
  testnet: 'v1.signer-prod.testnet',
} as const;

/**
 * Create a ChainSignatureContract instance
 */
export function createChainSignatureContract(
  networkId: 'mainnet' | 'testnet',
  near: nearAPI.Near,
  customContractId?: string
): ChainSignatureContract {
  const contractId = customContractId || MPC_CONTRACTS[networkId];
  return new ChainSignatureContract(contractId, networkId, near);
}
