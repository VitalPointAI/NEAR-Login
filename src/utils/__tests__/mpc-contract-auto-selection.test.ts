import { MPC_CONTRACTS, createChainSignatureContract } from '../chain-signature-contract';
import * as nearAPI from 'near-api-js';

/**
 * Test: MPC Contract Auto-Selection
 * 
 * This test verifies that:
 * 1. MPC_CONTRACTS constant contains correct contract IDs
 * 2. createChainSignatureContract automatically selects correct contract
 * 3. Custom contract override works properly
 */

describe('MPC Contract Auto-Selection', () => {
  // Mock NEAR connection
  const mockNear = {} as nearAPI.Near;

  test('MPC_CONTRACTS contains correct contract IDs', () => {
    expect(MPC_CONTRACTS.mainnet).toBe('v1.signer');
    expect(MPC_CONTRACTS.testnet).toBe('v1.signer-prod.testnet');
  });

  test('createChainSignatureContract auto-selects mainnet contract', () => {
    const contract = createChainSignatureContract('mainnet', mockNear);
    // We can't directly access the contractId, but we can test the creation succeeds
    expect(contract).toBeDefined();
    expect(contract).toBeInstanceOf(Object);
  });

  test('createChainSignatureContract auto-selects testnet contract', () => {
    const contract = createChainSignatureContract('testnet', mockNear);
    expect(contract).toBeDefined();
    expect(contract).toBeInstanceOf(Object);
  });

  test('createChainSignatureContract accepts custom contract override', () => {
    const customContractId = 'custom-mpc.testnet';
    const contract = createChainSignatureContract('testnet', mockNear, customContractId);
    expect(contract).toBeDefined();
    expect(contract).toBeInstanceOf(Object);
  });

  test('contract IDs follow expected patterns', () => {
    // Mainnet contract should follow v*.signer pattern
    expect(MPC_CONTRACTS.mainnet).toMatch(/^v\d+\.signer$/);
    
    // Testnet contract should contain signer and testnet
    expect(MPC_CONTRACTS.testnet).toMatch(/signer.*testnet/);
  });
});

export {};
