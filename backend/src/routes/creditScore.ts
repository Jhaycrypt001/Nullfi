import { Router, Request, Response } from "express";
import { CreditScoreService } from "../services/creditScoreService.ts";
import SuiContractService from "../services/suiContractService.ts";
import { verifyToken } from "../middleware/auth.ts";

const router = Router();
const creditScoreService = new CreditScoreService();

// Middleware
router.use(verifyToken);

// Rate a user (must be before /:userId)
router.post("/rate", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { ratedId, escrowId, rating, comment } = req.body;

    if (!ratedId || !escrowId || !rating) {
      return res.status(400).json({
        error: "Missing required fields: ratedId, escrowId, rating",
      });
    }

    const newRating = await creditScoreService.rateUser({
      raterId: userId,
      ratedId,
      escrowId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      rating: newRating,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get current user's credit score - REAL Sui blockchain
router.get("/me", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        error: "walletAddress query parameter required",
      });
    }

    // Fetch credit score from Sui blockchain
    const creditScore = await SuiContractService.getCreditScoreOnChain(walletAddress as string);

    res.json({
      success: true,
      creditScore: creditScore || { rating: 50, tier: "TIER_4" },
      source: "Sui Blockchain",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get escrow ratings (must be before /:userId)
router.get("/escrow/:escrowId", async (req: Request, res: Response) => {
  try {
    const { escrowId } = req.params;
    const ratings = await creditScoreService.getEscrowRating(escrowId);

    res.json({
      success: true,
      ratings,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get user's credit score - REAL Sui blockchain (wallet address)
router.get("/:walletAddress", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    // Fetch credit score from Sui blockchain
    const creditScore = await SuiContractService.getCreditScoreOnChain(walletAddress);

    res.json({
      success: true,
      creditScore: creditScore || { rating: 50, tier: "TIER_4" },
      source: "Sui Blockchain",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get user's ratings (must be after specific routes)
router.get("/:userId/ratings", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const ratings = await creditScoreService.getUserRatings(userId);

    res.json({
      success: true,
      ratings,
      count: ratings.length,
      averageRating:
        ratings.length > 0
          ? (
              ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            ).toFixed(1)
          : 0,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

export default router;
