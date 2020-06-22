const router = require("express").Router();

const customersController = require("../controllers/customers");

const { checkIsAdmin } = require("../services/checkAdmin");

router.post("/", checkIsAdmin, customersController.create);
router.get("/:id", checkIsAdmin, customersController.get);
router.get("/", checkIsAdmin, customersController.getAll);
router.put("/:id", checkIsAdmin, customersController.update);
router.delete("/:id", checkIsAdmin, customersController.delete);

module.exports = router;
