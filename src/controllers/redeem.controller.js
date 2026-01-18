const Reward = require("../models/Reward");
const RedeemRequest = require("../models/RedeemRequest");
const PointLedger = require("../models/PointLedger");
const User = require("../models/User");
const { redeemSchema } = require("../utils/validators");

exports.requestRedeem = async (req, res) => {
  const data = redeemSchema.parse(req.body);

  const minAgeDays = Number(process.env.MIN_REDEEM_ACCOUNT_AGE_DAYS || 7);
  const createdAt = new Date(req.user.createdAt).getTime();
  const ageDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
  if (ageDays < minAgeDays) return res.status(403).json({ message: `Account too new. Need ${minAgeDays} days.` });

  const reward = await Reward.findOne({ _id: data.rewardId, isActive: true });
  if (!reward) return res.status(404).json({ message: "Reward not found" });

  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (user.pointsBalance < reward.costPoints) {
    return res.status(400).json({ message: "Not enough points" });
  }

  // debit points immediately (safe)
  user.pointsBalance -= reward.costPoints;
  await user.save();

  const rr = await RedeemRequest.create({
    userId: user._id,
    rewardId: reward._id,
    costPoints: reward.costPoints,
    targetPhone: data.targetPhone,
    status: "pending"
  });

  await PointLedger.create({
    userId: user._id,
    type: "REDEEM_DEBIT",
    amount: -reward.costPoints,
    refId: String(rr._id),
    balanceAfter: user.pointsBalance
  });

  res.json({ ok: true, requestId: rr._id, points: user.pointsBalance, status: rr.status });
};

exports.myRequests = async (req, res) => {
  const items = await RedeemRequest.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50).populate("rewardId");
  res.json({ items });
};
