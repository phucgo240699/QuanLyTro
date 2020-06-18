const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Rooms = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    floor: {
      type: Number,
      index: true
    },
    price: {
      type: Number,
      required: true,
      index: true
    },
    payment: {
      type: Number
    },
    square: {
      // m^2
      type: Number,
      index: true
    },
    capacity: {
      // Maximum people in a room
      type: Number
    },
    debt: {
      type: Number
    },
    vehicleNumber: {
      type: Number
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("rooms", Rooms);
