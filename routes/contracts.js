const router = require("express").Router();

const contractController = require("../controllers/contracts");

const { checkIsAdmin } = require("../services/checkAdmin");

router.post("/", checkIsAdmin, contractController.create);
router.get("/:id", checkIsAdmin, contractController.get);
router.post("/getAll", checkIsAdmin, contractController.getAll);
router.delete("/:id", checkIsAdmin, contractController.delete);

module.exports = router;
