const mongoose = require('mongoose');

const { Schema } = mongoose;

const BookmarkSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);