const router = require("express").Router();

const paramController = require("../controllers/params");

const { checkIsAdmin } = require("../services/checkAdmin");

router.get("/:id", paramController.get);
router.get("/", paramController.getAll);
router.put("/:id", checkIsAdmin, paramController.update);

module.exports = router;
