import { NEARLogin } from '../../src';
import type { AuthConfig } from '../../src';

// Example: High Security Configuration for Production
const highSecurityConfig: AuthConfig = {
  nearConfig: {
    networkId: 'mainnet',
  },
  validator: {
    poolId: 'vitalpointai.poolv1.near',
    displayName: 'Vital Point AI',
    required: true,
    minStake: '10',
  },
  requireStaking: true,
  
  // Enhanced Security Configuration
  sessionSecurity: {
    // Session expiration
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days maximum
    idleTimeout: 4 * 60 * 60 * 1000, // 4 hours idle timeout
    refreshThreshold: 0.25, // Refresh when 25% of time remaining
    
    // Device and location security
    deviceFingerprinting: true, // Enable device fingerprinting
    bindToIP: false, // Don't bind to IP (mobile users change IPs)
    requireReauth: 2 * 60 * 60 * 1000, // Require re-auth after 2 hours for sensitive actions
    
    // Storage security
    encryptStorage: true, // Encrypt session data in localStorage
    secureStorage: true, // Use sessionStorage instead of localStorage
    
    // Validation
    validateOnFocus: true, // Validate when window gains focus
    validateInterval: 5 * 60 * 1000, // Check every 5 minutes
    
    // Token management
    rotateTokens: true, // Rotate tokens on each authentication
    clearOnError: true, // Clear session on security errors
  },
  
  // Optional backend validation
  backend: {
    sessionEndpoint: '/api/auth/validate',
    verifyEndpoint: '/api/auth/verify',
  },
};

// Example: Balanced Security Configuration for Most Apps
const balancedSecurityConfig: AuthConfig = {
  nearConfig: {
    networkId: 'mainnet',
  },
  validator: {
    poolId: 'vitalpointai.poolv1.near',
    displayName: 'Vital Point AI',
    required: false, // Optional staking
    minStake: '1',
  },
  requireStaking: false,
  
  sessionSecurity: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks
    idleTimeout: 24 * 60 * 60 * 1000, // 24 hours idle
    refreshThreshold: 0.25,
    
    deviceFingerprinting: true,
    bindToIP: false, // Mobile-friendly
    requireReauth: 6 * 60 * 60 * 1000, // Require re-auth after 6 hours
    
    encryptStorage: true,
    secureStorage: true,
    
    validateOnFocus: true,
    validateInterval: 10 * 60 * 1000, // Every 10 minutes
    
    rotateTokens: false, // Less aggressive rotation
    clearOnError: true,
  },
};

// Example: Low Security Configuration for Development/Testing
const devSecurityConfig: AuthConfig = {
  nearConfig: {
    networkId: 'testnet',
  },
  // No validator = wallet-only auth
  
  sessionSecurity: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for dev convenience
    idleTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days idle
    refreshThreshold: 0.1, // Less frequent refreshes
    
    deviceFingerprinting: false, // Easier for testing
    bindToIP: false,
    requireReauth: 24 * 60 * 60 * 1000, // Require re-auth after 24 hours in dev
    
    encryptStorage: false, // Easier debugging
    secureStorage: false,
    
    validateOnFocus: false,
    validateInterval: 60 * 60 * 1000, // Every hour
    
    rotateTokens: false,
    clearOnError: false, // Keep sessions for debugging
  },
};

function SecurityExampleApp() {
  // Choose your security level based on your needs
  // In production, you'd determine this based on your environment
  const isProduction = window.location.hostname === 'your-production-domain.com';
  const isDevelopment = window.location.hostname === 'localhost';
  
  const config = isProduction 
    ? highSecurityConfig 
    : isDevelopment 
    ? devSecurityConfig 
    : balancedSecurityConfig;

  return (
    <NEARLogin 
      config={config}
      onToast={({ title, description, variant }) => {
        console.log(`${variant?.toUpperCase()}: ${title} - ${description}`);
      }}
    >
      <SecureApp />
    </NEARLogin>
  );
}

function SecureApp() {
  // Your secure application content here
  return (
    <div>
      <h1>Secure NEAR Application</h1>
      <p>This app uses enhanced security features for session management.</p>
    </div>
  );
}

export default SecurityExampleApp;
