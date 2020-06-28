const Invoices = require("../model/invoices");
const { model } = require("mongoose");
const { pick, get, isEmpty } = require("lodash");

exports.create = async (req, res, next) => {
  try {
    const consumptionElectric = req.body.consumptionElectric;
    const consumptionWater = req.body.consumptionWater;
    const waterPrice = req.body.waterPrice;
    const electricPrice = req.body.electricPrice;
    const roomId = req.body.roomId;
    const internetPrice = req.body.internetPrice;
    const parkingPrice = req.body.parkingPrice;
    const cleanPrice = req.body.cleanPrice;

    // Check not enough property
    if (
      !roomId ||
      !consumptionElectric ||
      !consumptionWater ||
      !waterPrice ||
      !electricPrice
    ) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const [room, contract, param] = await Promise.all([
      model("rooms").findOne({ _id: roomId, isDeleted: false }),
      model("contracts").findOne({ roomId: roomId, isDeleted: false }),
      model("params").findOne({ name: "parkingCost", isDeleted: false })
    ]);

    // Check empty
    if (isEmpty(contract)) {
      return res.status(406).json({
        success: false,
        error: "The contract has not created yet"
      });
    }

    if (isEmpty(room)) {
      return res.status(406).json({
        success: false,
        error: "The room not found"
      });
    }

    let latest = contract.latestInvoiceDate;
    let now = new Date();

    // Check valid time for creating
    if (!isEmpty(latest)) {
      if (latest > now) {
        return res.status(406).json({
          success: false,
          error: "Invalid"
        });
      }

      if (
        // getMonth return month in 0 -> 11
        now.getMonth() - latest.getMonth() <= 1 &&
        now.getDate() < latest.getDate()
      ) {
        return res.status(406).json({
          success: false,
          error: "Too early for creating invoice"
        });
      }
    }

    // Check some prices
    if (!parkingPrice) {
      parkingPrice =
        (room.amountOfVehicles ? Number(room.amountOfVehicles) : 0) *
        (param.value ? Number(param.value) : 0) *
        30;
    }

    // Calculate total price
    req.body.totalPrice =
      (internetPrice ? internetPrice : 0) +
      (parkingPrice ? parkingPrice : 0) +
      (cleanPrice ? cleanPrice : 0);

    // Create invoice
    const newDoc = await Invoices.create({
      ...pick(
        req.body,
        "consumptionElectric",
        "consumptionWater",
        "waterCost",
        "electricCost",
        "waterPrice",
        "electricPrice",
        "internetPrice",
        "parkingPrice",
        "cleanPrice",
        "totalPrice",
        "roomId"
      )
    });

    if (isEmpty(newDoc)) {
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    return res.status(201).json({
      success: true,
      data: newDoc
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
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
