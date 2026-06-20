/**
 * useWallet Hook - Connect to Sui Wallet & Get Balance
 */

import { useState, useCallback, useEffect } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export interface UseWalletReturn {
  address: string | null;
  balance: number | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

export const useWallet = (): UseWalletReturn => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get balance from Sui blockchain
  const fetchBalance = useCallback(async (walletAddress: string) => {
    try {
      const coins = await suiClient.getCoins({
        owner: walletAddress,
        coinType: '0x2::sui::SUI',
      });

      const totalBalance = coins.data.reduce((sum, coin) => {
        return sum + BigInt(coin.balance);
      }, BigInt(0));

      // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
      const suiBalance = Number(totalBalance) / 1_000_000_000;
      setBalance(suiBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const wallet = (window as any).suiWallet;

      if (!wallet) {
        throw new Error('Sui Wallet extension not found. Please install it from Chrome Web Store.');
      }

      // Request connection
      const result = await wallet.requestPermissions();
      const walletAddress = result.accounts[0]?.address;

      if (!walletAddress) {
        throw new Error('Failed to get wallet address');
      }

      setAddress(walletAddress);
      await fetchBalance(walletAddress);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalance]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setError(null);
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!address) return;
    await fetchBalance(address);
  }, [address, fetchBalance]);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const attemptAutoConnect = async () => {
      try {
        const wallet = (window as any).suiWallet;
        if (wallet?.accounts?.length > 0) {
          const walletAddress = wallet.accounts[0]?.address;
          if (walletAddress) {
            setAddress(walletAddress);
            await fetchBalance(walletAddress);
          }
        }
      } catch (err) {
        console.log('Auto-connect skipped');
      }
    };

    attemptAutoConnect();
  }, [fetchBalance]);

  return {
    address,
    balance,
    isConnected: !!address,
    isLoading,
    error,
    connect,
    disconnect,
    refreshBalance,
  };
};

export default useWallet;
