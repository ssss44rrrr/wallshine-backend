const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  name: String,
  phone: String,
  location: String,
  service: String,
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Quote", quoteSchema);