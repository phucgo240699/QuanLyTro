const Rooms = require("../model/rooms");
const { model, startSession } = require("mongoose");
const { pick, isEmpty } = require("lodash");
const {
  commitTransactions,
  abortTransactions
} = require("../services/transactions");

//
// Room
//
exports.create = async (req, res, next) => {
  try {
    const name = req.body.name;
    const price = req.body.price;
    const capacity = req.body.capacity;

    if (isEmpty(name) || !price || !capacity) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const old = await Rooms.findOne({
      name: req.body.name,
      isDeleted: false
    });

    // Check exist
    if (!isEmpty(old)) {
      return res.status(409).json({
        success: false,
        error: "You created this room name"
      });
    }

    const newRoom = await Rooms.create({
      ...pick(
        req.body,
        "name",
        "floor",
        "price",
        "payment",
        "square",
        "capacity",
        "debt"
      )
    });
    if (isEmpty(newRoom)) {
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    return res.status(201).json({
      success: true,
      data: newRoom
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.get = async (req, res, next) => {
  try {
    const room = await Rooms.findOne({ _id: req.params.id, isDeleted: false });

    if (isEmpty(room)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Number(req.query.page); // page index
    const limit = Number(req.query.limit); // limit docs per page

    let rooms;

    if (!page || !limit) {
      rooms = await Rooms.find({ isDeleted: false }).select(
        "name price name price square capacity vehicleNumber"
      );
    } else {
      rooms = await Rooms.aggregate()
        .match({ isDeleted: false })
        .skip(limit * (page - 1))
        .limit(limit)
        .project("name price square capacity vehicleNumber");
    }

    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res, next) => {
  let sessions = [];
  try {
    let session = await startSession(); // Start Session
    session.startTransaction(); // Start transaction
    sessions.push(session); // add session to sessions(list of session)

    const updatedRoom = await Rooms.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...pick(
          req.body,
          "name",
          "floor",
          "price",
          "payment",
          "square",
          "capacity",
          "debt",
          "vehicleNumber"
        )
      },
      { new: true, session }
    );

    if (isEmpty(updatedRoom)) {
      return res.status(406).json({
        success: false,
        error: "Updated failed"
      });
    }

    // Check duplicate
    if (!isEmpty(req.body.name)) {
      const oldRooms = await Rooms.find({
        name: req.body.name,
        isDeleted: false
      });

      if (oldRooms.length >= 1) {
        await abortTransactions(sessions);
        return res.status(409).json({
          success: false,
          error: "Name is already exist"
        });
      }
    }

    await commitTransactions(sessions);

    return res.status(200).json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const deletedRoom = await Rooms.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (isEmpty(deletedRoom)) {
      return res.status(406).json({
        success: false,
        error: "Deleted failed"
      });
    }

    return res.status(200).json({
      success: true,
      data: deletedRoom
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
