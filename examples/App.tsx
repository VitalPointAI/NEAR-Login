import React, { useEffect, useState } from 'react';

// Demo Components - import all the examples
import SimpleWalletDemo from './basic-usage/01-simple-wallet';
import OptionalStakingDemo from './basic-usage/02-optional-staking'; 
import RequiredStakingDemo from './basic-usage/03-required-staking';
import BeginnerFriendlyDemo from './basic-usage/04-beginner-friendly';
import MultiChainAutoDemo from './advanced-features/multi-chain-auto';
import SecurityConfigDemo from './advanced-features/security-configurations';
import InteractiveDemoShowcase from './interactive-demos/demo-showcase';

const LandingPage: React.FC<{ setPath: (path: string) => void; currentPath: string }> = ({ setPath, currentPath }) => (
  <div style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    color: '#333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}>
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🚀 NEAR Login Examples
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Choose the perfect authentication demo for your use case
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🎯 Quick Decision Guide</h2>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontWeight: 'bold' }}>→</span>
            <strong>New to Web3?</strong> Start with "Beginner-Friendly Demo"
          </li>
          <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontWeight: 'bold' }}>→</span>
            <strong>Just need login?</strong> Try "Simple Wallet Connection"
          </li>
          <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontWeight: 'bold' }}>→</span>
            <strong>Want to reward users?</strong> Use "Optional Staking Benefits"
          </li>
          <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontWeight: 'bold' }}>→</span>
            <strong>Need premium features?</strong> Check "Required Staking Access"
          </li>
          <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontWeight: 'bold' }}>→</span>
            <strong>Building multi-chain?</strong> Explore "Multi-Chain Auto-Selection"
          </li>
        </ul>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Demo Cards */}
        <div 
          onClick={() => {
            console.log('🔥 CLICKED Simple Wallet Demo - Before state change'); 
            console.log('🔥 Current path before:', currentPath);
            const newPath = '/examples/basic-usage/01-simple-wallet';
            console.log('🔥 Setting new path to:', newPath);
            window.history.pushState({}, '', newPath);
            setPath(newPath);
            console.log('🔥 After state change - path should be:', newPath);
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            display: 'inline-block',
            background: '#dcfce7',
            color: '#16a34a',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem'
          }}>
            Beginner
          </div>
          <h3 style={{ color: '#4f46e5', fontSize: '1.5rem', marginBottom: '1rem' }}>
            🔐 Simple Wallet Connection
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Basic wallet authentication without any staking requirements. Perfect for getting started quickly.
          </p>
        </div>

        <div 
          onClick={() => {
            window.history.pushState({}, '', '/examples/basic-usage/02-optional-staking');
            setPath('/examples/basic-usage/02-optional-staking');
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            display: 'inline-block',
            background: '#e0e7ff',
            color: '#4f46e5',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem'
          }}>
            Recommended
          </div>
          <h3 style={{ color: '#4f46e5', fontSize: '1.5rem', marginBottom: '1rem' }}>
            💰 Optional Staking Benefits
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Incentivize users to stake for additional benefits while keeping the app accessible to everyone.
          </p>
        </div>

        <div 
          onClick={() => {
            window.history.pushState({}, '', '/examples/basic-usage/03-required-staking');
            setPath('/examples/basic-usage/03-required-staking');
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            display: 'inline-block',
            background: '#fef3c7',
            color: '#d97706',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem'
          }}>
            Advanced
          </div>
          <h3 style={{ color: '#4f46e5', fontSize: '1.5rem', marginBottom: '1rem' }}>
            🔒 Required Staking Access
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Gate premium features behind staking requirements. Perfect for exclusive communities and premium apps.
          </p>
        </div>

        <div 
          onClick={() => {
            window.history.pushState({}, '', '/examples/basic-usage/04-beginner-friendly');
            setPath('/examples/basic-usage/04-beginner-friendly');
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            display: 'inline-block',
            background: '#dcfce7',
            color: '#16a34a',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem'
          }}>
            Education
          </div>
          <h3 style={{ color: '#4f46e5', fontSize: '1.5rem', marginBottom: '1rem' }}>
            🎓 Beginner-Friendly Demo
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Includes educational tooltips and guides to help mainstream users understand crypto and staking.
          </p>
        </div>

        <div 
          onClick={() => {
            window.history.pushState({}, '', '/examples/advanced-features/multi-chain-auto');
            setPath('/examples/advanced-features/multi-chain-auto');
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            display: 'inline-block',
            background: '#fef3c7',
            color: '#d97706',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem'
          }}>
            Multi-Chain
          </div>
          <h3 style={{ color: '#4f46e5', fontSize: '1.5rem', marginBottom: '1rem' }}>
            🌐 Multi-Chain Auto-Selection
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Demonstrate cross-chain authentication with automatic MPC contract selection for Bitcoin and Ethereum.
          </p>
        </div>

        <div 
          onClick={() => {
            window.history.pushState({}, '', '/examples/interactive-demos/demo-showcase');
            setPath('/examples/interactive-demos/demo-showcase');
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            display: 'inline-block',
            background: '#e0e7ff',
            color: '#4f46e5',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem'
          }}>
            Interactive
          </div>
          <h3 style={{ color: '#4f46e5', fontSize: '1.5rem', marginBottom: '1rem' }}>
            🎮 Interactive Playground
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Play with all features in an interactive demo. Switch between different configurations on the fly.
          </p>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        color: 'white',
        opacity: 0.8
      }}>
        <p>
          📚 <a href="/README.md" style={{ color: 'white', textDecoration: 'underline' }}>View Documentation</a> | 
          🐙 <a href="https://github.com/VitalPointAI/NEAR-Login" target="_blank" style={{ color: 'white', textDecoration: 'underline' }}>GitHub Repository</a> | 
          📦 <a href="https://www.npmjs.com/package/@vitalpointai/near-login" target="_blank" style={{ color: 'white', textDecoration: 'underline' }}>NPM Package</a>
        </p>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '10px', 
          margin: '20px auto', 
          borderRadius: '8px',
          maxWidth: '600px',
          fontSize: '14px'
        }}>
          🐞 <strong>Debug Info:</strong> Current Path = "{currentPath}"
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [path, setPath] = React.useState(window.location.pathname);

  useEffect(() => {
    console.log('Current path:', path); // Debug log
    
    // Listen for navigation changes
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [path]);

  // Route to different demos based on the path
  const renderDemo = () => {
    const pathWithoutExamples = path.replace('/examples', '');
    console.log('Routing - Original path:', path, 'Processed path:', pathWithoutExamples); // Debug log
    
    if (pathWithoutExamples === '/basic-usage/01-simple-wallet') {
      return (
        <div style={{ padding: '20px', background: '#e8f4fd', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/examples/');
                setPath('/examples/');
              }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '10px 20px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              ← Back to Examples
            </button>
            <h1 style={{ color: '#007acc', marginTop: '60px' }}>✅ Navigation Working!</h1>
            <p>This proves the routing is working. Now loading the NEAR Login component...</p>
            <div style={{ border: '2px solid #007acc', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <SimpleWalletDemo />
            </div>
          </div>
        </div>
      );
    }
    
    if (pathWithoutExamples === '/basic-usage/02-optional-staking') {
      return (
        <div style={{ padding: '20px', background: '#f0f8ff', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/examples/');
                setPath('/examples/');
              }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '10px 20px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              ← Back to Examples
            </button>
            <h1 style={{ color: '#007acc', marginTop: '60px' }}>💰 Optional Staking Benefits</h1>
            <p>Users get benefits if they stake but can still access the app without staking.</p>
            <div style={{ border: '2px solid #007acc', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <OptionalStakingDemo />
            </div>
          </div>
        </div>
      );
    }
    
    if (pathWithoutExamples === '/basic-usage/03-required-staking') {
      return (
        <div style={{ padding: '20px', background: '#fff8dc', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/examples/');
                setPath('/examples/');
              }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '10px 20px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              ← Back to Examples
            </button>
            <h1 style={{ color: '#007acc', marginTop: '60px' }}>🔒 Required Staking Access</h1>
            <p>Premium features gated behind staking requirements.</p>
            <div style={{ border: '2px solid #007acc', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <RequiredStakingDemo />
            </div>
          </div>
        </div>
      );
    }
    
    if (pathWithoutExamples === '/basic-usage/04-beginner-friendly') {
      return (
        <div style={{ padding: '20px', background: '#f0fff0', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/examples/');
                setPath('/examples/');
              }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '10px 20px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              ← Back to Examples
            </button>
            <h1 style={{ color: '#007acc', marginTop: '60px' }}>🎓 Beginner-Friendly Demo</h1>
            <p>Educational tooltips and guides for mainstream users.</p>
            <div style={{ border: '2px solid #007acc', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <BeginnerFriendlyDemo />
            </div>
          </div>
        </div>
      );
    }
    
    if (pathWithoutExamples === '/advanced-features/multi-chain-auto') {
      return (
        <div style={{ padding: '20px', background: '#fff5ee', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/examples/');
                setPath('/examples/');
              }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '10px 20px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              ← Back to Examples
            </button>
            <h1 style={{ color: '#007acc', marginTop: '60px' }}>🌐 Multi-Chain Auto-Selection</h1>
            <p>Cross-chain authentication with automatic MPC contract selection.</p>
            <div style={{ border: '2px solid #007acc', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <MultiChainAutoDemo />
            </div>
          </div>
        </div>
      );
    }
    
    if (pathWithoutExamples === '/interactive-demos/demo-showcase') {
      return (
        <div style={{ padding: '20px', background: '#f5f5ff', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/examples/');
                setPath('/examples/');
              }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '10px 20px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              ← Back to Examples
            </button>
            <h1 style={{ color: '#007acc', marginTop: '60px' }}>🎮 Interactive Playground</h1>
            <p>Play with all features in an interactive demo environment.</p>
            <div style={{ border: '2px solid #007acc', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <InteractiveDemoShowcase />
            </div>
          </div>
        </div>
      );
    }
    
    // For other routes, just show a simple test
    if (pathWithoutExamples && pathWithoutExamples !== '/' && pathWithoutExamples !== '') {
      return (
        <div style={{ padding: '20px', background: '#f0f8ff', minHeight: '100vh' }}>
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/examples/');
              setPath('/examples/');
            }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              padding: '10px 20px',
              background: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back to Examples
          </button>
          <h1 style={{ marginTop: '60px' }}>🎯 Route Test: {pathWithoutExamples}</h1>
          <p>Navigation is working! This would load the demo component.</p>
        </div>
      );
    }
    
    // Default to landing page
    console.log('Rendering LandingPage (default)'); // Debug
    return <LandingPage setPath={setPath} currentPath={path} />;
  };

  return renderDemo();
};

export default App;
