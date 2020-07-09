const router = require("express").Router();

const invoiceController = require("../controllers/invoices");

const { checkIsAdmin } = require("../services/checkAdmin");

router.post("/", checkIsAdmin, invoiceController.create);
router.post("/getAll", invoiceController.getAll);
router.get("/:id", invoiceController.get);
router.put("/:id", checkIsAdmin, invoiceController.update);
router.delete("/:id", checkIsAdmin, invoiceController.delete);
router.delete("/byRoomId/:roomId", checkIsAdmin, invoiceController.deleteByRoomId);

module.exports = router;
