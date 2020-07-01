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

    // Set up date create invoice
    now.setDate(latestInvoiceDate.getDate());
    req.body.createdAt = now;
    req.body.updatedAt = now;
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
        "roomId",
        "createdAt",
        "updatedAt"
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

exports.get = async (req, res) => {
  try {
    let query;
    if (req.user.isAdmin === true) {
      query = { _id: req.params.id, isDeleted: false };
    } else {
      query = { _id: req.params.id, isDeleted: false, user: req.user };
    }
    const invoice = await Invoices.findOne(query);

    if (isEmpty(invoice)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    let invoices;

    const page = Number(req.query.page); // page index
    const limit = Number(req.query.limit); // limit docs per page

    let query;
    if (req.user.isAdmin === true) {
      query = { isDeleted: false };
    } else {
      query = { isDeleted: false, user: req.user };
    }

    if (!page || !limit) {
      // Not paginate if request doesn't has one of these param: page, limit
      invoices = await Invoices.find(query)
        .select("roomId totalPrice")
        .populate("roomId", "name");
    } else {
      // Paginate
      invoices = await Invoices.aggregate()
        .find(query)
        .select("roomId totalPrice")
        .populate("roomId", "name")
        .skip(limit * (page - 1))
        .limit(limit);
    }

    return res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Invoices.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (isEmpty(deleted)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    deleted.isDeleted = true;
    await deleted.save();

    return res.status(200).json({
      success: true,
      data: deleted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
