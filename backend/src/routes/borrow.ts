import { Router, Request, Response } from "express";
import { BorrowService } from "../services/borrowService.ts";
import { verifyToken } from "../middleware/auth.ts";

const router = Router();
const borrowService = new BorrowService();

// Middleware
router.use(verifyToken);

// Create borrow - REAL Sui blockchain
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { walletAddress, borrowAmount, durationDays } = req.body;

    if (!walletAddress || !borrowAmount || !durationDays) {
      return res.status(400).json({
        error: "walletAddress, borrowAmount, and durationDays required",
      });
    }

    const result = await borrowService.borrowSUI({
      userAddress: walletAddress,
      borrowAmount: Number(borrowAmount),
      durationDays: Number(durationDays),
    });

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get borrow details
router.get("/:borrowId", async (req: Request, res: Response) => {
  try {
    const { borrowId } = req.params;
    const borrow = await borrowService.getBorrow(borrowId);

    res.json({
      success: true,
      borrow,
    });
  } catch (error: any) {
    res.status(404).json({
      error: error.message,
    });
  }
});

// Get user's borrows - by wallet address
router.get("/", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        error: "walletAddress query parameter required",
      });
    }

    const borrows = await borrowService.getUserLoans(walletAddress as string);

    res.json({
      success: true,
      borrows,
      count: borrows.length,
      active: borrows.filter((b) => b.status === "ACTIVE").length,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get active borrows
router.get("/active", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const borrows = await borrowService.getActiveBorrows(userId);

    res.json({
      success: true,
      borrows,
      count: borrows.length,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Repay borrow - REAL Sui blockchain
router.post("/:borrowId/repay", async (req: Request, res: Response) => {
  try {
    const { borrowId } = req.params;
    const { walletAddress, repayAmount } = req.body;

    if (!walletAddress || !repayAmount) {
      return res.status(400).json({
        error: "walletAddress and repayAmount required",
      });
    }

    const result = await borrowService.repayLoan({
      loanId: borrowId,
      userAddress: walletAddress,
      repayAmount: Number(repayAmount),
    });

    res.json({
      success: true,
      ...result,
      message: result.isFullyRepaid
        ? "Loan fully repaid on Sui blockchain!"
        : "Payment applied on Sui blockchain. Thank you!",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Check for defaults (admin endpoint)
router.post("/admin/check-defaults", async (req: Request, res: Response) => {
  try {
    const defaultCount = await borrowService.checkDefaults();

    res.json({
      success: true,
      defaultCount,
      message: `${defaultCount} borrows marked as defaulted`,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

export default router;
