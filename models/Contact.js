const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Contact", contactSchema);