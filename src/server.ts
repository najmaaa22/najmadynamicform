import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI not configured");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT secret not configured");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.log("DB Error:", err);
  });