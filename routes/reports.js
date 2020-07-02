const router = require("express").Router();

const reportController = require("../controllers/reports");

const { checkIsAdmin } = require("../services/checkAdmin");

router.post("/", reportController.create);
router.post("/getAll", reportController.getAll);
router.get("/:id", reportController.get);
router.put("/:id", checkIsAdmin, reportController.updateStatus);
router.delete("/:id", checkIsAdmin, reportController.delete);

module.exports = router;
