import type { NEARConfig, StakingInfo } from '../types';
import * as nearAPI from 'near-api-js';

export const DEFAULT_NEAR_CONFIG: Record<'mainnet' | 'testnet', NEARConfig> = {
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://app.mynearwallet.com/',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
  },
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com/',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
  },
};

export const formatNearAmount = (amount: string): string => {
  try {
    const formatted = nearAPI.utils.format.formatNearAmount(amount);
    return parseFloat(formatted).toFixed(2);
  } catch (error) {
    console.error('Error formatting NEAR amount:', error);
    return '0.00';
  }
};

export const parseNearAmount = (amount: string): string => {
  try {
    return nearAPI.utils.format.parseNearAmount(amount) || '0';
  } catch (error) {
    console.error('Error parsing NEAR amount:', error);
    return '0';
  }
};

export const validateStakingAmount = (
  amount: string,
  balance: string,
  minimumStake?: string
): { isValid: boolean; error?: string } => {
  const parsedAmount = parseFloat(amount);
  const parsedBalance = parseFloat(formatNearAmount(balance));
  const parsedMinimum = minimumStake ? parseFloat(minimumStake) : 0.1;

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { isValid: false, error: 'Please enter a valid amount' };
  }

  if (parsedAmount < parsedMinimum) {
    return { isValid: false, error: `Minimum stake amount is ${parsedMinimum} NEAR` };
  }

  if (parsedAmount > parsedBalance) {
    return { isValid: false, error: 'Insufficient balance' };
  }

  return { isValid: true };
};

export const createNearConnection = async (config: NEARConfig): Promise<nearAPI.Near> => {
  return await nearAPI.connect({
    ...config,
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
    },
  });
};

export const getStakingInfo = async (
  near: nearAPI.Near,
  accountId: string,
  poolId: string
): Promise<StakingInfo | null> => {
  try {
    const account = await near.account(accountId);
    
    // Call the staking pool contract to get staking information
    const stakingInfo = await account.viewFunction({
      contractId: poolId,
      methodName: 'get_account_staked_balance',
      args: { account_id: accountId },
    });

    const unstakedInfo = await account.viewFunction({
      contractId: poolId,
      methodName: 'get_account_unstaked_balance',
      args: { account_id: accountId },
    });

    const rewardsInfo = await account.viewFunction({
      contractId: poolId,
      methodName: 'get_account_total_balance',
      args: { account_id: accountId },
    });

    return {
      accountId,
      stakedAmount: stakingInfo || '0',
      unstakedAmount: unstakedInfo || '0',
      availableForWithdrawal: '0', // This would need additional contract calls
      rewards: rewardsInfo || '0',
      isStaking: stakingInfo && stakingInfo !== '0',
      poolId,
    };
  } catch (error) {
    console.error('Error fetching staking info:', error);
    return null;
  }
};

export const stakeTokens = async (
  near: nearAPI.Near,
  accountId: string,
  poolId: string,
  amount: string
): Promise<void> => {
  const account = await near.account(accountId);
  const amountInYocto = parseNearAmount(amount);

  await account.functionCall({
    contractId: poolId,
    methodName: 'deposit_and_stake',
    args: {},
    attachedDeposit: BigInt(amountInYocto),
    gas: BigInt('50000000000000'), // 50 TGas
  });
};

export const unstakeTokens = async (
  near: nearAPI.Near,
  accountId: string,
  poolId: string,
  amount: string
): Promise<void> => {
  const account = await near.account(accountId);
  const amountInYocto = parseNearAmount(amount);

  await account.functionCall({
    contractId: poolId,
    methodName: 'unstake',
    args: { amount: amountInYocto },
    attachedDeposit: BigInt('0'),
    gas: BigInt('50000000000000'), // 50 TGas
  });
};

export const withdrawTokens = async (
  near: nearAPI.Near,
  accountId: string,
  poolId: string,
  amount: string
): Promise<void> => {
  const account = await near.account(accountId);
  const amountInYocto = parseNearAmount(amount);

  await account.functionCall({
    contractId: poolId,
    methodName: 'withdraw',
    args: { amount: amountInYocto },
    attachedDeposit: BigInt('0'),
    gas: BigInt('50000000000000'), // 50 TGas
  });
};

export const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
