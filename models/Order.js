const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    toCart: {
      type: Boolean,
      default: false,
    },
    subCategory: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    customizations: {
      type: Object,
      required: true,
    },
    measurements: {
      type: Object,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    shippingInfo: {
      type: Object,
      default: {},
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      unique:true,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
