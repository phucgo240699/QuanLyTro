const roomFacilities = require("../model/roomFacilities");
const facilitiesController = require("../controllers/facilities");
const { model, startSession } = require("mongoose");
const { commitTransactions, abortTransactions } = require("../services/transactions");
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

    //
    // Transactions
    //
    let sessions = [];
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    // Quantity & Create
    const [transactionResult, newDoc] = await Promise.all([
      facilitiesController.adjustQuantity({
        quantity: -quantity,
        facilityId: facilityId,
        session: session
      }),
      roomFacilities.create(
        [
          {
            roomId: roomId,
            facilityId: facilityId,
            quantity: quantity
          }
        ],
        { session: session }
      )
    ]);

    // Check after adjusted quantity
    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: transactionResult.error
      });
    }

    // Check after created
    if (isEmpty(newDoc)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    // Check duplicate
    const old = await roomFacilities.find({
      roomId: roomId,
      facilityId: facilityId,
      isDeleted: false
    });

    if (old.length > 0) {
      await abortTransactions(sessions);
      return res.status(409).json({
        success: false,
        error: "This facility for this room is already exist"
      });
    }

    // Done
    await commitTransactions(sessions);

    return res.status(201).json({
      success: true,
      data: newDoc[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateFacilityInRoom = async (req, res, next) => {
  let sessions = [];
  try {
    const id = req.params.id;
    const roomId = req.body.roomId;
    const facilityId = req.body.facilityId;
    const quantity = req.body.quantity; // new quantity
    const isAdjustQuantity = req.body.isAdjustQuantity;
    // isAdjustQuantity = false When you want to destroy that facility in room forever.
    // And not adjust quantity in warehouse

    //
    // Transaction
    //
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    let transactionResult;
    if (isAdjustQuantity === true) {
      transactionResult = await facilitiesController.adjustQuantity({
        quantity: roomFacility.quantity - quantity,
        facilityId: facilityId,
        session: session
      });
    }

    // Check is transaction failed
    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: transactionResult.error
      });
    }

    // Update
    const updated = await roomFacilities.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...pick(req.body, "quantity") },
      { session, new: true }
    );

    if (isEmpty(updated)) {
      await abortTransactions(sessions);
      return res.status(404).json({
        success: false,
        error: "Updated failed"
      });
    }

    // Done
    await commitTransactions(sessions);
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    await abortTransactions(sessions);
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
  let sessions = [];
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
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    let transactionResult;
    if (isAdjustQuantity === true) {
      transactionResult = await facilitiesController.adjustQuantity({
        quantity: doc.quantity,
        facilityId: doc.facilityId,
        session: session
      });
    }

    // Check is transaction failed
    if (!isEmpty(transactionResult) && transactionResult.success === false) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: transactionResult.error
      });
    }

    doc.isDeleted = true;
    await doc.save();

    // Done
    await commitTransactions(sessions);
    return res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error) {
    await abortTransactions(sessions);
    return res.status(500).json({
      success: false,
      data: error.message
    });
  }
};
