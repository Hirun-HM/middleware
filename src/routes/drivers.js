const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { authenticateToken } = require('../middleware/auth');

// Get driver manifest (assigned deliveries)
router.get('/:driverId/manifest', authenticateToken, async (req, res) => {
  try {
    const driverId = req.params.driverId;
    
    const orders = await Order.find({
      driverId,
      status: { $in: ['picked_up', 'in_transit', 'out_for_delivery'] }
    }).sort({ 'route.sequence': 1 });

    const driver = await Driver.findOne({ driverId });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.json({
      success: true,
      manifest: {
        driverId,
        route: driver.currentRoute,
        deliveries: orders,
        totalDeliveries: orders.length
      }
    });
  } catch (error) {
    console.error('Get driver manifest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve manifest'
    });
  }
});

// Update driver location
router.put('/:driverId/location', authenticateToken, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    const driver = await Driver.findOneAndUpdate(
      { driverId: req.params.driverId },
      {
        currentLocation: {
          lat,
          lng,
          timestamp: new Date()
        }
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Broadcast location update to relevant clients
    const activeOrders = await Order.find({
      driverId: req.params.driverId,
      status: { $in: ['in_transit', 'out_for_delivery'] }
    });

    activeOrders.forEach(order => {
      global.io.to(`client-${order.clientId}`).emit('driverLocation', {
        orderId: order.orderId,
        location: { lat, lng },
        timestamp: new Date()
      });
    });

    res.json({
      success: true,
      location: driver.currentLocation
    });
  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

// Complete delivery
router.put('/deliveries/:orderId/complete', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { signature, photo, notes, completionType } = req.body;

    const updateData = {
      status: completionType === 'failed' ? 'failed' : 'delivered',
      actualDeliveryTime: new Date(),
      proofOfDelivery: {
        signature,
        photo,
        notes
      },
      $push: {
        tracking: {
          status: completionType === 'failed' ? 'failed' : 'delivered',
          notes,
          timestamp: new Date()
        }
      }
    };

    const order = await Order.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update driver performance
    await Driver.findOneAndUpdate(
      { driverId: order.driverId },
      {
        $inc: {
          'performance.totalDeliveries': 1,
          'performance.successfulDeliveries': completionType === 'failed' ? 0 : 1
        }
      }
    );

    // Send real-time updates
    global.io.to(`client-${order.clientId}`).emit('orderUpdate', {
      orderId: order.orderId,
      status: order.status,
      timestamp: new Date(),
      proofOfDelivery: order.proofOfDelivery
    });

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete delivery'
    });
  }
});

// Get driver performance
router.get('/:driverId/performance', authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findOne(
      { driverId: req.params.driverId },
      { performance: 1, driverId: 1 }
    );
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Calculate additional metrics
    const successRate = driver.performance.totalDeliveries > 0
      ? (driver.performance.successfulDeliveries / driver.performance.totalDeliveries) * 100
      : 0;

    res.json({
      success: true,
      performance: {
        ...driver.performance.toObject(),
        successRate: Math.round(successRate)
      }
    });
  } catch (error) {
    console.error('Get driver performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance data'
    });
  }
});

module.exports = router;
