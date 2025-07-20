import React, { useState, useEffect } from 'react';
import './WalletEducation.css';

export interface EducationTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  showIcon?: boolean;
  children: React.ReactNode;
}

interface WalletEducationProps {
  showVideo?: boolean;
  topics?: ('what-is-wallet' | 'why-near' | 'how-staking-works' | 'security-tips')[];
  compact?: boolean;
  onComplete?: () => void;
}

// Educational tooltip component
export const EducationTooltip: React.FC<EducationTooltipProps> = ({
  content,
  title,
  position = 'top',
  trigger = 'hover',
  showIcon = true,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    const id = setTimeout(() => setIsVisible(false), 100);
    setTimeoutId(id);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const tooltipProps = {
    ...(trigger === 'hover' && { onMouseEnter: showTooltip, onMouseLeave: hideTooltip }),
    ...(trigger === 'focus' && { onFocus: showTooltip, onBlur: hideTooltip }),
    ...(trigger === 'click' && { onClick: handleClick }),
  };

  return (
    <div className="education-tooltip-container">
      <div className="education-tooltip-trigger" {...tooltipProps}>
        {children}
        {showIcon && (
          <span className="education-tooltip-icon" aria-label="Help">
            ❓
          </span>
        )}
      </div>
      
      {isVisible && (
        <div className={`education-tooltip education-tooltip--${position}`}>
          {title && <div className="education-tooltip__title">{title}</div>}
          <div className="education-tooltip__content">{content}</div>
          <div className="education-tooltip__arrow" />
        </div>
      )}
    </div>
  );
};

// Main wallet education component
export const WalletEducation: React.FC<WalletEducationProps> = ({
  showVideo = false,
  topics = ['what-is-wallet', 'why-near', 'how-staking-works'],
  compact = false,
  onComplete
}) => {
  const [currentTopic, setCurrentTopic] = useState(0);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const educationContent = {
    'what-is-wallet': {
      title: '🔑 What is a Crypto Wallet?',
      content: `A crypto wallet is like a secure digital keychain that:
      • Stores your cryptocurrency safely
      • Lets you sign transactions to prove ownership
      • Connects you to blockchain applications
      • Keeps your private keys secure and private`,
      action: 'Next: Why NEAR?'
    },
    'why-near': {
      title: '🌟 Why NEAR Protocol?',
      content: `NEAR offers the best user experience:
      • Low transaction fees (usually under $0.01)
      • Fast transactions (2-3 seconds)
      • Human-readable account names (like alice.near)
      • Built-in staking rewards up to 10% APY
      • Multi-chain capabilities through Chain Signatures`,
      action: 'Next: How Staking Works'
    },
    'how-staking-works': {
      title: '💰 How Staking Works',
      content: `Staking is like earning interest on your savings:
      • You temporarily "lend" your NEAR tokens to validators
      • Validators use them to secure the network
      • You earn rewards (typically 8-12% annually)
      • You can unstake anytime (takes 2-3 days to withdraw)
      • Your tokens never leave your control`,
      action: 'Next: Security Tips'
    },
    'security-tips': {
      title: '🔒 Security Best Practices',
      content: `Keep your wallet safe:
      • Never share your seed phrase with anyone
      • Always verify transaction details before signing
      • Use official wallet apps and websites only
      • Keep your seed phrase written down offline
      • Start with small amounts while learning`,
      action: 'Got it!'
    }
  };

  const currentContent = educationContent[topics[currentTopic] as keyof typeof educationContent];

  const handleNext = () => {
    if (currentTopic < topics.length - 1) {
      setCurrentTopic(currentTopic + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  if (compact && !isExpanded) {
    return (
      <div className="wallet-education--compact">
        <button 
          onClick={() => setIsExpanded(true)}
          className="wallet-education__expand-btn"
        >
          💡 New to crypto wallets? Get help
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-education">
      <div className="wallet-education__header">
        <h3>Getting Started with NEAR</h3>
        <div className="wallet-education__progress">
          {topics.map((_, index) => (
            <div
              key={index}
              className={`wallet-education__progress-dot ${
                index <= currentTopic ? 'active' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="wallet-education__content">
        <h4>{currentContent.title}</h4>
        <div className="wallet-education__text">
          {currentContent.content.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>

        {showVideo && (
          <div className="wallet-education__video">
            <div className="wallet-education__video-placeholder">
              🎥 Video Tutorial Coming Soon
              <p>Watch a 2-minute guide to getting started with NEAR wallets</p>
            </div>
          </div>
        )}
      </div>

      <div className="wallet-education__actions">
        <button 
          onClick={handleSkip}
          className="wallet-education__btn wallet-education__btn--secondary"
        >
          Skip Tutorial
        </button>
        <button 
          onClick={handleNext}
          className="wallet-education__btn wallet-education__btn--primary"
        >
          {currentContent.action}
        </button>
      </div>

      {compact && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="wallet-education__minimize"
          aria-label="Minimize education panel"
        >
          ✕
        </button>
      )}
    </div>
  );
};

WalletEducation.displayName = 'WalletEducation';

export default WalletEducation;
