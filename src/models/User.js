const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true, required: true },
    phone: { type: String, index: true },
    passwordHash: { type: String, required: true },

    pointsBalance: { type: Number, default: 0 },

    dailyAdsCount: { type: Number, default: 0 },
    dailyAdsResetAt: { type: Date, default: () => new Date() },
    lastAdAt: { type: Date, default: null },

    riskScore: { type: Number, default: 0 },
    roles: { type: [String], default: ["user"] }, // add "admin" manually
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
