const orderService = require('../services/orderService');

class OrderProcessor {
  constructor() {
    this.channel = null;
  }

  start(channel) {
    this.channel = channel;

    // Start consuming from different queues
    this.processWMSResponses();
    this.processROSResponses();
    this.processCMSResponses();

    console.log('Order processor workers started');
  }

  async processWMSResponses() {
    try {
      // Listen for responses from WMS
      await this.channel.consume('wms_responses', async (msg) => {
        if (msg) {
          try {
            const warehouseData = JSON.parse(msg.content.toString());
            await orderService.updateOrderFromWMS(warehouseData);
            this.channel.ack(msg);
            console.log(`Processed WMS response for order ${warehouseData.orderId}`);
          } catch (error) {
            console.error('Error processing WMS response:', error);
            this.channel.nack(msg, false, true); // Requeue on error
          }
        }
      });
    } catch (error) {
      console.error('Error setting up WMS response consumer:', error);
      // Don't crash the entire process, just log the error
    }
  }

  async processROSResponses() {
    try {
      // Listen for responses from ROS
      await this.channel.consume('ros_responses', async (msg) => {
        if (msg) {
          try {
            const routeData = JSON.parse(msg.content.toString());
            await orderService.updateOrderFromROS(routeData);
            this.channel.ack(msg);
            console.log(`Processed ROS response for order ${routeData.orderId}`);
          } catch (error) {
            console.error('Error processing ROS response:', error);
            this.channel.nack(msg, false, true); // Requeue on error
          }
        }
      });
    } catch (error) {
      console.error('Error setting up ROS response consumer:', error);
    }
  }

  async processCMSResponses() {
    try {
      // Listen for responses from CMS
      await this.channel.consume('cms_responses', async (msg) => {
        if (msg) {
          try {
            const cmsData = JSON.parse(msg.content.toString());
            await orderService.updateOrderFromCMS(cmsData);
            this.channel.ack(msg);
            console.log(`Processed CMS response for order ${cmsData.orderId}`);
          } catch (error) {
            console.error('Error processing CMS response:', error);
            this.channel.nack(msg, false, true); // Requeue on error
          }
        }
      });
    } catch (error) {
      console.error('Error setting up CMS response consumer:', error);
    }
  }

  // Simulate background processing tasks
  async simulateWMSProcessing() {
    try {
      // Consume orders sent to WMS
      await this.channel.consume('orders_to_wms', async (msg) => {
        if (msg) {
          try {
            const orderData = JSON.parse(msg.content.toString());

            // Simulate WMS processing time
            setTimeout(async () => {
              const response = {
                orderId: orderData.orderId,
                status: 'picked_up',
                warehouseId: 'WH001',
                packageId: `PKG-${Date.now()}`,
                timestamp: new Date()
              };

              // Send response back
              await this.channel.sendToQueue(
                'wms_responses',
                Buffer.from(JSON.stringify(response))
              );
            }, Math.random() * 3000 + 1000); // 1-4 seconds

            this.channel.ack(msg);
          } catch (error) {
            console.error('Error simulating WMS processing:', error);
            this.channel.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      console.error('Error setting up WMS simulation:', error);
    }
  }

  async simulateROSProcessing() {
    try {
      // Consume orders sent to ROS
      await this.channel.consume('orders_to_ros', async (msg) => {
        if (msg) {
          try {
            const orderData = JSON.parse(msg.content.toString());

            // Simulate route optimization
            setTimeout(async () => {
              const response = {
                orderId: orderData.orderId,
                routeId: `ROUTE-${Date.now()}`,
                sequence: Math.floor(Math.random() * 10) + 1,
                estimatedDeliveryTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
                assignedDriverId: `DRV-${Math.floor(Math.random() * 5) + 1}`,
                route: {
                  distance: Math.floor(Math.random() * 50) + 10,
                  duration: Math.floor(Math.random() * 120) + 30,
                  waypoints: [
                    orderData.deliveryAddress
                  ]
                }
              };

              // Send response back
              await this.channel.sendToQueue(
                'ros_responses',
                Buffer.from(JSON.stringify(response))
              );
            }, Math.random() * 2000 + 500); // 0.5-2.5 seconds

            this.channel.ack(msg);
          } catch (error) {
            console.error('Error simulating ROS processing:', error);
            this.channel.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      console.error('Error setting up ROS simulation:', error);
    }
  }
}

module.exports = new OrderProcessor();
