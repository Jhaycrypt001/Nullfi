/**
 * Wallet Manager Service
 * Handles Sui wallet connection, transaction signing, and execution
 * PRODUCTION-READY for real Sui blockchain operations
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui.js/transactions';

const SUI_NETWORK = 'testnet';
const SUI_RPC_URL = getFullnodeUrl(SUI_NETWORK);
const suiClient = new SuiClient({ url: SUI_RPC_URL });

export interface TransactionResult {
  success: boolean;
  digest?: string;
  error?: string;
  message: string;
}

export class WalletManager {
  private static wallet: any = null;
  private static walletAddress: string | null = null;

  /**
   * Get Sui wallet instance (requires Sui Wallet extension)
   */
  static async getWallet() {
    if (this.wallet) return this.wallet;

    try {
      // Check if Sui Wallet extension is available
      if (!window || !('suiWallet' in window)) {
        throw new Error('Sui Wallet extension not found. Please install it first.');
      }

      this.wallet = (window as any).suiWallet;
      return this.wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }

  /**
   * Connect to wallet
   */
  static async connect(): Promise<string> {
    try {
      const wallet = await this.getWallet();

      // Request wallet connection
      const accounts = await wallet.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in wallet');
      }

      this.walletAddress = accounts[0];
      console.log('Wallet connected:', this.walletAddress);

      return this.walletAddress;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Get current connected wallet address
   */
  static getAddress(): string | null {
    return this.walletAddress;
  }

  /**
   * Sign and execute transaction on Sui blockchain
   * This is the MAIN method that sends real transactions to Sui
   */
  static async signAndExecuteTransaction(
    transaction: Transaction,
    walletAddress: string
  ): Promise<TransactionResult> {
    try {
      const wallet = await this.getWallet();

      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      // Sign transaction with user's wallet
      console.log('Requesting wallet signature for transaction...');

      const signedTx = await wallet.signTransaction({
        transaction,
      });

      if (!signedTx) {
        throw new Error('Transaction signing failed');
      }

      console.log('Transaction signed, executing on Sui blockchain...');

      // Execute signed transaction on Sui blockchain
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: signedTx.transactionBlockBytes,
        signature: signedTx.signature,
      });

      if (!result || !result.digest) {
        throw new Error('Transaction execution failed');
      }

      console.log('✅ Transaction executed! Digest:', result.digest);

      // Wait for confirmation
      await this.waitForConfirmation(result.digest);

      return {
        success: true,
        digest: result.digest,
        message: 'Transaction confirmed on Sui blockchain',
      };
    } catch (error) {
      console.error('Error signing/executing transaction:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to sign or execute transaction',
      };
    }
  }

  /**
   * Wait for transaction confirmation on blockchain
   */
  static async waitForConfirmation(
    digest: string,
    maxAttempts = 30,
    delayMs = 1000
  ): Promise<boolean> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const txResponse = await suiClient.getTransactionBlock({
          digest,
          options: {
            showEffects: true,
            showEvents: true,
          },
        });

        if (txResponse?.effects?.status?.status === 'success') {
          console.log('✅ Transaction confirmed');
          return true;
        }

        if (txResponse?.effects?.status?.status === 'failure') {
          console.error('❌ Transaction failed');
          return false;
        }
      } catch (error) {
        console.log(`Waiting for confirmation... (attempt ${attempts + 1})`);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Transaction confirmation timeout');
  }

  /**
   * Get user's SUI balance
   */
  static async getBalance(walletAddress: string): Promise<number> {
    try {
      const balance = await suiClient.getBalance({
        owner: walletAddress,
      });

      return Number(balance.totalBalance) / 1e9; // Convert to SUI
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  /**
   * Get user's objects (coins, NFTs)
   */
  static async getObjects(walletAddress: string) {
    try {
      const objects = await suiClient.getOwnedObjects({
        owner: walletAddress,
      });

      return objects.data;
    } catch (error) {
      console.error('Error fetching objects:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  static disconnect() {
    this.wallet = null;
    this.walletAddress = null;
    console.log('Wallet disconnected');
  }

  /**
   * Get RPC URL
   */
  static getRpcUrl(): string {
    return SUI_RPC_URL;
  }

  /**
   * Get network
   */
  static getNetwork(): string {
    return SUI_NETWORK;
  }
}

export default WalletManager;
