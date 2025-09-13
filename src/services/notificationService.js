class NotificationService {
  constructor() {
    this.channel = null;
    this.io = null;
  }

  start(channel, io) {
    this.channel = channel;
    this.io = io;
    
    // Start consuming messages from notification queue
    this.consumeClientUpdates();
    this.consumeDriverNotifications();
    
    console.log('Notification service started');
  }

  async consumeClientUpdates() {
    try {
      await this.channel.consume('updates_to_clients', (msg) => {
        if (msg) {
          const update = JSON.parse(msg.content.toString());
          this.sendClientUpdate(update);
          this.channel.ack(msg);
        }
      });
    } catch (error) {
      console.error('Error consuming client updates:', error);
    }
  }

  async consumeDriverNotifications() {
    try {
      await this.channel.consume('driver_notifications', (msg) => {
        if (msg) {
          const notification = JSON.parse(msg.content.toString());
          this.sendDriverNotification(notification);
          this.channel.ack(msg);
        }
      });
    } catch (error) {
      console.error('Error consuming driver notifications:', error);
    }
  }

  sendClientUpdate(update) {
    try {
      // Send real-time update to specific client
      if (update.clientId) {
        this.io.to(`client-${update.clientId}`).emit('orderUpdate', {
          orderId: update.orderId,
          status: update.status,
          timestamp: update.timestamp,
          message: update.message
        });
      }

      // Send to all clients if broadcast
      if (update.broadcast) {
        this.io.emit('systemUpdate', {
          message: update.message,
          timestamp: update.timestamp
        });
      }
    } catch (error) {
      console.error('Error sending client update:', error);
    }
  }

  sendDriverNotification(notification) {
    try {
      if (notification.driverId) {
        this.io.to(`driver-${notification.driverId}`).emit('notification', {
          type: notification.type,
          message: notification.message,
          orderId: notification.orderId,
          priority: notification.priority,
          timestamp: notification.timestamp
        });
      }

      // Send to all drivers if broadcast
      if (notification.broadcast) {
        this.io.emit('driverBroadcast', {
          message: notification.message,
          timestamp: notification.timestamp
        });
      }
    } catch (error) {
      console.error('Error sending driver notification:', error);
    }
  }

  // Helper methods to send notifications programmatically
  async notifyOrderStatusChange(orderId, clientId, status, driverId = null) {
    const update = {
      orderId,
      clientId,
      status,
      timestamp: new Date(),
      message: `Order ${orderId} status changed to ${status}`
    };

    // Send to message queue for persistence
    if (this.channel) {
      await this.channel.sendToQueue(
        'updates_to_clients',
        Buffer.from(JSON.stringify(update))
      );
    }

    // Send to driver if assigned
    if (driverId) {
      const driverNotification = {
        driverId,
        type: 'order_update',
        orderId,
        message: `Order ${orderId} status: ${status}`,
        timestamp: new Date()
      };

      await this.channel.sendToQueue(
        'driver_notifications',
        Buffer.from(JSON.stringify(driverNotification))
      );
    }
  }

  async notifyRouteUpdate(driverId, routeData) {
    const notification = {
      driverId,
      type: 'route_update',
      message: 'Your route has been updated',
      routeData,
      timestamp: new Date()
    };

    if (this.channel) {
      await this.channel.sendToQueue(
        'driver_notifications',
        Buffer.from(JSON.stringify(notification))
      );
    }
  }

  async notifyUrgentDelivery(driverId, orderData) {
    const notification = {
      driverId,
      type: 'urgent_delivery',
      message: 'New urgent delivery assigned',
      orderId: orderData.orderId,
      priority: 'high',
      timestamp: new Date()
    };

    if (this.channel) {
      await this.channel.sendToQueue(
        'driver_notifications',
        Buffer.from(JSON.stringify(notification))
      );
    }
  }
}

module.exports = new NotificationService();
