const roomFacilities = require("../model/roomFacilities");
const facilitiesController = require("../controllers/facilities");
const { model, startSession } = require("mongoose");
const { isEmpty, pick } = require("lodash");

//
// Facilities in room
//
exports.addFacilityToRoom = async (req, res, next) => {
  try {
    const facilityId = req.body.facilityId;
    const roomId = req.body.roomId;
    const quantity = req.body.quantity;

    // Check empty property
    if (isEmpty(facilityId) || isEmpty(roomId) || !quantity) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const [roomFacility, facility] = await Promise.all([
      roomFacilities.findOne({
        roomId: roomId,
        facilityId: facilityId,
        isDeleted: false
      }),
      model("facilities").findOne({ _id: facilityId, isDeleted: false })
    ]);

    // Check exist
    if (!isEmpty(roomFacility)) {
      return res.status(409).json({
        success: false,
        error: "You have added this facility to this room"
      });
    }

    // Check not enough quantity
    if (facility.quantity < quantity) {
      return res.status(409).json({
        success: false,
        error: "Not enough quantity in warehouse"
      });
    }

    //
    // Transaction
    //
    const transactionResult = await facilitiesController.adjustQuantity({
      quantity: -quantity,
      facilityId: facilityId
    });

    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      return res.status(406).json({
        success: false,
        error: transactionResult.error
      });
    }

    const newDocs = await roomFacilities.create({
      roomId: roomId,
      facilityId: facilityId,
      quantity: quantity
    });

    return res.status(201).json({
      success: true,
      data: newDocs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateFacilityInRoom = async (req, res, next) => {
  try {
    const id = req.params.id;
    const roomId = req.body.roomId;
    const facilityId = req.body.facilityId;
    const quantity = req.body.quantity; // new quantity
    const isAdjustQuantity = req.body.isAdjustQuantity;
    // isAdjustQuantity = false When you want to destroy that facility in room forever.
    // And not adjust quantity in warehouse

    if (!isEmpty(roomId) || !isEmpty(facilityId)) {
      return res.status(406).json({
        success: false,
        error: "Only can change quantity"
      });
    }

    const [roomFacility, old] = await Promise.all([
      roomFacilities.findOne({
        _id: id,
        isDeleted: false
      }),
      roomFacilities.findOne({
        ...pick(req.body, "roomId", "facilityId"),
        isDeleted: false
      })
    ]);

    if (isEmpty(roomFacility)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    // Check exist
    if (!isEmpty(old)) {
      return res.status(409).json({
        success: false,
        error: "You have added this facility to this room"
      });
    }

    //
    // Transaction
    //
    let transactionResult;
    if (isAdjustQuantity === true) {
      transactionResult = await facilitiesController.adjustQuantity({
        quantity: roomFacility.quantity - quantity,
        facilityId: facilityId
      });
    }

    // Check is transaction failed
    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      return res.status(406).json({
        success: false,
        error: transactionResult.error
      });
    }

    const updated = await roomFacilities.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...pick(req.body, "quantity") },
      { new: true }
    );

    if (isEmpty(updated)) {
      return res.status(404).json({
        success: false,
        error: "Deleted failed"
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllFacilitiesInRoom = async (req, res, next) => {
  const page = Number(req.query.page); // page index
  const limit = Number(req.query.limit); // limit docs per page

  try {
    const roomId = req.params.roomId;

    if (isEmpty(roomId)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    let docs;

    if (!page || !limit) {
      // Not paginate if request doesn't has one of these param: page, limit
      docs = await roomFacilities
        .find({ roomId: roomId, isDeleted: false })
        .select("facilityId quantity")
        .populate("facilityId", "name");
    } else {
      // Paginate
      docs = await roomFacilities
        .find({ roomId: roomId, isDeleted: false })
        .select("facilityId quantity")
        .populate("facilityId", "name")
        .skip(limit * (page - 1))
        .limit(limit);
    }

    return res.status(200).json({
      success: true,
      data: docs
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFacilityInRoom = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isAdjustQuantity = req.body.isAdjustQuantity;

    if (isEmpty(id) || isAdjustQuantity === undefined) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const doc = await roomFacilities.findOne({
      _id: id,
      isDeleted: false
    });

    if (isEmpty(doc)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    //
    // Transaction
    //
    let transactionResult;
    if (isAdjustQuantity === true) {
      transactionResult = await facilitiesController.adjustQuantity({
        quantity: doc.quantity,
        facilityId: doc.facilityId
      });
    }

    // Check is transaction failed
    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      return res.status(406).json({
        success: false,
        error: transactionResult.error
      });
    }

    doc.isDeleted = true;
    await doc.save();

    return res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: error.message
    });
  }
};
