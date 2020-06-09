const Rooms = require("../model/rooms");
const { pick } = require("lodash");

exports.create = async (req, res, next) => {
  try {
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
    const total = Number(req.query.total); // total docs per page

    let rooms;

    if (!page || !total) {
      rooms = await Rooms.find({ isDeleted: false }).select("name price");
    } else {
      rooms = await Rooms.aggregate()
        .match({ isDeleted: false })
        .skip(total * (page - 1))
        .limit(total)
        .project("name price");
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

    if (deletedRoom) {
      return res.json({ success: false, error: "Room was not found" });
    }

    return res.json({ success: true, data: deletedRoom._id });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
