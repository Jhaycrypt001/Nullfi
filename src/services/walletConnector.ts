/**
 * Universal Wallet Connector - Support ANY Sui Wallet
 */

export interface WalletAdapter {
  name: string;
  connect: () => Promise<string>;
  signAndExecuteTransaction: (transaction: any) => Promise<any>;
  getBalance: (address: string) => Promise<number>;
}

class UniversalWalletConnector {
  private adapter: WalletAdapter | null = null;

  /**
   * Auto-detect and connect to ANY Sui wallet
   */
  async detectAndConnect(): Promise<string> {
    console.log('🔍 Detecting available wallets...');

    // Try OKX Wallet
    if ((window as any).okxwallet) {
      console.log('✅ Found OKX Wallet');
      this.adapter = new OKXWalletAdapter();
      return await this.adapter.connect();
    }

    // Try Sui Wallet (official)
    if ((window as any).suiWallet) {
      console.log('✅ Found Sui Wallet');
      this.adapter = new SuiWalletAdapter();
      return await this.adapter.connect();
    }

    // Try Suiet
    if ((window as any).suiet) {
      console.log('✅ Found Suiet Wallet');
      this.adapter = new SuietAdapter();
      return await this.adapter.connect();
    }

    throw new Error('❌ No Sui wallet detected. Install Sui Wallet, OKX, or Suiet.');
  }

  /**
   * Sign and execute transaction with current wallet
   */
  async signAndExecuteTransaction(transaction: any): Promise<string> {
    if (!this.adapter) {
      throw new Error('❌ Wallet not connected');
    }

    console.log('🔔 Requesting wallet signature...');
    const result = await this.adapter.signAndExecuteTransaction(transaction);
    return result.digest;
  }

  /**
   * Get current wallet
   */
  getWallet(): WalletAdapter | null {
    return this.adapter;
  }
}

/**
 * OKX Wallet Implementation
 */
class OKXWalletAdapter implements WalletAdapter {
  name = 'OKX Wallet';

  async connect(): Promise<string> {
    const okxWallet = (window as any).okxwallet;
    const result = await okxWallet.requestPermissions();
    const address = result.accounts[0]?.address;
    if (!address) throw new Error('Failed to get address');
    return address;
  }

  async signAndExecuteTransaction(transaction: any): Promise<any> {
    const okxWallet = (window as any).okxwallet;
    return await okxWallet.sui.signAndExecuteTransactionBlock({
      transactionBlock: transaction,
    });
  }

  async getBalance(address: string): Promise<number> {
    // Implement balance fetching
    return 0;
  }
}

/**
 * Sui Wallet Implementation
 */
class SuiWalletAdapter implements WalletAdapter {
  name = 'Sui Wallet';

  async connect(): Promise<string> {
    const suiWallet = (window as any).suiWallet;
    const result = await suiWallet.requestPermissions();
    const address = result.accounts[0]?.address;
    if (!address) throw new Error('Failed to get address');
    return address;
  }

  async signAndExecuteTransaction(transaction: any): Promise<any> {
    const suiWallet = (window as any).suiWallet;
    return await suiWallet.signAndExecuteTransactionBlock({
      transactionBlock: transaction,
    });
  }

  async getBalance(address: string): Promise<number> {
    return 0;
  }
}

/**
 * Suiet Wallet Implementation
 */
class SuietAdapter implements WalletAdapter {
  name = 'Suiet';

  async connect(): Promise<string> {
    const suiet = (window as any).suiet;
    const result = await suiet.requestPermissions();
    const address = result.accounts[0]?.address;
    if (!address) throw new Error('Failed to get address');
    return address;
  }

  async signAndExecuteTransaction(transaction: any): Promise<any> {
    const suiet = (window as any).suiet;
    return await suiet.signAndExecuteTransactionBlock({
      transactionBlock: transaction,
    });
  }

  async getBalance(address: string): Promise<number> {
    return 0;
  }
}

export default new UniversalWalletConnector();
