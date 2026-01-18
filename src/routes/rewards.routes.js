const router = require("express").Router();
const { auth, requireAdmin } = require("../middleware/auth");
const c = require("../controllers/rewards.controller");

router.get("/", auth, c.list);
router.post("/seed", auth, requireAdmin, c.seed); // مؤقت

module.exports = router;
