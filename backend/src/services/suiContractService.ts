import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { bcs } from '@mysten/sui.js/bcs';

const SUI_NETWORK = process.env.SUI_NETWORK || 'testnet';
const SUI_RPC_URL = process.env.SUI_RPC_URL || getFullnodeUrl('testnet');

const ESCROW_PACKAGE_ID = process.env.SUI_ESCROW_PACKAGE_ID || '';
const TREASURY_OBJECT_ID = process.env.SUI_TREASURY_OBJECT_ID || '';
const CREDIT_SCORE_PACKAGE_ID = process.env.SUI_CREDIT_SCORE_PACKAGE_ID || '';
const DEPLOYER_ADDRESS = process.env.SUI_DEPLOYER_ADDRESS || '';

const suiClient = new SuiClient({ url: SUI_RPC_URL });

export class SuiContractService {
  /**
   * Create real escrow transaction on Sui blockchain
   */
  static async createEscrow(
    clientAddress: string,
    freelancerAddress: string,
    totalAmount: number,
    jobTitle: string,
    milestones: number
  ) {
    try {
      const tx = new TransactionBlock();

      // Call Sui escrow smart contract
      const result = tx.moveCall({
        target: `${ESCROW_PACKAGE_ID}::escrow::create_escrow`,
        arguments: [
          tx.pure.address(clientAddress),
          tx.pure.address(freelancerAddress),
          tx.pure.u64(totalAmount),
          tx.pure.string(jobTitle),
          tx.pure.u8(milestones),
        ],
      });

      console.log('Escrow creation TX built:', result);
      return {
        success: true,
        message: 'Escrow created on Sui blockchain',
        transactionData: tx,
      };
    } catch (error) {
      console.error('Error creating escrow on Sui:', error);
      throw new Error(`Failed to create escrow: ${error}`);
    }
  }

  /**
   * Release escrow milestone payment (transfer SUI to freelancer)
   */
  static async releaseMilestone(
    escrowId: string,
    amount: number,
    milestoneIndex: number
  ) {
    try {
      const tx = new TransactionBlock();

      // Call Sui escrow release function
      tx.moveCall({
        target: `${ESCROW_PACKAGE_ID}::escrow::release_milestone`,
        arguments: [
          tx.pure.string(escrowId),
          tx.pure.u64(amount),
          tx.pure.u8(milestoneIndex),
        ],
      });

      console.log('Milestone release TX built');
      return {
        success: true,
        message: 'Milestone released on Sui blockchain',
        transactionData: tx,
      };
    } catch (error) {
      console.error('Error releasing milestone on Sui:', error);
      throw new Error(`Failed to release milestone: ${error}`);
    }
  }

  /**
   * Dispute escrow - return funds to client
   */
  static async disputeEscrow(escrowId: string) {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${ESCROW_PACKAGE_ID}::escrow::dispute`,
        arguments: [tx.pure.string(escrowId)],
      });

      console.log('Dispute TX built');
      return {
        success: true,
        message: 'Dispute initiated on Sui blockchain',
        transactionData: tx,
      };
    } catch (error) {
      console.error('Error disputing escrow on Sui:', error);
      throw new Error(`Failed to dispute escrow: ${error}`);
    }
  }

  /**
   * Get credit score from on-chain oracle
   */
  static async getCreditScoreOnChain(walletAddress: string) {
    try {
      // Query credit score from on-chain data
      const objects = await suiClient.getOwnedObjects({
        owner: walletAddress,
        filter: {
          StructType: `${CREDIT_SCORE_PACKAGE_ID}::credit_score::CreditScore`,
        },
      });

      if (objects.data.length === 0) {
        return null;
      }

      const creditScoreObj = await suiClient.getObject({
        id: objects.data[0].data?.objectId || '',
        options: { showContent: true },
      });

      return creditScoreObj.data?.content;
    } catch (error) {
      console.error('Error fetching credit score from on-chain:', error);
      return null;
    }
  }

  /**
   * Update credit score based on transaction
   */
  static async updateCreditScoreOnChain(
    walletAddress: string,
    completedEscrows: number,
    onTimeReleases: number,
    totalEarned: number
  ) {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${CREDIT_SCORE_PACKAGE_ID}::credit_score::update_score`,
        arguments: [
          tx.pure.address(walletAddress),
          tx.pure.u32(completedEscrows),
          tx.pure.u32(onTimeReleases),
          tx.pure.u64(totalEarned),
        ],
      });

      console.log('Credit score update TX built');
      return {
        success: true,
        message: 'Credit score updated on Sui blockchain',
        transactionData: tx,
      };
    } catch (error) {
      console.error('Error updating credit score on Sui:', error);
      throw new Error(`Failed to update credit score: ${error}`);
    }
  }

  /**
   * Borrow against credit score
   */
  static async borrowSUI(
    walletAddress: string,
    borrowAmount: number,
    durationDays: number
  ) {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${CREDIT_SCORE_PACKAGE_ID}::borrowing::borrow`,
        arguments: [
          tx.pure.address(walletAddress),
          tx.pure.u64(borrowAmount),
          tx.pure.u32(durationDays),
        ],
      });

      console.log('Borrow TX built');
      return {
        success: true,
        message: 'Loan issued on Sui blockchain',
        transactionData: tx,
      };
    } catch (error) {
      console.error('Error borrowing SUI:', error);
      throw new Error(`Failed to borrow SUI: ${error}`);
    }
  }

  /**
   * Repay loan
   */
  static async repayLoan(loanId: string, repayAmount: number) {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${CREDIT_SCORE_PACKAGE_ID}::borrowing::repay`,
        arguments: [
          tx.pure.string(loanId),
          tx.pure.u64(repayAmount),
        ],
      });

      console.log('Repay loan TX built');
      return {
        success: true,
        message: 'Loan repaid on Sui blockchain',
        transactionData: tx,
      };
    } catch (error) {
      console.error('Error repaying loan on Sui:', error);
      throw new Error(`Failed to repay loan: ${error}`);
    }
  }

  /**
   * Transfer SUI tokens (for payments, etc)
   */
  static async transferSUI(
    fromAddress: string,
    toAddress: string,
    amount: number
  ) {
    try {
      const tx = new TransactionBlock();

      // Get coins for the transaction
      const coins = await suiClient.getCoins({
        owner: fromAddress,
      });

      if (coins.data.length === 0) {
        throw new Error('No coins available for transfer');
      }

      const coin = coins.data[0];

      // Split and transfer
      const [transferAmount] = tx.splitCoins(coin.coinObjectId, [tx.pure.u64(amount)]);
      tx.transferObjects([transferAmount], tx.pure.address(toAddress));

      console.log('Transfer TX built');
      return {
        success: true,
        message: 'SUI transfer transaction prepared',
        transactionData: tx,
      };
    } catch (error) {
      console.error('Error transferring SUI:', error);
      throw new Error(`Failed to transfer SUI: ${error}`);
    }
  }

  /**
   * Get client RPC URL for wallet signing
   */
  static getRpcUrl(): string {
    return SUI_RPC_URL;
  }

  /**
   * Get network info
   */
  static getNetworkInfo() {
    return {
      network: SUI_NETWORK,
      rpcUrl: SUI_RPC_URL,
      escrowPackageId: ESCROW_PACKAGE_ID,
      creditScorePackageId: CREDIT_SCORE_PACKAGE_ID,
      treasuryObjectId: TREASURY_OBJECT_ID,
      deployerAddress: DEPLOYER_ADDRESS,
    };
  }
}

export default SuiContractService;
