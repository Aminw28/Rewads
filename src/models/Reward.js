const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    costPoints: { type: Number, required: true },
    valueMAD: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);
