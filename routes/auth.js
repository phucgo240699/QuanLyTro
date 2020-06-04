const router = require("express").Router();

const authController = require("../controllers/auth");

router.post("/users/login", authController.login);
router.post("/users/register", authController.register);
router.delete("/users/:id", authController.deleteUser);

module.exports = router;
