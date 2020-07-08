const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Invoices = new Schema({
  consumptionElectric: {
    type: Number,
    required: true,
    index: true
  },
  consumptionWater: {
    type: Number,
    required: true,
    index: true
  },
  waterCost: {
    type: Number
  },
  electricCost: {
    type: Number
  },
  waterPrice: {
    type: Number,
    required: true,
    index: true
  },
  electricPrice: {
    type: Number,
    required: true,
    index: true
  },
  internetPrice: {
    type: Number,
    required: true,
    default: 0
  },
  parkingPrice: {
    // automatically or manually
    type: Number,
    required: true,
    default: 0
  },
  cleanPrice: {
    type: Number,
    required: true,
    default: 0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  totalPrice: {
    type: Number,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "rooms",
    required: true,
    index: true
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    required: true,
    index: true
  }
});

module.exports = mongoose.model("invoices", Invoices);
