const cmsAdapter = require('../integrations/cmsAdapter');
const rosAdapter = require('../integrations/rosAdapter');
const wmsAdapter = require('../integrations/wmsAdapter');

class OrderService {
  async processNewOrder(order) {
    try {
      console.log(`Processing order ${order.orderId}`);

      // Check if we're in demo mode (no RabbitMQ)
      if (!global.rabbitmqChannel) {
        console.log('📋 Demo mode: Using mock message processing');
        
        // Use demo processor
        if (global.DemoMessageProcessor) {
          global.DemoMessageProcessor.processOrder(order);
        }
        
        return {
          success: true,
          message: 'Order processing initiated (demo mode)'
        };
      }

      // Send order to message queues for async processing
      if (global.rabbitmqChannel) {
        // Send to WMS for warehouse processing
        await global.rabbitmqChannel.sendToQueue(
          'orders_to_wms',
          Buffer.from(JSON.stringify({
            orderId: order.orderId,
            action: 'CREATE_PACKAGE',
            packageDetails: order.packageDetails,
            pickupAddress: order.pickupAddress
          }))
        );

        // Send to ROS for route optimization
        await global.rabbitmqChannel.sendToQueue(
          'orders_to_ros',
          Buffer.from(JSON.stringify({
            orderId: order.orderId,
            action: 'ADD_DELIVERY_POINT',
            deliveryAddress: order.deliveryAddress,
            priority: order.priority
          }))
        );

        console.log(`Order ${order.orderId} sent to processing queues`);
      }

      return {
        success: true,
        message: 'Order processing initiated'
      };
    } catch (error) {
      console.error('Order processing error:', error);
      throw error;
    }
  }

  async updateOrderFromCMS(orderData) {
    try {
      // Process CMS updates (billing, contract validation, etc.)
      const cmsResponse = await cmsAdapter.validateOrder(orderData);
      
      if (cmsResponse.success) {
        // Update order status
        await this.updateOrderStatus(orderData.orderId, 'processing');
      }

      return cmsResponse;
    } catch (error) {
      console.error('CMS update error:', error);
      throw error;
    }
  }

  async updateOrderFromROS(routeData) {
    try {
      // Process route optimization results
      const Order = require('../models/Order');
      
      await Order.findOneAndUpdate(
        { orderId: routeData.orderId },
        {
          route: {
            routeId: routeData.routeId,
            sequence: routeData.sequence,
            optimizedRoute: routeData.route
          },
          estimatedDeliveryTime: routeData.estimatedDeliveryTime,
          driverId: routeData.assignedDriverId
        }
      );

      // Notify driver about new assignment
      if (global.io && routeData.assignedDriverId) {
        global.io.to(`driver-${routeData.assignedDriverId}`).emit('routeUpdate', {
          orderId: routeData.orderId,
          route: routeData.route,
          estimatedTime: routeData.estimatedDeliveryTime
        });
      }

      return {
        success: true,
        message: 'Route updated successfully'
      };
    } catch (error) {
      console.error('ROS update error:', error);
      throw error;
    }
  }

  async updateOrderFromWMS(warehouseData) {
    try {
      // Process warehouse updates (package ready, picked up, etc.)
      await this.updateOrderStatus(warehouseData.orderId, warehouseData.status);

      return {
        success: true,
        message: 'Warehouse status updated'
      };
    } catch (error) {
      console.error('WMS update error:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const Order = require('../models/Order');
      
      const order = await Order.findOneAndUpdate(
        { orderId },
        {
          status,
          $push: {
            tracking: {
              status,
              notes,
              timestamp: new Date()
            }
          }
        },
        { new: true }
      );

      if (order && global.io) {
        // Send real-time update to client
        global.io.to(`client-${order.clientId}`).emit('orderUpdate', {
          orderId: order.orderId,
          status,
          timestamp: new Date()
        });

        // Send update to driver if assigned
        if (order.driverId) {
          global.io.to(`driver-${order.driverId}`).emit('orderUpdate', {
            orderId: order.orderId,
            status,
            timestamp: new Date()
          });
        }
      }

      return order;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();
