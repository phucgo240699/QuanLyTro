const router = require("express").Router();

const authController = require("../controllers/auth");

const { checkIsAdmin } = require("../services/checkAdmin");
const { authenticateToken } = require("../services/authenticateToken");

router.post("/login", authController.login);
router.post(
  "/register",
  authenticateToken,
  checkIsAdmin,
  authController.register
);
router.put("/:id", authenticateToken, checkIsAdmin, authController.updateUser);
router.delete(
  "/:id",
  authenticateToken,
  checkIsAdmin,
  authController.deleteUser
);

module.exports = router;
