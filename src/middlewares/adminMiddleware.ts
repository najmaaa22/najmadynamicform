import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
    
  };
}

export const isAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Unauthorized: No user information found." 
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Forbidden: Admin rights required." 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error in admin middleware" });
  }
};