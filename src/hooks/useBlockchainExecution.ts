/**
 * useBlockchainExecution Hook
 * Proper wallet integration using @mysten/dapp-kit
 */

import { useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui.js/transactions';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export function useBlockchainExecution() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransfer = async (
    senderAddress: string,
    recipientAddress: string,
    amountInMist: number
  ): Promise<{ success: boolean; digest?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔔 Building transaction...');

      // Build the transaction
      const tx = new Transaction();
      tx.setSender(senderAddress);

      // Split gas to get the amount
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

      // Transfer to recipient
      tx.transferObjects([coin], tx.pure.address(recipientAddress));

      console.log('📝 Transaction ready, requesting wallet signature...');

      // Get wallet and sign
      const wallet = getActiveWallet();
      if (!wallet) {
        throw new Error('No wallet connected');
      }

      // Call wallet to sign and execute
      console.log('🔔 WALLET POPUP APPEARING NOW...');
      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      const digest = result.digest;
      console.log('✅ Signed! Digest:', digest);

      // Wait for confirmation
      console.log('⏳ Waiting for blockchain confirmation...');
      await suiClient.waitForTransaction({ digest });

      console.log('🎉 CONFIRMED ON BLOCKCHAIN!');

      return {
        success: true,
        digest,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Error:', errorMsg);
      setError(errorMsg);

      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeTransfer,
    isLoading,
    error,
  };
}

/**
 * Get the active/connected wallet from browser
 */
function getActiveWallet(): any {
  // Try OKX Wallet
  if ((window as any).okxwallet) {
    const okx = (window as any).okxwallet;
    console.log('✅ Using OKX Wallet');
    return okx;
  }

  // Try Sui Wallet
  if ((window as any).suiWallet) {
    const sui = (window as any).suiWallet;
    console.log('✅ Using Sui Wallet');
    return sui;
  }

  // Try Suiet
  if ((window as any).suiet) {
    const suiet = (window as any).suiet;
    console.log('✅ Using Suiet');
    return suiet;
  }

  return null;
}
