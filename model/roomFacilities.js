const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roomFacilities = new Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facilities",
      index: true,
      required: true
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      index: true,
      required: true
    },
    quantity: {
      type: Number,
      required: true
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

module.exports = mongoose.model("roomFacilities", roomFacilities);
