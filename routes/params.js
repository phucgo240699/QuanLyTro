const router = require("express").Router();

const paramController = require("../controllers/params");

router.get("/:id", paramController.get);
router.get("/", paramController.getAll);
router.put("/:id", paramController.update);

module.exports = router;
