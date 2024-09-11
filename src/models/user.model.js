import mongoose from "mongoose";

// base user Schema

const userSchama = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Customer", "Delivery Partner"],
    required: true,
  },
  isActived: {
    type: Boolean,
    default: false,
  },
});

// customer schema

const customerSchama = new mongoose.Schema({
  ...userSchama.obj,
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["Customer"],
    default: "Customer",
  },
  address: {
    type: String,
  },
  liveLocation: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
});

// Delivery partner schema
const deliveryPartnerSchama = new mongoose.Schema({
  ...userSchama.obj,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["Delivery Partner"],
    default: "Delivery Partner",
  },
  address: {
    type: String,
  },
  liveLocation: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
});

// admin schema
const adminSchama = new mongoose.Schema({
  ...userSchama.obj,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin"],
    default: "Admin",
  },
});


export const Customer = mongoose.model("Customer", customerSchama);
export const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchama
);
export const Admin = mongoose.model("Admin", adminSchama);
