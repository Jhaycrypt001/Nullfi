import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key") as any;
    (req as any).userId = decoded.userId;
    (req as any).walletAddress = decoded.walletAddress;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: "Invalid token",
    });
  }
}
