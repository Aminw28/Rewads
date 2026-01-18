require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const pointsRoutes = require("./routes/points.routes");
const adsRoutes = require("./routes/ads.routes");
const rewardsRoutes = require("./routes/rewards.routes");
const redeemRoutes = require("./routes/redeem.routes");
const adminRoutes = require("./routes/admin.routes");
const { errorHandler } = require("./middleware/error");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "200kb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/", (req, res) => res.json({ ok: true, name: "rewards-backend" }));

app.use("/auth", authRoutes);
app.use("/points", pointsRoutes);
app.use("/ads", adsRoutes);
app.use("/rewards", rewardsRoutes);
app.use("/redeem", redeemRoutes);
app.use("/admin", adminRoutes);
app.set("etag", false);
app.use(errorHandler);

const port = process.env.PORT || 5000;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
  app.listen(port, () => console.log(`API running on :${port}`));
})();

