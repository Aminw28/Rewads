const router = require("express").Router();
const { auth } = require("../middleware/auth");
const c = require("../controllers/redeem.controller");

router.post("/request", auth, c.requestRedeem);
router.get("/my", auth, c.myRequests);

module.exports = router;
