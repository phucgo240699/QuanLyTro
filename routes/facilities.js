const router = require("express").Router();

const facilitiesController = require("../controllers/facilities");

const { checkIsAdmin } = require("../services/checkAdmin");

router.post("/", checkIsAdmin, facilitiesController.create);
router.get("/:id", checkIsAdmin, facilitiesController.get);
router.get("/", checkIsAdmin, facilitiesController.getAll);
router.put("/:id", checkIsAdmin, facilitiesController.update);
router.delete("/:id", checkIsAdmin, facilitiesController.delete);

module.exports = router;
