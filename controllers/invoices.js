const Invoices = require("../model/invoices");
const { model } = require("mongoose");
const { pick, get, isEmpty } = require("lodash");

exports.create = async (req, res, next) => {
  // try {
  //   const consumptionElectric = req.body.consumptionElectric;
  //   const consumptionWater = req.body.consumptionWater;
  //   const waterPrice = req.body.waterCost;
  //   const electricPrice = req.body.electricPrice;
  //   const roomId = req.body.roomId;
  //   const latestInvoiceDate = req.body.latestInvoiceDate;
  //   const internetPrice = req.body.internetPrice;
  //   const parkingPrice = req.body.parkingPrice;
  //   const cleanPrice = req.body.cleanPrice;

  //   if (
  //     !roomId ||
  //     !consumptionElectric ||
  //     !consumptionWater ||
  //     !waterPrice ||
  //     !electricPrice
  //   ) {
  //     return res.status(406).json({
  //       success: false,
  //       error: "Not enough property"
  //     });
  //   }

  //   const [invoices, contract] = await Promise.all([
  //     Invoices.find({ roomId: roomId, isDeleted: false }).sort({
  //       createdAt: -1
  //     }),
  //     model("contracts").findOne({ roomId: roomId, isDeleted: false })
  //   ]);

  //   if (isEmpty(contract)) {
  //     return res.status(406).json({
  //       success: false,
  //       error: "The contract has not created yet"
  //     });
  //   }
  //   let latest = contract.latestInvoiceDate;
  //   let now = Date.now();
  //   if (!isEmpty(latest)) {
  //     if (
  //       latest.getMonth() > now.getMonth() ||
  //       (latest.getMonth() === now.getMonth() && latest.getDay() > now.getDay()) ||
  //       latest > now
  //     ) {
  //       return res.status(406).json({
  //         success: false,
  //         error: "Too early for creating invoice"
  //       });
  //     }
  //   }
  //   var i;
  //   let docs = [];
  //   for (
  //     i = latest.getYear();
  //     i < (latest.getMonth() > now.getMonth() ? now.getYear() : now.getYear() - 1);
  //     ++i
  //   ) {
  //     for (
  //       i = latest.getMonth();
  //       i < (latest.getDay() > now.getDay() ? now.getMonth() : now.getMonth() - 1);
  //       ++i
  //     ) {
  //       docs.push({
  //         ...pick(
  //           req.body,
  //           "consumptionElectric",
  //           "consumptionWater",
  //           "waterCost",
  //           "electricCost",
  //           "waterPrice",
  //           "electricPrice",
  //           "internetPrice",
  //           "parkingPrice",
  //           "cleanPrice",
  //           "totalPrice",
  //           "roomId"
  //         )
  //       })
  //     }
  //   }
  //   const newDoc = await Invoices.insertMany(docs);

  //   if (isEmpty(newDoc)) {
  //     return res.status(406).json({
  //       success: false,
  //       error: "Created failed"
  //     });
  //   }

  //   return res.status(200).json({
  //     success: true,
  //     data: newDoc
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     success: false,
  //     error: error.message
  //   });
  // }
  const start = new Date();
  const doc = await model("rooms").findOne({
    _id: "5ef6f212cce54d6a34206cc8",
    isDeleted: false
  });
  const time = doc.createdAt;
  res.json({
    id: doc._id,
    data: time - start,
    minute: time.getMinutes(),
    hour: time.getHours(),
    day: time.getDate(),
    month: time.getMonth() + 1,
    year: time.getFullYear()
  });
};
