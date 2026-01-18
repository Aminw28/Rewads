const RedeemRequest = require("../models/RedeemRequest");

exports.listRedeems = async (req, res) => {
  const status = req.query.status || "pending";
  const items = await RedeemRequest.find({ status }).sort({ createdAt: 1 }).limit(100).populate("rewardId").populate("userId");
  res.json({ items });
};

exports.approve = async (req, res) => {
  const id = req.params.id;
  const rr = await RedeemRequest.findById(id);
  if (!rr) return res.status(404).json({ message: "Not found" });
  if (rr.status !== "pending") return res.status(400).json({ message: "Not pending" });

  rr.status = "approved";
  rr.decidedAt = new Date();
  await rr.save();

  res.json({ ok: true });
};

exports.reject = async (req, res) => {
  const id = req.params.id;
  const rr = await RedeemRequest.findById(id);
  if (!rr) return res.status(404).json({ message: "Not found" });
  if (rr.status !== "pending") return res.status(400).json({ message: "Not pending" });

  rr.status = "rejected";
  rr.decidedAt = new Date();
  rr.notes = (req.body && req.body.notes) ? String(req.body.notes) : rr.notes;
  await rr.save();

  res.json({ ok: true });
};
