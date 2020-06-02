const router = require("express").Router();

const facilitiesController = require("../controllers/facilities");

router.post("/facilities", facilitiesController.create);
router.get("/facilities/:id", facilitiesController.get);
router.get("/facilities", facilitiesController.getAll);
router.put("/facilities/:id", facilitiesController.update);
router.delete("/facilities/:id", facilitiesController.delete);

module.exports = router;
