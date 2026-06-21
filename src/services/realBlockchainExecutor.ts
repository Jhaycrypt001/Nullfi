/**
 * REAL BLOCKCHAIN EXECUTION - Sui Transfer
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export class RealBlockchainExecutor {
  /**
   * Execute real SUI transfer on blockchain - WITH COIN SELECTION
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

      console.log('📝 Building simple SUI transfer...');

      // Create transaction block for simple transfer
      const txBlock = new TransactionBlock();
      txBlock.setSender(walletAddress);

      // Split the gas coin to get the exact amount needed
      const [suiCoin] = txBlock.splitCoins(txBlock.gas, [
        txBlock.pure.u64(amountInMist),
      ]);

      // Transfer the coin to recipient
      txBlock.transferObjects([suiCoin], txBlock.pure.address(recipientAddress));

      console.log('🔐 Requesting wallet to execute transfer...');

      // Execute with wallet - ACTUAL blockchain call
      const result = await connectedWallet.signAndExecuteTransactionBlock({
        transactionBlock: txBlock,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      const digest = result.digest;

      console.log('✅ TRANSACTION EXECUTED!', digest);
      console.log('💎 SUI transferred from your wallet!');

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
