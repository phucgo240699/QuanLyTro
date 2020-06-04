const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Facilities = new Schema(
  {
    name: {
      type: String,
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

module.exports = mongoose.model("facilities", Facilities);
