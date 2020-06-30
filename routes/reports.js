const router = require("express").Router();

const reportController = require("../controllers/reports");

router.post("/", reportController.create);
router.get("/", reportController.getAll);
router.get("/:id", reportController.get);
router.put("/:id", reportController.updateStatus);
router.delete("/:id", reportController.delete);

module.exports = router;
