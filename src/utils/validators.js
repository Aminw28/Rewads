const { z } = require("zod");

exports.registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(8).optional(),
  password: z.string().min(6)
});

exports.loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

exports.completeAdSchema = z.object({
  sessionId: z.string().min(10),
  adNetwork: z.string().optional(),
  adUnitId: z.string().optional(),
  deviceHash: z.string().optional()
});

exports.redeemSchema = z.object({
  rewardId: z.string().min(10),
  targetPhone: z.string().min(8)
});
