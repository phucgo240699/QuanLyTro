const router = require("express").Router();

const roomsController = require("../controllers/rooms");
const roomFacilitiesController = require("../controllers/roomFacilities");

const { checkIsAdmin } = require("../services/checkAdmin");

// Room
router.post("/", checkIsAdmin, roomsController.create);
router.get("/:id", checkIsAdmin, roomsController.get);
router.post("/getAll", checkIsAdmin, roomsController.getAll);
router.put("/:id", checkIsAdmin, roomsController.update);
router.delete("/:id", checkIsAdmin, roomsController.delete);

module.exports = router;
