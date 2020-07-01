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
      index: true,
      required: true
    },
    price: {
      type: Number,
      required: true,
      index: true
    },
    square: {
      // m^2
      type: Number,
      index: true
    },
    capacity: {
      // Maximum people in a room
      type: Number,
      required: true
    },
    debt: {
      type: Number
    },
    amountOfVehicles: {
      // Amount of vehicles
      type: Number
    },
    slotStatus: {
      type: String,
      enum: ["empty", "available", "full"],
      required: true,
      index: true,
      default: "empty"
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
