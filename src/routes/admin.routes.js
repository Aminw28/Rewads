const router = require("express").Router();
const { auth, requireAdmin } = require("../middleware/auth");
const c = require("../controllers/admin.controller");

router.get("/redeem", auth, requireAdmin, c.listRedeems);
router.post("/redeem/:id/approve", auth, requireAdmin, c.approve);
router.post("/redeem/:id/reject", auth, requireAdmin, c.reject);

module.exports = router;
