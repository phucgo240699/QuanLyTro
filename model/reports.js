const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Reports = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ["done", "processing", "cancel"],
      index: true,
      required: true,
      default: "processing"
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("reports", Reports);
