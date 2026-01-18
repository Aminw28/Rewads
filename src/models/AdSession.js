const mongoose = require("mongoose");

const AdSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },

    // session public id اللي كيرجع للكلينت
    sessionId: { type: String, required: true, unique: true, index: true },

    status: { type: String, enum: ["created", "completed", "expired"], default: "created", index: true },

    adNetwork: { type: String, default: "unknown" },
    adUnitId: { type: String, default: "" },

    deviceHash: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },

    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

// TTL index: MongoDB غادي يحيد الدوكمنت منين يدوز expiresAt
AdSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AdSession", AdSessionSchema);
