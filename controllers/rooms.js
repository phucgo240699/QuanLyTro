const Rooms = require("../model/rooms");
const { model, startSession } = require("mongoose");
const { pick, isEmpty } = require("lodash");
const { commitTransactions, abortTransactions } = require("../services/transactions");

//
// Room
//
exports.create = async (req, res, next) => {
  let sessions = [];
  try {
    const name = req.body.name;
    const price = req.body.price;
    const capacity = req.body.capacity;
    const floor = req.body.floor;

    if (isEmpty(name) || !price || !capacity || !floor) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    const newRoom = await Rooms.create(
      [
        {
          ...pick(
            req.body,
            "name",
            "floor",
            "price",
            "square",
            "capacity",
            "debt",
            "amountOfVehicles"
          )
        }
      ],
      { session: session }
    );

    if (isEmpty(newRoom)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    // Check exist
    const old = await Rooms.find({
      ...pick(req.body, "name"),
      isDeleted: false
    });
    if (old.length > 0) {
      await abortTransactions(sessions);
      return res.status(409).json({
        success: false,
        error: "This name is already exist"
      });
    }

    // Done
    await commitTransactions(sessions);

    return res.status(201).json({
      success: true,
      data: newRoom[0]
    });
  } catch (error) {
    await abortTransactions(sessions);
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
    let query = {
      ...pick(req.body, "name", "floor", "price", "capacity", "slotStatus"),
      isDeleted: false
    };
    if (!page || !limit) {
      rooms = await Rooms.find(query).select(
        "name price name price square capacity amountOfVehicles slotStatus floor"
      );
    } else {
      rooms = await Rooms.find(query)
        .select("name price square capacity amountOfVehicles slotStatus floor")
        .skip(limit * (page - 1))
        .limit(limit);
    }

    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res, next) => {
  let sessions = [];
  try {
    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    const updatedRoom = await Rooms.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...pick(
          req.body,
          "name",
          "floor",
          "price",
          "square",
          "capacity",
          "debt",
          "amountOfVehicles"
        )
      },
      { session, new: true }
    );

    if (isEmpty(updatedRoom)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Updated failed"
      });
    }

    // Check exist
    if (req.body.name) {
      let isChangeName = true;
      const [rooms, beforeUpdated] = await Promise.all([
        Rooms.find({ name: req.body.name, isDeleted: false }),
        Rooms.findOne({
          _id: req.params.id,
          isDeleted: false
        })
      ]);

      if (beforeUpdated.name === updatedRoom.name) {
        isChangeName = false;
      }

      if (rooms.length > 0 && isChangeName) {
        await abortTransactions(sessions);
        return res.status(409).json({
          success: false,
          error: "This name is already exist"
        });
      }
    }

    // Done
    await commitTransactions(sessions);

    return res.status(200).json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    await abortTransactions(sessions);
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
