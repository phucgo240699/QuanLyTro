const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Contracts = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
      required: true,
      index: true
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
      index: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    },
    descriptions: {
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

module.exports = mongoose.model("contracts", Contracts);
