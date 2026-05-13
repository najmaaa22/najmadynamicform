import rateLimit from "express-rate-limit";

const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many submissions. Please try again after a minute.",
  },
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || "anonymous";

    return ip.replace(/^::ffff:/, "");
  },
  validate: { xForwardedForHeader: false },
});

export default submissionLimiter;