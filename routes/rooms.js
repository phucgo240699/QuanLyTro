const router = require("express").Router();

const roomsController = require("../controllers/rooms");

const { checkIsAdmin } = require("../services/checkAdmin");

router.post("/", checkIsAdmin, roomsController.create);
router.get("/:id", checkIsAdmin, roomsController.get);
router.get("/", checkIsAdmin, roomsController.getAll);
router.put("/:id", checkIsAdmin, roomsController.update);
router.delete("/:id", checkIsAdmin, roomsController.delete);

module.exports = router;
