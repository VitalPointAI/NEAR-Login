import React, { useState } from 'react';
import { EducationTooltip } from './WalletEducation';
import { getDefaultHelpTexts } from '../utils/helpTexts';
import type { ValidatorConfig, HelpTexts } from '../types';
import './GuidedStakingWizard.css';

export interface StakingWizardStep {
  id: string;
  title: string;
  description: string;
  help?: string;
  component: React.ComponentType<StakingStepProps>;
  validation?: (data: StakingWizardData) => string | null;
  canSkip?: boolean;
}

export interface StakingWizardData {
  amount: string;
  validator: ValidatorConfig | null;
  understood: {
    rewards: boolean;
    unstaking: boolean;
    risks: boolean;
  };
}

export interface StakingStepProps {
  data: StakingWizardData;
  onDataChange: (updates: Partial<StakingWizardData>) => void;
  onNext: () => void;
  onPrev?: () => void;
  isValid: boolean;
  helpTexts: HelpTexts;
}

export interface GuidedStakingWizardProps {
  validator: ValidatorConfig;
  minStake?: string;
  maxStake?: string;
  userBalance?: string;
  onComplete: (amount: string) => Promise<void>;
  onCancel?: () => void;
  helpTexts?: Partial<HelpTexts>;
  customSteps?: StakingWizardStep[];
  showEducation?: boolean;
}

// Step 1: Introduction and Education
const IntroStep: React.FC<StakingStepProps> = ({ onNext, helpTexts }) => {
  return (
    <div className="staking-step">
      <div className="staking-step__icon">🌟</div>
      <h3>Welcome to NEAR Staking!</h3>
      <p>
        You're about to start earning rewards by helping secure the NEAR network. 
        Let's walk through the process step by step.
      </p>
      
      <div className="staking-benefits">
        <h4>Benefits of Staking:</h4>
        <div className="staking-benefits__grid">
          <div className="benefit-card">
            <span className="benefit-icon">💰</span>
            <div>
              <strong>Earn Rewards</strong>
              <p>Typically 8-12% annual returns</p>
            </div>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🔒</span>
            <div>
              <strong>Stay in Control</strong>
              <p>Your tokens never leave your wallet</p>
            </div>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🌐</span>
            <div>
              <strong>Support Network</strong>
              <p>Help secure the NEAR ecosystem</p>
            </div>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">⚡</span>
            <div>
              <strong>Flexible</strong>
              <p>Unstake anytime (2-3 day delay)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="staking-education">
        <EducationTooltip 
          content={helpTexts.staking!}
          title="How Staking Works"
          position="top"
        >
          <button 
            className="education-link"
          >
            🎓 Learn more about staking
          </button>
        </EducationTooltip>
      </div>

      <button 
        className="staking-btn staking-btn--primary"
        onClick={onNext}
      >
        Get Started
      </button>
    </div>
  );
};

