const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Client = require('../models/Client');
const { authenticateToken } = require('../middleware/auth');

// Get client orders
router.get('/:clientId/orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { clientId: req.params.clientId };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get client orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve orders'
    });
  }
});

// Get client profile
router.get('/:clientId', authenticateToken, async (req, res) => {
  try {
    const client = await Client.findOne({ clientId: req.params.clientId });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Don't return sensitive data
    const { apiCredentials, ...clientData } = client.toObject();

    res.json({
      success: true,
      client: clientData
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve client information'
    });
  }
});

// Get client dashboard data
router.get('/:clientId/dashboard', authenticateToken, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Get order statistics
    const stats = await Order.aggregate([
      { $match: { clientId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId status createdAt estimatedDeliveryTime');

    // Calculate delivery performance
    const deliveredOrders = await Order.find({
      clientId,
      status: 'delivered'
    }).select('estimatedDeliveryTime actualDeliveryTime');

    let onTimeDeliveries = 0;
    deliveredOrders.forEach(order => {
      if (order.actualDeliveryTime <= order.estimatedDeliveryTime) {
        onTimeDeliveries++;
      }
    });

    const onTimePercentage = deliveredOrders.length > 0 
      ? (onTimeDeliveries / deliveredOrders.length) * 100 
      : 0;

    res.json({
      success: true,
      dashboard: {
        orderStats: stats,
        recentOrders,
        performance: {
          totalDelivered: deliveredOrders.length,
          onTimePercentage: Math.round(onTimePercentage)
        }
      }
    });
  } catch (error) {
    console.error('Get client dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

module.exports = router;
