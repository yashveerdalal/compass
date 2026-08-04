const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    photoUrl: {
      type: String,
      default: "",
    },
    reporterName: {
      type: String,
      trim: true,
      default: "",
    },
    contactInfo: {
      type: String,
      trim: true,
      default: "",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }, // gives you createdAt / updatedAt automatically
);

module.exports = mongoose.model("Item", itemSchema);
