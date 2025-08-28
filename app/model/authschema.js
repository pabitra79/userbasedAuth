const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is must be fill"],
      unique: true,
      minlength: [3, "minimum 3 character"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/],
    },
    phone: {
      type: Number,
      required: true,
      minlength: 5,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
module.exports = mongoose.model("authentication", AuthSchema);
