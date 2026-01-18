const router = require("express").Router();
const { auth } = require("../middleware/auth");
const c = require("../controllers/points.controller");

router.get("/balance", auth, c.balance);
router.get("/ledger", auth, c.ledger);

module.exports = router;
