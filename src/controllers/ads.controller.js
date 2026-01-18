const User = require("../models/User");
const AdEvent = require("../models/AdEvent");
const PointLedger = require("../models/PointLedger");
const AdSession = require("../models/AdSession");
const { randomId } = require("../utils/hash");
const { completeAdSchema } = require("../utils/validators");

function resetDailyIfNeeded(user) {
  const now = new Date();
  const resetAt = user.dailyAdsResetAt || now;
  if (now.toDateString() !== new Date(resetAt).toDateString()) {
    user.dailyAdsCount = 0;
    user.dailyAdsResetAt = now;
  }
}

exports.createSession = async (req, res) => {
  const user = req.user;
  resetDailyIfNeeded(user);

  const dailyLimit = Number(process.env.DAILY_AD_LIMIT || 20);
  const cooldownSec = Number(process.env.AD_COOLDOWN_SECONDS || 60);
  const ttlMinutes = Number(process.env.AD_SESSION_TTL_MINUTES || 10);

  if (user.dailyAdsCount >= dailyLimit) {
    return res.status(429).json({ message: "Daily limit reached" });
  }

  // cooldown based on lastAdAt (last session/complete)
  if (user.lastAdAt) {
    const diff = (Date.now() - new Date(user.lastAdAt).getTime()) / 1000;
    if (diff < cooldownSec) {
      return res.status(429).json({ message: "Cooldown", cooldownRemaining: Math.ceil(cooldownSec - diff) });
    }
  }

  const sessionId = randomId(16);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // ✅ create a DB session record (TTL will clean it)
  await AdSession.create({
    userId: user._id,
    sessionId,
    status: "created",
    expiresAt,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || ""
  });

  // ✅ مهم: نحسبو cooldown من هنا باش ما يسباميش createSession
  user.lastAdAt = new Date();
  await user.save();

  res.json({ sessionId, pointsOnComplete: 1, expiresAt });
};

exports.complete = async (req, res) => {
  const data = completeAdSchema.parse(req.body);

  // ✅ Atomic claim: نبدلو status من created -> completed مرة وحدة
  // إذا لقاها منتهية ولا مكتملة مسبقاً -> ما غاديش يلقى match
  const now = new Date();

  const session = await AdSession.findOneAndUpdate(
    {
      sessionId: data.sessionId,
      status: "created",
      expiresAt: { $gt: now }
    },
    {
      $set: {
        status: "completed",
        adNetwork: data.adNetwork || "unknown",
        adUnitId: data.adUnitId || "",
        deviceHash: data.deviceHash || ""
      }
    },
    { new: true }
  );

  if (!session) {
    // نميزو الأخطاء قدر الإمكان:
    const exists = await AdSession.findOne({ sessionId: data.sessionId }).select("status expiresAt userId");
    if (!exists) return res.status(400).json({ message: "Invalid session" });
    if (exists.expiresAt && exists.expiresAt <= now) return res.status(400).json({ message: "Session expired" });
    if (String(exists.userId) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
    // status likely completed already
    return res.status(200).json({ message: "Already rewarded", points: req.user.pointsBalance });
  }

  // check correct user
  if (String(session.userId) !== String(req.user._id)) {
    // حماية إضافية: رجّع session لexpired باش ما تُستعملش
    await AdSession.updateOne({ _id: session._id }, { $set: { status: "expired" } });
    return res.status(403).json({ message: "Forbidden" });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // re-check limits (important)
  resetDailyIfNeeded(user);
  const dailyLimit = Number(process.env.DAILY_AD_LIMIT || 20);

  if (user.dailyAdsCount >= dailyLimit) {
    await AdEvent.create({
      userId: user._id,
      sessionId: data.sessionId,
      adNetwork: session.adNetwork || "unknown",
      adUnitId: session.adUnitId || "",
      status: "rejected",
      pointsGranted: 0,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
      deviceHash: session.deviceHash || ""
    });
    return res.status(429).json({ message: "Daily limit reached" });
  }

  const points = 1;

  user.pointsBalance += points;
  user.dailyAdsCount += 1;
  user.lastAdAt = new Date();
  await user.save();

  // ✅ idempotency extra: sessionId unique in AdEvent (عندك unique)
  await AdEvent.create({
    userId: user._id,
    sessionId: data.sessionId,
    adNetwork: session.adNetwork || "unknown",
    adUnitId: session.adUnitId || "",
    status: "completed",
    pointsGranted: points,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "",
    deviceHash: session.deviceHash || ""
  });

  await PointLedger.create({
    userId: user._id,
    type: "EARN_AD",
    amount: points,
    refId: data.sessionId,
    balanceAfter: user.pointsBalance
  });

  res.json({ ok: true, added: points, points: user.pointsBalance, dailyAdsCount: user.dailyAdsCount });
};
