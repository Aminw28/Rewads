const mongoose = require("mongoose");

const PointLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    type: { type: String, enum: ["EARN_AD", "REDEEM_DEBIT", "MANUAL_ADJUST"], required: true },
    amount: { type: Number, required: true }, // + or -
    refId: { type: String, default: "" },
    balanceAfter: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointLedger", PointLedgerSchema);
