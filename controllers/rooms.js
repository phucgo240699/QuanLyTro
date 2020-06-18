const Rooms = require("../model/rooms");
const { pick, isEmpty } = require("lodash");

//
// Room
//
exports.create = async (req, res, next) => {
  try {
    const newRoom = await Rooms.create({
      ...pick(req.body, "name", "floor", "price", "payment", "square", "capacity", "debt")
    });

    return res.json({ success: true, data: newRoom });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

exports.get = async (req, res, next) => {
  try {
    const room = await Rooms.findOne({ _id: req.params.id, isDeleted: false });

    return res.json({ success: true, data: room });
  } catch (error) {
    return res.json({ success: false, error: error.message });
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

    return res.json({ success: true, data: rooms });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedRoom = await Rooms.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...pick(req.body, "name", "floor", "price", "payment", "square", "capacity", "debt", "vehicleNumber")
      }
    );

    return res.json({ success: true, data: updatedRoom });
  } catch (error) {
    return res.json({ success: false, error: error.message });
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
      return res.json({ success: false, error: "Room was not found" });
    }

    return res.json({ success: true, data: deletedRoom._id });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
