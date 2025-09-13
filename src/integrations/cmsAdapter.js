const axios = require('axios');
const xml2js = require('xml2js');

class CMSAdapter {
  constructor() {
    this.soapEndpoint = process.env.CMS_SOAP_ENDPOINT || 'http://localhost:8080/cms/soap';
    this.parser = new xml2js.Parser();
    this.builder = new xml2js.Builder();
  }

  async validateOrder(orderData) {
    try {
      // Create SOAP envelope for order validation
      const soapEnvelope = this.createSoapEnvelope('ValidateOrder', {
        orderId: orderData.orderId,
        clientId: orderData.clientId,
        value: orderData.packageDetails.value
      });

      console.log('Sending SOAP request to CMS for order validation...');
      
      // Simulate SOAP request (in real implementation, use axios)
      const response = await this.simulateCMSResponse(orderData);
      
      return response;
    } catch (error) {
      console.error('CMS validation error:', error);
      throw new Error('Failed to validate order with CMS');
    }
  }

  async createBilling(orderData) {
    try {
      const soapEnvelope = this.createSoapEnvelope('CreateBilling', {
        orderId: orderData.orderId,
        clientId: orderData.clientId,
        amount: this.calculateBilling(orderData)
      });

      const response = await this.simulateCMSResponse(orderData);
      return response;
    } catch (error) {
      console.error('CMS billing error:', error);
      throw new Error('Failed to create billing in CMS');
    }
  }

  createSoapEnvelope(operation, data) {
    const envelope = {
      'soap:Envelope': {
        '$': {
          'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:cms': 'http://swilogistics.com/cms'
        },
        'soap:Header': {},
        'soap:Body': {
          [`cms:${operation}`]: data
        }
      }
    };

    return this.builder.buildObject(envelope);
  }

  async parseSoapResponse(xmlResponse) {
    try {
      const result = await this.parser.parseStringPromise(xmlResponse);
      return result;
    } catch (error) {
      console.error('SOAP parsing error:', error);
      throw error;
    }
  }

  calculateBilling(orderData) {
    // Simple billing calculation
    const baseRate = 500; // LKR
    const weightRate = orderData.packageDetails.weight * 50;
    const distanceRate = 100; // Simplified
    
    return baseRate + weightRate + distanceRate;
  }

  // Simulate CMS response for demo purposes
  async simulateCMSResponse(orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          orderId: orderData.orderId,
          validationStatus: 'approved',
          billingAmount: this.calculateBilling(orderData),
          contractValid: true,
          timestamp: new Date()
        });
      }, 1000 + Math.random() * 2000); // 1-3 second delay
    });
  }
}

module.exports = new CMSAdapter();
