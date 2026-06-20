/**
 * REAL BLOCKCHAIN EXECUTION - Following suipayroll pattern
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui.js/transactions';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export class RealBlockchainExecutor {
  /**
   * Execute real SUI transfer on blockchain
   */
  static async executeRealTransaction(
    walletAddress: string,
    recipientAddress: string,
    amountInMist: number,
    description: string
  ): Promise<string> {
    console.log(`🔔 EXECUTING REAL TRANSACTION on Sui blockchain`);
    console.log(`From: ${walletAddress}`);
    console.log(`To: ${recipientAddress}`);
    console.log(`Amount: ${amountInMist / 1_000_000_000} SUI`);

    // Get the wallet
    const wallet = (window as any).okxwallet || (window as any).suiWallet || (window as any).suiet;

    if (!wallet) {
      throw new Error('❌ Wallet not found. Install OKX Wallet, Sui Wallet, or Suiet.');
    }

    try {
      // Build transaction (just like suipayroll does)
      const tx = new Transaction();
      tx.setSender(walletAddress);

      // Split gas to get the amount
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

      // Transfer to recipient
      tx.transferObjects([coin], tx.pure.address(recipientAddress));

      console.log('📝 Transaction built, requesting wallet signature...');

      // Sign and execute with wallet
      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      const digest = result.digest;
      console.log('✅ TRANSACTION EXECUTED!', digest);

      // Wait for confirmation on blockchain
      console.log('⏳ Waiting for blockchain confirmation...');
      await suiClient.waitForTransaction({ digest });

      console.log('🎉 CONFIRMED ON BLOCKCHAIN!');
      return digest;
    } catch (error) {
      console.error('❌ Blockchain execution error:', error);
      throw error;
    }
  }

  /**
   * Simple transfer for testing
   */
  static async simpleTransfer(
    senderAddress: string,
    recipientAddress: string,
    amountSUI: number
  ): Promise<{ success: boolean; digest?: string; error?: string }> {
    try {
      const amountInMist = Math.floor(amountSUI * 1_000_000_000);
      const digest = await this.executeRealTransaction(
        senderAddress,
        recipientAddress,
        amountInMist,
        `Transfer ${amountSUI} SUI`
      );

      return {
        success: true,
        digest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }
}

export default RealBlockchainExecutor;
