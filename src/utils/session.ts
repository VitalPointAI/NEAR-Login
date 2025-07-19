import type { SessionData, SessionSecurityConfig, SecurityViolation } from '../types';

export class SessionManager {
  private config: SessionSecurityConfig;
  private storageKey = 'near-login-session';
  private lastActivity = Date.now();
  private validationTimer?: ReturnType<typeof setInterval>;
  private deviceFingerprint?: string;

  constructor(
    duration?: number, // Backward compatibility
    storageKey?: string, // Backward compatibility
    _backend?: any, // Backward compatibility (unused)
    _rememberSession?: boolean, // Backward compatibility (unused)
    config: SessionSecurityConfig = {} // New security config
  ) {
    this.config = {
      maxAge: duration || config.maxAge || 7 * 24 * 60 * 60 * 1000, // 7 days default
      idleTimeout: config.idleTimeout || 24 * 60 * 60 * 1000, // 24 hours default
      encryptStorage: config.encryptStorage !== false, // Default to true
      deviceFingerprinting: config.deviceFingerprinting || false,
      bindToIP: config.bindToIP || false,
      validateInterval: config.validateInterval,
      rotateTokens: config.rotateTokens || false,
      validateWithBackend: config.validateWithBackend,
      requireReauth: config.requireReauth,
      secureStorage: config.secureStorage || false,
      preventConcurrent: config.preventConcurrent || false,
      ...config
    };

    // Use custom storage key if provided
    if (storageKey) {
      this.storageKey = storageKey;
    }

    // Initialize device fingerprinting if enabled
    if (this.config.deviceFingerprinting) {
      this.generateDeviceFingerprint();
    }

    // Start validation timer if configured
    if (this.config.validateInterval) {
      this.startValidationTimer();
    }

    // Track user activity for idle timeout
    this.trackActivity();
  }

