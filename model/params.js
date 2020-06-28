const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Params = new Schema(
  {
    name: {
      type: String,
      index: true,
      required: true
    },
    value: {
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

module.exports = mongoose.model("params", Params);
