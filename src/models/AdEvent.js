const mongoose = require("mongoose");

const AdEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    sessionId: { type: String, index: true, required: true, unique: true },
    adNetwork: { type: String, default: "unknown" },
    adUnitId: { type: String, default: "" },

    status: { type: String, enum: ["completed", "rejected"], required: true },
    pointsGranted: { type: Number, default: 0 },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    deviceHash: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdEvent", AdEventSchema);
