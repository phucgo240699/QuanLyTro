const router = require("express").Router();

const roomsController = require("../controllers/rooms");
const roomFacilitiesController = require("../controllers/roomFacilities");

const { checkIsAdmin } = require("../services/checkAdmin");

// Room
router.post("/", checkIsAdmin, roomsController.create);
router.get("/:id", checkIsAdmin, roomsController.get);
router.get("/", checkIsAdmin, roomsController.getAll);
router.put("/:id", checkIsAdmin, roomsController.update);
router.delete("/:id", checkIsAdmin, roomsController.delete);

// Facilities in room
router.post("/:id/facility", checkIsAdmin, roomFacilitiesController.addFacilityToRoom);
router.get("/:id/facility", checkIsAdmin, roomFacilitiesController.getAllFacilitiesInRoom);
router.put("/:id/facility", checkIsAdmin, roomFacilitiesController.updateFacilityInRoom);
router.delete("/:id/facility", checkIsAdmin, roomFacilitiesController.deleteFacilityInRoom);

module.exports = router;