  private generateDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server-side';

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprinting', 2, 2);
      }

      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0,
        canvas.toDataURL()
      ].join('|');

      this.deviceFingerprint = this.simpleHash(fingerprint);
      return this.deviceFingerprint;
    } catch (error) {
      console.warn('Failed to generate device fingerprint:', error);
      this.deviceFingerprint = 'fingerprint-failed';
      return this.deviceFingerprint;
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private trackActivity(): void {
    if (typeof window === 'undefined') return;

    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
  }

  private startValidationTimer(): void {
    if (!this.config.validateInterval) return;

    this.validationTimer = setInterval(() => {
      this.validateSession();
    }, this.config.validateInterval);
  }

  private stopValidationTimer(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = undefined;
    }
  }

  private encrypt(data: string): string {
    if (!this.config.encryptStorage) return data;
    
    // Simple XOR encryption for demo purposes
    // In production, use proper encryption libraries
    const key = this.getEncryptionKey();
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  private decrypt(encryptedData: string): string {
    if (!this.config.encryptStorage) return encryptedData;
    
    try {
      const data = atob(encryptedData);
      const key = this.getEncryptionKey();
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.warn('Failed to decrypt session data:', error);
      return '';
    }
  }

  private getEncryptionKey(): string {
    // Generate a key based on device characteristics
    // In production, use proper key management
    const baseKey = 'near-login-key';
    const deviceData = this.deviceFingerprint || 'default';
    return baseKey + deviceData;
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    return this.config.secureStorage ? sessionStorage : localStorage;
  }

  private handleSecurityViolation(violation: SecurityViolation): void {
    console.warn('Security violation detected:', violation);
    
    if (this.config.onSecurityViolation) {
      this.config.onSecurityViolation(violation);
    }

    // Auto-logout on serious violations
    if (['device_mismatch', 'session_expired', 'concurrent_session'].includes(violation.type)) {
      this.clearSession();
    }
  }

  public saveSession(sessionData: SessionData): boolean {
    try {
      const storage = this.getStorage();
      if (!storage) return false;

      const now = Date.now();
      const enhancedData: SessionData = {
        ...sessionData,
        timestamp: now,
        lastActivity: now,
        deviceFingerprint: this.config.deviceFingerprinting ? this.deviceFingerprint : undefined,
        ipAddress: this.config.bindToIP ? window.location.hostname : undefined,
        sessionId: sessionData.sessionId || this.generateSessionId()
      };

      const dataString = JSON.stringify(enhancedData);
      const finalData = this.encrypt(dataString);
      
      storage.setItem(this.storageKey, finalData);
      
      // Check for concurrent sessions if enabled
      if (this.config.preventConcurrent) {
        this.checkConcurrentSessions(enhancedData.sessionId!);
      }

      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }

  public getSession(): SessionData | null {
    try {
      const storage = this.getStorage();
      if (!storage) return null;

      const encryptedData = storage.getItem(this.storageKey);
      if (!encryptedData) return null;

      const dataString = this.decrypt(encryptedData);
      if (!dataString) return null;

      const sessionData: SessionData = JSON.parse(dataString);
      
      // Validate session
      const validation = this.validateSessionData(sessionData);
      if (!validation.isValid) {
        this.handleSecurityViolation(validation.violation!);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Failed to get session:', error);
      this.clearSession(); // Clear corrupted session
      return null;
    }
  }

  public clearSession(): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(this.storageKey);
      }
      this.stopValidationTimer();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  public validateSession(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  public isSessionValid(): boolean {
    return this.validateSession();
  }

  public createSession(
    accountId: string, 
    signature: string, 
    _publicKey: string, // Unused but kept for backward compatibility
    stakingInfo: any
  ): SessionData {
    const now = Date.now();
    const sessionData: SessionData = {
      accountId,
      isStaked: !!stakingInfo,
      stakingInfo,
      expiresAt: now + (this.config.maxAge || 7 * 24 * 60 * 60 * 1000),
      signature,
      createdAt: now,
      lastActivity: now,
      timestamp: now,
      deviceFingerprint: this.config.deviceFingerprinting ? this.deviceFingerprint : undefined,
      ipAddress: this.config.bindToIP ? window.location.hostname : undefined,
      sessionId: this.generateSessionId(),
      refreshCount: 0,
      version: '2.0.0',
      user: {
        accountId,
        isStaked: !!stakingInfo
      }
    };

    this.saveSession(sessionData);
    return sessionData;
  }

  private validateSessionData(sessionData: SessionData): { isValid: boolean; violation?: SecurityViolation } {
    const now = Date.now();

    // Check max age
    if (this.config.maxAge && sessionData.timestamp) {
      if (now - sessionData.timestamp > this.config.maxAge) {
        return {
          isValid: false,
          violation: {
            type: 'session_expired',
            message: 'Session exceeded maximum age',
            timestamp: now
          }
        };
      }
    }

    // Check idle timeout
    if (this.config.idleTimeout && sessionData.lastActivity) {
      if (now - this.lastActivity > this.config.idleTimeout) {
        return {
          isValid: false,
          violation: {
            type: 'idle_timeout',
            message: 'Session idle timeout exceeded',
            timestamp: now
          }
        };
      }
    }

    // Check device fingerprint
    if (this.config.deviceFingerprinting && sessionData.deviceFingerprint) {
      if (this.deviceFingerprint && sessionData.deviceFingerprint !== this.deviceFingerprint) {
        return {
          isValid: false,
          violation: {
            type: 'device_mismatch',
            message: 'Device fingerprint mismatch',
            timestamp: now
          }
        };
      }
    }

    // Check IP binding (if configured)
    if (this.config.bindToIP && sessionData.ipAddress) {
      const currentIP = window.location.hostname;
      if (sessionData.ipAddress !== currentIP) {
        return {
          isValid: false,
          violation: {
            type: 'ip_mismatch',
            message: 'IP address mismatch',
            timestamp: now
          }
        };
      }
    }

    // Check re-authentication requirement
    if (this.config.requireReauth && sessionData.timestamp) {
      if (now - sessionData.timestamp > this.config.requireReauth) {
        return {
          isValid: false,
          violation: {
            type: 'reauth_required',
            message: 'Re-authentication required',
            timestamp: now
          }
        };
      }
    }

    return { isValid: true };
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private checkConcurrentSessions(currentSessionId: string): void {
    // In a real implementation, this would check with a backend service
    // For now, we'll just emit a warning if multiple tabs are detected
    const storage = this.getStorage();
    if (!storage) return;

    const sessionCheckKey = 'near-session-check';
    const existingCheck = storage.getItem(sessionCheckKey);
    
    if (existingCheck && existingCheck !== currentSessionId) {
      this.handleSecurityViolation({
        type: 'concurrent_session',
        message: 'Multiple concurrent sessions detected',
        timestamp: Date.now()
      });
    }

    storage.setItem(sessionCheckKey, currentSessionId);
  }

  public refreshSession(): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Update last activity
    session.lastActivity = Date.now();
    
    // Rotate tokens if configured
    if (this.config.rotateTokens) {
      session.sessionId = this.generateSessionId();
    }

    return this.saveSession(session);
  }

  public updateActivity(): void {
    this.lastActivity = Date.now();
    
    // Update stored session activity
    const session = this.getSession();
    if (session) {
      session.lastActivity = this.lastActivity;
      this.saveSession(session);
    }
  }

  public async validateWithBackend(): Promise<boolean> {
    if (!this.config.validateWithBackend) return true;

    try {
      const session = this.getSession();
      if (!session) return false;

      const response = await fetch(this.config.validateWithBackend, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          accountId: session.user?.accountId
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Backend session validation failed:', error);
      return false;
    }
  }

  public destroy(): void {
    this.stopValidationTimer();
    this.clearSession();
  }
}

// Export default instance for backward compatibility
export const sessionManager = new SessionManager();
