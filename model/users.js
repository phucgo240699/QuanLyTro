const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Users = new Schema(
  {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    },
    userType: {
      type: String,
      enum: ["customers"]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType",
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", Users);
