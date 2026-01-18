const router = require("express").Router();
const { auth } = require("../middleware/auth");
const c = require("../controllers/ads.controller");

router.post("/session", auth, c.createSession);
router.post("/complete", auth, c.complete);

module.exports = router;
