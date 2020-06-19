const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Facilities = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    description: {
      type: String
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

Facilities.index({ name: 1, isDeleted: 1 }, { unique: true });

module.exports = mongoose.model("facilities", Facilities);
