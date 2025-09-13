const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { validateOrder } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const orderService = require('../services/orderService');

// Submit new order
router.post('/', authenticateToken, validateOrder, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Create order in database
    const order = new Order(orderData);
    await order.save();

    // Send to message queues for processing
    await orderService.processNewOrder(order);

    res.status(201).json({
      success: true,
      orderId: order.orderId,
      message: 'Order submitted successfully'
    });

    // Emit real-time update to client portal
    global.io.to(`client-${order.clientId}`).emit('orderUpdate', {
      orderId: order.orderId,
      status: 'pending',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Order submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit order'
    });
  }
});

// Get order by ID
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve order'
    });
  }
});

// Update order status
router.put('/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes, location } = req.body;
    
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { 
        status,
        $push: {
          tracking: {
            status,
            notes,
            location,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Send real-time update
    global.io.to(`client-${order.clientId}`).emit('orderUpdate', {
      orderId: order.orderId,
      status,
      timestamp: new Date()
    });

    // Notify driver if applicable
    if (order.driverId) {
      global.io.to(`driver-${order.driverId}`).emit('orderUpdate', {
        orderId: order.orderId,
        status,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// Get order tracking history
router.get('/:orderId/tracking', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne(
      { orderId: req.params.orderId },
      { tracking: 1, status: 1, orderId: 1 }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      tracking: order.tracking,
      currentStatus: order.status
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tracking information'
    });
  }
});

module.exports = router;
