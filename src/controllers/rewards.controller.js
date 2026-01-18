const Reward = require("../models/Reward");

exports.list = async (req, res) => {
  const items = await Reward.find({ isActive: true }).sort({ costPoints: 1 });
  res.json({ items });
};

// endpoint مساعد لملء الجوائز بسرعة (تحذف لاحقاً)
exports.seed = async (req, res) => {
  const existing = await Reward.countDocuments();
  if (existing > 0) return res.json({ message: "Already seeded" });

  await Reward.insertMany([
    { title: "Recharge 5 MAD", costPoints: 700, valueMAD: 5, isActive: true },
    { title: "Recharge 10 MAD", costPoints: 1400, valueMAD: 10, isActive: true }
  ]);

  res.json({ ok: true });
};
