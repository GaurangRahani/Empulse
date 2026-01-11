const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["EMPLOYEE", "HR", "CEO"],
      default: "EMPLOYEE",
    },
    designation: { type: String },
    department: { type: String },
    phone: { type: String },
    address: { type: String },
    joiningDate: { type: Date },
    shift: {
      start: { type: String },
      end: { type: String },
    },
    workLocation: {
      type: String,
      enum: ["ONSITE", "REMOTE", "HYBRID"],
      default: "ONSITE",
    },
    dob: { type: Date },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    salary: { type: Number },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    profilePicture: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
