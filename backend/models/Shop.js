const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    keeper: { type: String, required: true, trim: true },
    base: { type: Number, required: true, min: 0 },
    advance: { type: Number, required: true, min: 0 },
    // store start as Date for robust operations
    start: { type: Date, required: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    rents: {
      type: [
        {
          month: { type: String, required: true },
          amount: { type: Number, default: 0, min: 0 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Provide a clean JSON output for clients
ShopSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // convert date to YYYY-MM-DD string for compatibility with frontend
  if (obj.start) obj.start = obj.start.toISOString().slice(0, 10);
  return obj;
};

module.exports = mongoose.model("Shop", ShopSchema);
