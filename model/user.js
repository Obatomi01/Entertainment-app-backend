const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  userName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  bookmarks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Movie',
    unique: false,
    default: [],
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('User', UserSchema);
