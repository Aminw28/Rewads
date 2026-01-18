const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { registerSchema, loginSchema } = require("../utils/validators");

const sign = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "14d" });

exports.register = async (req, res) => {
  const data = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: data.email });
  if (exists) return res.status(400).json({ message: "Email already used" });

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({ email: data.email, phone: data.phone, passwordHash });

  res.json({ token: sign(user._id), user: { id: user._id, email: user.email, points: user.pointsBalance } });
};

exports.login = async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  res.json({ token: sign(user._id), user: { id: user._id, email: user.email, points: user.pointsBalance } });
};

exports.me = async (req, res) => {
  // ✅ منع الكاش باش ما يرجعش 304
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");

  // ✅ رجّع user بشكل بسيط وواضح
  return res.status(200).json({
    id: String(req.user._id),
    email: req.user.email,
    phone: req.user.phone,
    points: req.user.pointsBalance || 0,
    roles: req.user.roles || ["user"],
    createdAt: req.user.createdAt,
  });
};