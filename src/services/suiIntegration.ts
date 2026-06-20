/**
 * Sui Integration Service
 * Handles wallet connection, transaction signing, and smart contract interactions
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui.js/transactions';

const SUI_RPC_URL = 'https://fullnode.testnet.sui.io:443';
const suiClient = new SuiClient({ url: SUI_RPC_URL });

export class SuiIntegrationService {
  /**
   * Request wallet connection from user
   */
  static async connectWallet() {
    if (!window) {
      throw new Error('Wallet connection only works in browser');
    }

    try {
      // Get available wallets (Sui Wallet extension)
      const { SuiWalletProvider } = await import('@mysten/dapp-kit');

      // This assumes the app is wrapped with WalletProvider from @mysten/dapp-kit
      // The actual wallet connection is handled by the Auth component
      return {
        success: true,
        message: 'Wallet connection initialized',
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Sign a transaction with user's wallet
   * Called after building transaction with SuiContractService
   */
  static async signAndExecuteTransaction(
    transactionData: any,
    walletAddress: string
  ) {
    try {
      // The actual signing happens in the frontend via the wallet
      // This is a helper to execute the signed transaction
      console.log('Transaction ready for wallet signing:', {
        from: walletAddress,
        transactionData,
      });

      return {
        success: true,
        message: 'Transaction ready for user signature',
        transactionData,
      };
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  /**
   * Get user's SUI balance
   */
  static async getBalance(walletAddress: string) {
    try {
      const balance = await suiClient.getBalance({
        owner: walletAddress,
      });

      return {
        totalBalance: balance.totalBalance,
        suiBalance: (Number(balance.totalBalance) / 1e9).toFixed(2),
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  /**
   * Get user's objects (coins, NFTs, etc)
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
   * Execute transaction on Sui blockchain
   * After user signs with wallet
   */
  static async executeTransaction(signedTransaction: any) {
    try {
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: signedTransaction,
      });

      return {
        success: true,
        transactionHash: result.digest,
        message: 'Transaction executed successfully on Sui blockchain',
      };
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  static async waitForTransaction(transactionHash: string, timeout = 30000) {
    try {
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        const response = await suiClient.getTransactionBlock({
          digest: transactionHash,
          options: { showEffects: true },
        });

        if (response?.effects?.status?.status === 'success') {
          return {
            success: true,
            transactionHash,
            message: 'Transaction confirmed on Sui blockchain',
          };
        }

        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      throw new Error('Transaction confirmation timeout');
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  /**
   * Get Sui RPC URL
   */
  static getRpcUrl() {
    return SUI_RPC_URL;
  }
}

export default SuiIntegrationService;
