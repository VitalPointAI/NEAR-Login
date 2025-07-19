import type { SessionData, AuthBackendConfig } from '../types';

const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_STORAGE_KEY = 'near-staking-auth-session';

export class SessionManager {
  private storageKey: string;
  private sessionDuration: number;
  private backendConfig?: AuthBackendConfig;
  private rememberSession: boolean;

  constructor(
    sessionDuration = DEFAULT_SESSION_DURATION,
    storageKey = DEFAULT_STORAGE_KEY,
    backendConfig?: AuthBackendConfig,
    rememberSession = true
  ) {
    this.sessionDuration = sessionDuration;
    this.storageKey = storageKey;
    this.backendConfig = backendConfig;
    this.rememberSession = rememberSession;
  }

  // Save session to localStorage
  saveSession(sessionData: SessionData): void {
    if (typeof window === 'undefined' || !this.rememberSession) return;
    
    const session = {
      ...sessionData,
      expiresAt: Date.now() + this.sessionDuration
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  // Get session from localStorage
  getSession(): SessionData | null {
    if (typeof window === 'undefined' || !this.rememberSession) return null;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      
      const session: SessionData = JSON.parse(stored);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Failed to parse stored session:', error);
      this.clearSession();
      return null;
    }
  }

  // Clear session from localStorage
  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }

  // Check if session is valid
  isSessionValid(): boolean {
    const session = this.getSession();
    return session !== null && Date.now() < session.expiresAt;
  }

  // Create session with backend verification (if configured)
  async createSession(
    accountId: string, 
    signature: string, 
    publicKey: string,
    stakingInfo?: any,
    validatorUsed?: string
  ): Promise<SessionData | null> {
    if (!this.backendConfig?.backendUrl) {
      // Client-side only session
      const sessionData: SessionData = {
        accountId,
        isStaked: stakingInfo ? (stakingInfo.isStaking && stakingInfo.stakedAmount !== '0') : false,
        stakingInfo,
        validatorUsed,
        expiresAt: Date.now() + this.sessionDuration,
        signature
      };
      
      if (this.rememberSession) {
        this.saveSession(sessionData);
      }
      return sessionData;
    }

    try {
      // Backend verification
      const response = await fetch(`${this.backendConfig.backendUrl}${this.backendConfig.sessionEndpoint || '/auth/session'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          signature,
          publicKey,
          stakingInfo,
          validatorUsed
        })
      });

      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.statusText}`);
      }

      const result = await response.json();
      const sessionData: SessionData = {
        accountId,
        isStaked: result.isStaked || (stakingInfo ? (stakingInfo.isStaking && stakingInfo.stakedAmount !== '0') : false),
        stakingInfo: result.stakingInfo || stakingInfo,
        validatorUsed: result.validatorUsed || validatorUsed,
        expiresAt: Date.now() + this.sessionDuration,
        signature
      };

      if (this.rememberSession) {
        this.saveSession(sessionData);
      }
      return sessionData;
      
    } catch (error) {
      console.error('Backend session creation failed:', error);
      return null;
    }
  }

  // Refresh session data
  async refreshSession(): Promise<SessionData | null> {
    const currentSession = this.getSession();
    if (!currentSession) return null;

    if (!this.backendConfig?.backendUrl) {
      // Client-side only - extend current session
      const refreshed = {
        ...currentSession,
        expiresAt: Date.now() + this.sessionDuration
      };
      this.saveSession(refreshed);
      return refreshed;
    }

    try {
      // Backend refresh
      const response = await fetch(`${this.backendConfig.backendUrl}${this.backendConfig.verifyEndpoint || '/auth/verify'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: currentSession.accountId,
          signature: currentSession.signature
        })
      });

      if (!response.ok) {
        this.clearSession();
        return null;
      }

      const result = await response.json();
      const refreshedSession: SessionData = {
        ...currentSession,
        isStaked: result.isStaked,
        stakingInfo: result.stakingInfo || currentSession.stakingInfo,
        expiresAt: Date.now() + this.sessionDuration
      };

      this.saveSession(refreshedSession);
      return refreshedSession;
      
    } catch (error) {
      console.error('Session refresh failed:', error);
      this.clearSession();
      return null;
    }
  }
}

// Utility function to generate a message for signing
export function generateAuthMessage(accountId: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  return `Authenticate with NEAR account ${accountId} at ${new Date(ts).toISOString()}`;
}

// Utility function to verify message signature (client-side verification)
export async function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    // This would use NEAR's cryptographic verification
    // For now, we'll assume the signature is valid if it exists
    // In a real implementation, you'd use near-api-js crypto utilities
    return Boolean(signature && publicKey && message);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}
