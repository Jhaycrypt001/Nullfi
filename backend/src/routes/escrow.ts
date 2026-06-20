import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { EscrowService } from "../services/escrowService.ts";
import { SuiClient } from "@mysten/sui.js/client";
import { verifyToken } from "../middleware/auth.ts";

const router = Router();
const prisma = new PrismaClient();
const suiClient = new SuiClient({
  url: process.env.SUI_RPC_URL || "https://fullnode.testnet.sui.io:443",
});
const escrowService = new EscrowService(suiClient);

// Middleware to verify JWT token
router.use(verifyToken);

// Get user's escrows - by wallet address
router.get("/", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        error: "walletAddress query parameter required",
      });
    }

    const escrows = await escrowService.getUserEscrows(walletAddress as string);

    res.json({
      success: true,
      escrows,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Create escrow - REAL Sui blockchain
router.post("/create", async (req: Request, res: Response) => {
  try {
    const {
      clientAddress,
      freelancerAddress,
      jobTitle,
      jobDescription,
      category,
      totalAmount,
      milestoneCount,
    } = req.body;

    // Validate input
    if (
      !clientAddress ||
      !freelancerAddress ||
      !jobTitle ||
      !category ||
      !totalAmount ||
      !milestoneCount
    ) {
      return res.status(400).json({
        error: "Missing required fields: clientAddress, freelancerAddress, jobTitle, category, totalAmount, milestoneCount",
      });
    }

    const result = await escrowService.createEscrow({
      clientAddress,
      freelancerAddress,
      jobTitle,
      jobDescription,
      category,
      totalAmount: Number(totalAmount),
      milestoneCount: Number(milestoneCount),
    });

    res.status(201).json({
      success: true,
      ...result,
      message: "Escrow created on Sui blockchain",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get escrow details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const escrow = await escrowService.getEscrow(id);

    res.json({
      success: true,
      escrow,
    });
  } catch (error: any) {
    res.status(404).json({
      error: error.message,
    });
  }
});

// Release milestone - REAL Sui blockchain
router.post("/:id/release-milestone", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { clientAddress, milestoneNum } = req.body;

    if (!clientAddress || !milestoneNum) {
      return res.status(400).json({
        error: "clientAddress and milestoneNum required",
      });
    }

    const result = await escrowService.releaseMilestone({
      escrowId: id,
      milestoneNum: Number(milestoneNum),
      clientAddress,
    });

    res.json({
      success: true,
      ...result,
      message: "Milestone released on Sui blockchain",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Dispute escrow - REAL Sui blockchain
router.post("/:id/dispute", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { initiatorAddress, reason } = req.body;

    if (!initiatorAddress) {
      return res.status(400).json({
        error: "initiatorAddress required",
      });
    }

    if (!reason) {
      return res.status(400).json({
        error: "Dispute reason required",
      });
    }

    const result = await escrowService.disputeEscrow({
      escrowId: id,
      reason,
      initiatorAddress,
    });

    res.json({
      success: true,
      ...result,
      message: "Dispute initiated on Sui blockchain",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

export default router;
