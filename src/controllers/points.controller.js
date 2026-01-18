const PointLedger = require("../models/PointLedger");

exports.balance = async (req, res) => {
  res.json({ points: req.user.pointsBalance });
};

exports.ledger = async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const rows = await PointLedger.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(limit);
  res.json({ items: rows });
};
