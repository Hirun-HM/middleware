const net = require('net');

class WMSAdapter {
  constructor() {
    this.host = process.env.WMS_TCP_HOST || 'localhost';
    this.port = process.env.WMS_TCP_PORT || 9092;
    this.client = null;
    this.messageId = 0;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client = new net.Socket();
      
      this.client.connect(this.port, this.host, () => {
        console.log(`Connected to WMS at ${this.host}:${this.port}`);
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('WMS connection error:', error);
        reject(error);
      });

      this.client.on('close', () => {
        console.log('WMS connection closed');
      });
    });
  }

  async sendMessage(messageType, data) {
    try {
      if (!this.client || this.client.destroyed) {
        await this.connect();
      }

      const message = this.createMessage(messageType, data);
      
      return new Promise((resolve, reject) => {
        this.client.write(message);
        
        // Listen for response
        this.client.once('data', (response) => {
          try {
            const parsedResponse = this.parseMessage(response);
            resolve(parsedResponse);
          } catch (error) {
            reject(error);
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('WMS request timeout'));
        }, 10000);
      });
    } catch (error) {
      console.error('WMS send message error:', error);
      throw error;
    }
  }

  async createPackage(orderData) {
    try {
      console.log(`Creating package in WMS for order ${orderData.orderId}`);
      
      const packageData = {
        orderId: orderData.orderId,
        packageDetails: orderData.packageDetails,
        pickupAddress: orderData.pickupAddress,
        timestamp: new Date().toISOString()
      };

      // Simulate WMS response since we don't have actual WMS
      const response = await this.simulateWMSResponse('CREATE_PACKAGE', packageData);
      return response;
    } catch (error) {
      console.error('WMS create package error:', error);
      throw error;
    }
  }

  async updatePackageStatus(packageId, status) {
    try {
      const updateData = {
        packageId,
        status,
        timestamp: new Date().toISOString()
      };

      const response = await this.simulateWMSResponse('UPDATE_STATUS', updateData);
      return response;
    } catch (error) {
      console.error('WMS update status error:', error);
      throw error;
    }
  }

  async getPackageLocation(packageId) {
    try {
      const response = await this.simulateWMSResponse('GET_LOCATION', { packageId });
      return response;
    } catch (error) {
      console.error('WMS get location error:', error);
      throw error;
    }
  }

  createMessage(messageType, data) {
    this.messageId++;
    
    const message = {
      messageId: this.messageId,
      messageType,
      timestamp: new Date().toISOString(),
      data
    };

    // Convert to proprietary format (JSON for simplicity)
    const messageString = JSON.stringify(message);
    const messageLength = Buffer.byteLength(messageString);
    
    // Create message with length header (4 bytes) + message content
    const buffer = Buffer.alloc(4 + messageLength);
    buffer.writeUInt32BE(messageLength, 0);
    buffer.write(messageString, 4);
    
    return buffer;
  }

  parseMessage(buffer) {
    try {
      // Read message length from first 4 bytes
      const messageLength = buffer.readUInt32BE(0);
      
      // Extract message content
      const messageString = buffer.slice(4, 4 + messageLength).toString();
      const message = JSON.parse(messageString);
      
      return message;
    } catch (error) {
      console.error('WMS message parsing error:', error);
      throw new Error('Failed to parse WMS message');
    }
  }

  // Simulate WMS response for demo purposes
  async simulateWMSResponse(messageType, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let response = {
          success: true,
          messageType: `${messageType}_RESPONSE`,
          timestamp: new Date().toISOString()
        };

        switch (messageType) {
          case 'CREATE_PACKAGE':
            response.packageId = `PKG-${Date.now()}`;
            response.status = 'received';
            response.location = 'Warehouse A - Receiving';
            break;
            
          case 'UPDATE_STATUS':
            response.packageId = data.packageId;
            response.status = data.status;
            response.location = this.getLocationForStatus(data.status);
            break;
            
          case 'GET_LOCATION':
            response.packageId = data.packageId;
            response.location = 'Warehouse A - Loading Dock';
            response.status = 'ready_for_pickup';
            break;
        }

        resolve(response);
      }, 800 + Math.random() * 1200); // 0.8-2 second delay
    });
  }

  getLocationForStatus(status) {
    const locationMap = {
      'received': 'Warehouse A - Receiving',
      'processing': 'Warehouse A - Processing',
      'ready_for_pickup': 'Warehouse A - Loading Dock',
      'picked_up': 'Vehicle #123',
      'in_transit': 'On Route',
      'delivered': 'Delivered'
    };

    return locationMap[status] || 'Unknown Location';
  }

  disconnect() {
    if (this.client && !this.client.destroyed) {
      this.client.destroy();
    }
  }
}

module.exports = new WMSAdapter();
