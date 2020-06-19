const roomFacilities = require("../model/roomFacilities");
const facilitiesController = require("../controllers/facilities");
const { model } = require("mongoose");
const { isEmpty } = require("lodash");

//
// Facilities in room
//
exports.addFacilityToRoom = async (req, res, next) => {
  try {
    const facilityId = req.body.facilityId;
    const roomId = req.params.id;
    const quantity = req.body.quantity;

    // Check empty property
    if (isEmpty(facilityId) || isEmpty(roomId) || !quantity) {
      return res.json({
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
      return res.json({
        success: false,
        error: "You have added this facility to this room"
      });
    }

    // Check not enough quantity
    if (facility.quantity < quantity) {
      return res.json({
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
      return res.json({
        success: false,
        error: transactionResult.error
      });
    }

    const newDocs = await roomFacilities.create({
      roomId: roomId,
      facilityId: facilityId,
      quantity: quantity
    });

    return res.json({
      success: true,
      data: newDocs
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};

exports.updateFacilityInRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const facilityId = req.body.facilityId;
    const quantity = req.body.quantity;
    const isAdjustQuantity = req.body.isAdjustQuantity;
    // isAdjustQuantity = false When you want to destroy that facility in room forever.
    // And not adjust quantity in warehouse

    // Check empty property
    if (!facilityId || !roomId || !quantity || isAdjustQuantity === undefined) {
      return res.json({
        success: false,
        error: "Not enough property"
      });
    }

    const roomFacility = await roomFacilities.findOne({
      roomId: roomId,
      facilityId: facilityId,
      isDeleted: false
    });

    if (isEmpty(roomFacility)) {
      return res.json({
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
        quantity: -(quantity - roomFacility.quantity),
        facilityId: facilityId
      });
    }

    // Check is transaction failed
    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      return res.json({
        success: false,
        error: transactionResult.error
      });
    }

    const updated = await roomFacilities.findOneAndUpdate(
      { roomId: roomId, facilityId: facilityId, isDeleted: false },
      { quantity: quantity },
      { new: true }
    );

    if (isEmpty(updated)) {
      return res.json({
        success: false,
        data: "Created failed"
      });
    }

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    return res.json({
      success: false,
      data: error.message
    });
  }
};

exports.getAllFacilitiesInRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;

    if (isEmpty(roomId)) {
      return res.json({
        success: false,
        error: "Not enough property"
      });
    }
    const docs = await roomFacilities
      .find({ roomId: roomId, isDeleted: false })
      .select("facilityId quantity")
      .populate("facilityId", "name");

    return res.json({ success: true, data: docs });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

exports.deleteFacilityInRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const facilityId = req.body.facilityId;
    const isAdjustQuantity = req.body.isAdjustQuantity;

    if (
      isEmpty(roomId) ||
      isEmpty(facilityId) ||
      isAdjustQuantity === undefined
    ) {
      return res.json({
        success: false,
        error: "Not enough property"
      });
    }

    const doc = await roomFacilities.findOne({
      roomId: roomId,
      facilityId: facilityId,
      isDeleted: false
    });

    if (isEmpty(doc)) {
      return res.json({
        success: false,
        error: "Not found"
      });
    }
    //
    // Transaction
    //
    let transactionResult;
    if (isAdjustQuantity === false) {
      transactionResult = await facilitiesController.adjustQuantity({
        quantity: doc.quantity,
        facilityId: facilityId
      });
    }

    // Check is transaction failed
    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      return res.json({
        success: false,
        error: transactionResult.error
      });
    }

    const deleted = await roomFacilities.findOneAndUpdate(
      { roomId: roomId, facilityId: facilityId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    return res.json({
      success: true,
      data: deleted._id
    });
  } catch (error) {
    return res.json({
      success: false,
      data: error.message
    });
  }
};
