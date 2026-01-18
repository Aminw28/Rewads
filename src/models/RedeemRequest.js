const mongoose = require("mongoose");

const RedeemRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },

    costPoints: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "paid"], default: "pending", index: true },

    targetPhone: { type: String, required: true },
    notes: { type: String, default: "" },

    decidedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RedeemRequest", RedeemRequestSchema);
