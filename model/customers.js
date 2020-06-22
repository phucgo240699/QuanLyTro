const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Customers = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String
    },
    phoneNumber: {
      type: String
    },
    birthday: {
      type: Date
    },
    identityCard: {
      type: String,
      required: true,
      index: true
    },
    identityCardFront: {
      type: String
    },
    identityCardBack: {
      type: String
    },
    province: {
      type: String
    },
    district: {
      type: String
    },
    ward: {
      type: String
    },
    address: {
      type: String
    },
    notes: {
      type: String
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
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

module.exports = mongoose.model("customers", Customers);