// Step 2: Choose Staking Amount
const AmountStep: React.FC<StakingStepProps> = ({ 
  data, 
  onDataChange, 
  onNext, 
  onPrev,
  isValid,
  helpTexts 
}) => {
  const [amount, setAmount] = useState(data.amount || '');
  const [showCustom, setShowCustom] = useState(false);

  const presetAmounts = ['1', '5', '10', '25', '50', '100'];

  const handleAmountSelect = (value: string) => {
    setAmount(value);
    onDataChange({ amount: value });
  };

  const handleCustomAmount = (value: string) => {
    // Only allow numbers and decimal
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmount(value);
    onDataChange({ amount: value });
  };

  return (
    <div className="staking-step">
      <div className="staking-step__icon">💰</div>
      <h3>Choose Staking Amount</h3>
      <p>How much NEAR would you like to stake? You can always stake more later.</p>

      <div className="amount-selector">
        <div className="preset-amounts">
          <h4>Popular Amounts:</h4>
          <div className="preset-grid">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                className={`preset-btn ${amount === preset ? 'selected' : ''}`}
                onClick={() => handleAmountSelect(preset)}
              >
                {preset} NEAR
              </button>
            ))}
          </div>
        </div>

        <div className="custom-amount">
          <button 
            className="custom-toggle"
            onClick={() => setShowCustom(!showCustom)}
          >
            {showCustom ? '📋 Choose preset' : '✏️ Enter custom amount'}
          </button>

          {showCustom && (
            <div className="custom-input">
              <EducationTooltip 
                content={helpTexts.stakingAmount!}
                position="top"
              >
                <div className="input-group">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="amount-input"
                  />
                  <span className="input-suffix">NEAR</span>
                </div>
              </EducationTooltip>
            </div>
          )}
        </div>
      </div>

      {amount && (
        <div className="amount-summary">
          <div className="summary-card">
            <h4>Staking Summary</h4>
            <div className="summary-row">
              <span>Amount to stake:</span>
              <strong>{amount} NEAR</strong>
            </div>
            <div className="summary-row">
              <span>Estimated annual rewards:</span>
              <strong className="reward-highlight">
                ~{(parseFloat(amount || '0') * 0.1).toFixed(2)} NEAR
              </strong>
            </div>
            <div className="summary-note">
              <small>
                ℹ️ Rewards are estimated at 10% APY and compound automatically
              </small>
            </div>
          </div>
        </div>
      )}

      <div className="step-actions">
        <button 
          className="staking-btn staking-btn--secondary"
          onClick={onPrev}
        >
          Back
        </button>
        <button 
          className="staking-btn staking-btn--primary"
          onClick={onNext}
          disabled={!isValid}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Step 3: Understanding & Confirmation
