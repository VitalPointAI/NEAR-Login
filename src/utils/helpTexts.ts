import type { HelpTexts } from '../types';

// Helper function for common help texts
export const getDefaultHelpTexts = (): HelpTexts => ({
  walletConnection: "A wallet connection allows you to securely interact with this app. Your private keys never leave your wallet.",
  staking: "Staking means temporarily locking your NEAR tokens to help secure the network and earn rewards (typically 8-12% annually).",
  networkFees: "Network fees (usually under $0.01) help process your transaction and keep the NEAR network secure.",
  validatorSelection: "Validators are trusted nodes that process transactions. Choose one with good uptime and reasonable fees.",
  stakingAmount: "Start with a small amount while learning. You can always stake more later. Minimum is usually 1 NEAR.",
  rewards: "Staking rewards are typically paid out every epoch (about 12 hours). Your rewards compound automatically.",
  unstaking: "When you unstake, there's a 2-3 day waiting period before you can withdraw your tokens. This helps secure the network."
});
