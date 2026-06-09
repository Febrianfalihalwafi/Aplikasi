const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      sugarLevel: String,
      size: { type: String, default: 'M' },
    }
  ],
  totalAmount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  queueNumber: { type: Number },
  status: {
    type: String,
    enum: ['processing', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'processing'
  },
  orderType: { type: String, enum: ['dine-in', 'takeaway'], default: 'dine-in' },
  tableNumber: { type: String, default: '' },
  paymentMethod: { type: String, default: 'cash' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