const ConfirmationStep: React.FC<StakingStepProps> = ({ 
  data, 
  onDataChange, 
  onNext, 
  onPrev,
  isValid,
  helpTexts 
}) => {
  const handleUnderstandingChange = (key: keyof typeof data.understood, value: boolean) => {
    onDataChange({
      understood: {
        ...data.understood,
        [key]: value
      }
    });
  };

  const checklistItems = [
    {
      key: 'rewards' as const,
      label: 'I understand how staking rewards work',
      tooltip: helpTexts.rewards!
    },
    {
      key: 'unstaking' as const,
      label: 'I understand the unstaking process takes 2-3 days',
      tooltip: helpTexts.unstaking!
    },
    {
      key: 'risks' as const,
      label: 'I understand the risks and want to proceed',
      tooltip: 'Staking is generally safe, but validator performance can affect rewards. Always stake what you can afford.'
    }
  ];

  return (
    <div className="staking-step">
      <div className="staking-step__icon">✅</div>
      <h3>Review & Confirm</h3>
      <p>Please review the details and confirm your understanding.</p>

      <div className="final-summary">
        <div className="summary-header">
          <h4>Staking Details</h4>
        </div>
        <div className="summary-content">
          <div className="summary-row">
            <span>Amount:</span>
            <strong>{data.amount} NEAR</strong>
          </div>
          <div className="summary-row">
            <span>Validator:</span>
            <strong>{data.validator?.displayName || data.validator?.poolId}</strong>
          </div>
          <div className="summary-row">
            <span>Est. Annual Rewards:</span>
            <strong className="reward-highlight">
              ~{(parseFloat(data.amount || '0') * 0.1).toFixed(2)} NEAR
            </strong>
          </div>
          <div className="summary-row">
            <span>Network Fee:</span>
            <strong>&lt; 0.01 NEAR</strong>
          </div>
        </div>
      </div>

      <div className="understanding-checklist">
        <h4>Confirmation Checklist:</h4>
        {checklistItems.map((item) => (
          <div key={item.key} className="checklist-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={data.understood[item.key]}
                onChange={(e) => handleUnderstandingChange(item.key, e.target.checked)}
              />
              <span className="checkmark"></span>
              {item.label}
            </label>
            <EducationTooltip 
              content={item.tooltip}
              position="top"
              trigger="click"
            >
              <button className="info-btn">ℹ️</button>
            </EducationTooltip>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button 
          className="staking-btn staking-btn--secondary"
          onClick={onPrev}
        >
          Back
        </button>
        <button 
          className="staking-btn staking-btn--primary staking-btn--final"
          onClick={onNext}
          disabled={!isValid}
        >
          🚀 Start Staking
        </button>
      </div>
    </div>
  );
};

// Default wizard steps
const createDefaultSteps = (_validator: ValidatorConfig, minStake: string): StakingWizardStep[] => [
  {
    id: 'intro',
    title: 'Introduction',
    description: 'Learn about staking benefits',
    component: IntroStep,
    canSkip: false
  },
  {
    id: 'amount',
    title: 'Choose Amount',
    description: 'Select how much to stake',
    help: 'Choose an amount you\'re comfortable with. You can always stake more later.',
    component: AmountStep,
    validation: (data) => {
      const amount = parseFloat(data.amount || '0');
      const min = parseFloat(minStake || '1');
      if (amount < min) return `Minimum stake is ${min} NEAR`;
      if (amount <= 0) return 'Please enter a valid amount';
      return null;
    }
  },
  {
    id: 'confirm',
    title: 'Confirmation',
    description: 'Review and confirm',
    help: 'Review all details before proceeding with the staking transaction.',
    component: ConfirmationStep,
    validation: (data) => {
      const { rewards, unstaking, risks } = data.understood;
      if (!rewards || !unstaking || !risks) return 'Please confirm all items';
      return null;
    }
  }
];

export const GuidedStakingWizard: React.FC<GuidedStakingWizardProps> = ({
  validator,
  minStake = '1',
  onComplete,
  onCancel,
  helpTexts = {},
  customSteps
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [wizardData, setWizardData] = useState<StakingWizardData>({
    amount: '',
    validator,
    understood: {
      rewards: false,
      unstaking: false,
      risks: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const mergedHelpTexts = { ...getDefaultHelpTexts(), ...helpTexts };
  const steps = customSteps || createDefaultSteps(validator, minStake);
  const currentStep = steps[currentStepIndex];

  const isCurrentStepValid = () => {
    if (!currentStep.validation) return true;
    return currentStep.validation(wizardData) === null;
  };

  const handleDataChange = (updates: Partial<StakingWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStepIndex === steps.length - 1) {
      // Final step - complete staking
      setIsLoading(true);
      try {
        await onComplete(wizardData.amount);
      } catch (error) {
        console.error('Staking failed:', error);
        setIsLoading(false);
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    // Skip to amount selection if intro can be skipped
    if (currentStep.canSkip) {
      setCurrentStepIndex(1);
    }
  };

  if (isLoading) {
    return (
      <div className="staking-wizard staking-wizard--loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3>Processing Staking Transaction...</h3>
          <p>Please confirm the transaction in your wallet.</p>
          <p className="loading-note">
            This may take a few moments. Don't close this window.
          </p>
        </div>
      </div>
    );
  }

  const StepComponent = currentStep.component;

  return (
    <div className="staking-wizard">
      <div className="wizard-header">
        <h2>Guided Staking Setup</h2>
        <div className="wizard-progress">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`progress-step ${
                  index < currentStepIndex ? 'completed' : 
                  index === currentStepIndex ? 'active' : 'pending'
                }`}
              >
                <div className="progress-step__circle">
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <div className="progress-step__label">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        
        {onCancel && (
          <button 
            className="wizard-close"
            onClick={onCancel}
            aria-label="Close wizard"
          >
            ✕
          </button>
        )}
      </div>

      <div className="wizard-content">
        <StepComponent
          data={wizardData}
          onDataChange={handleDataChange}
          onNext={handleNext}
          onPrev={currentStepIndex > 0 ? handlePrev : undefined}
          isValid={isCurrentStepValid()}
          helpTexts={mergedHelpTexts}
        />
      </div>

      {currentStep.canSkip && (
        <div className="wizard-skip">
          <button onClick={handleSkip} className="skip-btn">
            Skip tutorial, I know what I'm doing
          </button>
        </div>
      )}
    </div>
  );
};

export default GuidedStakingWizard;
