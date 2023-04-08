const mongoose = require('mongoose');

const { Schema } = mongoose;

const MovieSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  isBookmarked: {
    type: Boolean,
    required: true,
  },
  isTrending: {
    type: Boolean,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  thumbnail: {
    trending: {
      small: { type: String },
      large: { type: String },
    },
    regular: {
      small: { type: String, required: true },
      medium: { type: String, required: true },
      large: { type: String, required: true },
    },
  },
  summary: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model('Movie', MovieSchema);
