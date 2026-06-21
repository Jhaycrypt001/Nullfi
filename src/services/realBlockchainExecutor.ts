/**
 * REAL BLOCKCHAIN EXECUTION - Sui Transfer
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export class RealBlockchainExecutor {
  /**
   * Execute real SUI transfer on blockchain - ACTUAL TRANSACTION
   */
  static async executeRealTransaction(
    walletAddress: string,
    recipientAddress: string,
    amountInMist: number,
    description: string,
    wallet?: any
  ): Promise<string> {
    console.log(`🔔 EXECUTING REAL TRANSACTION on Sui blockchain`);
    console.log(`From: ${walletAddress}`);
    console.log(`To: ${recipientAddress}`);
    console.log(`Amount: ${amountInMist / 1_000_000_000} SUI`);

    try {
      // Use wallet passed from component, or try to get from window
      const connectedWallet = wallet || (window as any).okxwallet || (window as any).suiWallet;

      if (!connectedWallet) {
        throw new Error('❌ Wallet not connected. Please connect your Sui Wallet first.');
      }

      console.log('📝 Building transaction block...');

      // Create a real transaction block
      const txBlock = new TransactionBlock();
      txBlock.setSender(walletAddress);

      // Split coins to get exact amount
      const [coin] = txBlock.splitCoins(txBlock.gas, [txBlock.pure.u64(amountInMist)]);

      // Transfer to recipient
      txBlock.transferObjects([coin], txBlock.pure.address(recipientAddress));

      console.log('🔐 Requesting wallet to sign and execute transaction...');

      // Sign and execute with wallet - THIS WILL DEDUCT FROM WALLET
      const result = await connectedWallet.signAndExecuteTransactionBlock({
        transactionBlock: txBlock,
      });

      const digest = result.digest || result.transactionHash;

      console.log('✅ TRANSACTION EXECUTED!', digest);
      console.log('💎 SUI deducted from your wallet!');

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
