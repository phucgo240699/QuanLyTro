const router = require("express").Router();

const roomFacilitiesController = require("../controllers/roomFacilities");

const { checkIsAdmin } = require("../services/checkAdmin");

// Facilities in room
router.post("/", checkIsAdmin, roomFacilitiesController.addFacilityToRoom);
router.get(
  "/:roomId",
  checkIsAdmin,
  roomFacilitiesController.getAllFacilitiesInRoom
);
router.put("/:id", checkIsAdmin, roomFacilitiesController.updateFacilityInRoom);
router.delete(
  "/:id",
  checkIsAdmin,
  roomFacilitiesController.deleteFacilityInRoom
);

module.exports = router;
