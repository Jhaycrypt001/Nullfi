import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

export class SuiService {
  private client: SuiClient;
  private network: string;

  constructor() {
    this.network = process.env.SUI_NETWORK || 'testnet';
    const rpcUrl = process.env.SUI_RPC_URL || getFullnodeUrl(this.network);
    this.client = new SuiClient({ url: rpcUrl });
  }

  async getClient(): Promise<SuiClient> {
    return this.client;
  }

  async getNetworkStatus() {
    try {
      const ref = await this.client.getReferenceGasPrice();
      return {
        network: this.network,
        status: 'OK',
        gasPrice: ref,
        rpcUrl: process.env.SUI_RPC_URL,
      };
    } catch (error) {
      return {
        network: this.network,
        status: 'ERROR',
        error: (error as Error).message,
      };
    }
  }

  // Get escrow details from blockchain
  async getEscrowDetails(escrowId: string) {
    try {
      const object = await this.client.getObject({
        id: escrowId,
        options: {
          showContent: true,
          showBcs: false,
        },
      });
      return object;
    } catch (error) {
      console.error('Error fetching escrow:', error);
      return null;
    }
  }

  // Verify transaction
  async verifyTransaction(txDigest: string) {
    try {
      const tx = await this.client.getTransactionBlock({
        digest: txDigest,
        options: {
          showEffects: true,
          showInput: false,
        },
      });
      return tx;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return null;
    }
  }

  // Get balance
  async getBalance(address: string) {
    try {
      const balance = await this.client.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI',
      });
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }
}
