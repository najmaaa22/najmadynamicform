import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


interface AuthUser {
  id: string;
  role: "admin" | "user";
  email: string;
}

interface AuthRequest extends Request {
  user?: AuthUser;
}


export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        message: "JWT secret not configured",
      });
    }

    const decoded = jwt.verify(token, secret) as any;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Forbidden: Admin access only",
  });
};