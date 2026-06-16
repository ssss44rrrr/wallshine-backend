const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  comment: String,

  date: {
    type: Date,
    default: Date.now
  },

  dislikes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Review", reviewSchema);