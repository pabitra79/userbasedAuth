const express = require("express");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "can not be zero"],
    },
    size: {
      type: [String],
      required: [true, "Size is required"],
    },
    category: {
      type: String,
      required: true,
      enum: ["electronics", "clothing", "furniture", "men", "Cafe", "women"],
    },
    color: {
      type: [String],
      required: [true, "color is required"],
    },
    brand: {
      type: String,
      required: [true, "brand is required"],
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("userbasedauth", userProductSchema);
