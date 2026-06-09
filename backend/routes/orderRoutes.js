const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');


// USER

// GET /api/order/my → user lihat pesanan sendiri
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// POST /api/order → user buat pesanan
router.post('/', auth, async (req, res) => {
  const { items, orderType, tableNumber, paymentMethod, tax } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ msg: 'Items tidak boleh kosong' });
  }

  try {
    const processedItems = items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      sugarLevel: item.sugarLevel || '',
      size: item.size || 'M',
    }));

    const subtotal = processedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const taxAmount = tax ?? Math.round(subtotal * 0.11);
    const totalAmount = subtotal + taxAmount;

    // Nomor antrian otomatis
    const lastOrder = await Order.findOne().sort({ queueNumber: -1 });
    const queueNumber =
      lastOrder && lastOrder.queueNumber ? lastOrder.queueNumber + 1 : 1;

    const newOrder = new Order({
      userId: req.user._id,
      items: processedItems,
      totalAmount,
      tax: taxAmount,
      queueNumber,
      status: 'processing',
      orderType: orderType || 'dine-in',
      tableNumber: tableNumber || '',
      paymentMethod: paymentMethod || 'cash',
    });

    const savedOrder = await newOrder.save();
    res.json(savedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ADMIN

// GET /api/order/all → admin lihat semua order
router.get('/all', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// GET /api/order/:id → user/admin lihat detail order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ msg: 'Order tidak ditemukan' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// PUT /api/order/:id/status → admin update status
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['processing', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Status tidak valid' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ msg: 'Order tidak ditemukan' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
