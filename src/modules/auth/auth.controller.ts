import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  return res.status(201).json({
    message: "User registered successfully",
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    return res.status(200).json({
      message: "Login success",
      token: "dummy-token",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login error",
    });
  }
};