const axios = require('axios');

class ROSAdapter {
  constructor() {
    this.restEndpoint = process.env.ROS_REST_ENDPOINT || 'http://localhost:8081/ros/api';
    this.apiKey = process.env.ROS_API_KEY || 'demo_api_key';
  }

  async optimizeRoute(deliveryPoints) {
    try {
      console.log('Sending route optimization request to ROS...');
      
      const requestData = {
        deliveryPoints,
        vehicleType: 'van',
        constraints: {
          maxDeliveries: 20,
          maxDistance: 100,
          timeWindow: {
            start: '08:00',
            end: '18:00'
          }
        }
      };

      // Simulate REST API call
      const response = await this.simulateROSResponse(requestData);
      
      return response;
    } catch (error) {
      console.error('ROS optimization error:', error);
      throw new Error('Failed to optimize route with ROS');
    }
  }

  async addDeliveryPoint(orderData) {
    try {
      const deliveryPoint = {
        orderId: orderData.orderId,
        address: orderData.deliveryAddress,
        priority: orderData.priority,
        timeWindow: this.calculateTimeWindow(orderData.priority),
        serviceTime: 10 // 10 minutes for delivery
      };

      const response = await this.optimizeRoute([deliveryPoint]);
      return response;
    } catch (error) {
      console.error('ROS add delivery point error:', error);
      throw error;
    }
  }

  async updateRoute(routeId, changes) {
    try {
      console.log(`Updating route ${routeId} with changes`);
      
      const response = await this.simulateRouteUpdate(routeId, changes);
      return response;
    } catch (error) {
      console.error('ROS route update error:', error);
      throw error;
    }
  }

  calculateTimeWindow(priority) {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    let endTime;
    switch (priority) {
      case 'urgent':
        endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours window
        break;
      case 'high':
        endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours window
        break;
      case 'normal':
        endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000); // 8 hours window
        break;
      default:
        endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours window
    }

    return {
      start: startTime.toISOString(),
      end: endTime.toISOString()
    };
  }

  calculateDistance(point1, point2) {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLon = this.deg2rad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Simulate ROS response for demo purposes
  async simulateROSResponse(requestData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deliveryPoint = requestData.deliveryPoints[0];
        
        resolve({
          success: true,
          routeId: `ROUTE-${Date.now()}`,
          optimizedRoute: {
            totalDistance: Math.floor(Math.random() * 50) + 10,
            totalDuration: Math.floor(Math.random() * 120) + 30,
            waypoints: requestData.deliveryPoints,
            estimatedStartTime: new Date(Date.now() + 30 * 60 * 1000),
            estimatedEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000)
          },
          assignments: [{
            orderId: deliveryPoint.orderId,
            sequence: 1,
            estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000),
            driverId: `DRV-${Math.floor(Math.random() * 5) + 1}`
          }],
          timestamp: new Date()
        });
      }, 500 + Math.random() * 1500); // 0.5-2 second delay
    });
  }

  async simulateRouteUpdate(routeId, changes) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          routeId,
          updatedRoute: {
            ...changes,
            lastUpdated: new Date()
          }
        });
      }, 300);
    });
  }
}

module.exports = new ROSAdapter();
