const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String },
  prices: {
  S: { type: Number, default: 0 },
  M: { type: Number, default: 0 },
  L: { type: Number, default: 0 },
},
  image: { type: String },
  category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);