const mongoose = require("mongoose");

// Define the GasData schema
const gasDataSchema = new mongoose.Schema(
  {
    connection: { type: Boolean, required: true },
    gasLevel: { type: Number, required: true },
    powerStatus: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const GasData = mongoose.model("GasData", gasDataSchema);

module.exports = GasData;
