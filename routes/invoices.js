const router = require("express").Router();

const invoiceController = require("../controllers/invoices");
router.post("/", invoiceController.create);

module.exports = router;
