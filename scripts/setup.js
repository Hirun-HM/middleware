const mongoose = require('mongoose');
const Client = require('../src/models/Client');
const Driver = require('../src/models/Driver');
const Order = require('../src/models/Order');
require('dotenv').config();

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swilogistics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data and drop collections to reset schema
    await mongoose.connection.dropCollection('clients').catch(() => { });
    await mongoose.connection.dropCollection('drivers').catch(() => { });
    await mongoose.connection.dropCollection('orders').catch(() => { });

    console.log('Cleared existing data');

    // Create sample clients
    const clients = [
      {
        clientId: 'CLI-001',
        companyName: 'TechShop Lanka',
        contactPerson: {
          name: 'Amara Silva',
          email: 'amara@techshop.lk',
          phone: '+94771234567'
        },
        address: {
          street: '123 Galle Road',
          city: 'Colombo',
          postalCode: '00300',
          country: 'Sri Lanka'
        },
        contractDetails: {
          contractId: 'CON-001',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          billingType: 'per_delivery',
          rates: {
            baseRate: 500,
            perKmRate: 25,
            weightMultiplier: 50
          }
        },
        status: 'active',
        apiCredentials: {
          apiKey: 'techshop_api_key_123',
          secretKey: 'techshop_secret_456'
        }
      },
      {
        clientId: 'CLI-002',
        companyName: 'Fashion Hub',
        contactPerson: {
          name: 'Priya Fernando',
          email: 'priya@fashionhub.lk',
          phone: '+94771234568'
        },
        address: {
          street: '456 Kandy Road',
          city: 'Kandy',
          postalCode: '20000',
          country: 'Sri Lanka'
        },
        contractDetails: {
          contractId: 'CON-002',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2025-12-31'),
          billingType: 'monthly',
          rates: {
            baseRate: 400,
            perKmRate: 20,
            weightMultiplier: 40
          }
        },
        status: 'active',
        apiCredentials: {
          apiKey: 'fashionhub_api_key_789',
          secretKey: 'fashionhub_secret_012'
        }
      }
    ];

    await Client.insertMany(clients);
    console.log('Created sample clients');

    // Create sample drivers
    const drivers = [
      {
        driverId: 'DRV-001',
        personalInfo: {
          firstName: 'Kamal',
          lastName: 'Perera',
          email: 'kamal@swilogistics.lk',
          phone: '+94771111001',
          licenseNumber: 'DL123456789'
        },
        vehicle: {
          vehicleId: 'VH-001',
          type: 'van',
          capacity: {
            weight: 1000,
            volume: 15
          },
          licensePlate: 'CAB-1234'
        },
        status: 'available',
        currentLocation: {
          lat: 6.9271,
          lng: 79.8612,
          timestamp: new Date()
        },
        performance: {
          totalDeliveries: 150,
          successfulDeliveries: 145,
          avgDeliveryTime: 25,
          rating: 4.8
        }
      },
      {
        driverId: 'DRV-002',
        personalInfo: {
          firstName: 'Sunil',
          lastName: 'Jayawardena',
          email: 'sunil@swilogistics.lk',
          phone: '+94771111002',
          licenseNumber: 'DL987654321'
        },
        vehicle: {
          vehicleId: 'VH-002',
          type: 'motorcycle',
          capacity: {
            weight: 50,
            volume: 2
          },
          licensePlate: 'CAB-5678'
        },
        status: 'on_route',
        currentLocation: {
          lat: 7.2906,
          lng: 80.6337,
          timestamp: new Date()
        },
        performance: {
          totalDeliveries: 89,
          successfulDeliveries: 86,
          avgDeliveryTime: 18,
          rating: 4.6
        }
      },
      {
        driverId: 'DRV-003',
        personalInfo: {
          firstName: 'Nimal',
          lastName: 'Rodrigo',
          email: 'nimal@swilogistics.lk',
          phone: '+94771111003',
          licenseNumber: 'DL456789123'
        },
        vehicle: {
          vehicleId: 'VH-003',
          type: 'truck',
          capacity: {
            weight: 3000,
            volume: 40
          },
          licensePlate: 'CAB-9012'
        },
        status: 'available',
        currentLocation: {
          lat: 6.0329,
          lng: 80.2168,
          timestamp: new Date()
        },
        performance: {
          totalDeliveries: 200,
          successfulDeliveries: 195,
          avgDeliveryTime: 35,
          rating: 4.9
        }
      }
    ];

    await Driver.insertMany(drivers);
    console.log('Created sample drivers');

    // Create sample orders
    const orders = [
      {
        orderId: 'ORD-001',
        clientId: 'CLI-001',
        packageDetails: {
          weight: 2.5,
          dimensions: {
            length: 30,
            width: 20,
            height: 15
          },
          description: 'Electronics - Smartphone',
          value: 75000
        },
        pickupAddress: {
          street: '123 Galle Road',
          city: 'Colombo',
          postalCode: '00300',
          country: 'Sri Lanka',
          coordinates: {
            lat: 6.9271,
            lng: 79.8612
          }
        },
        deliveryAddress: {
          street: '789 Nugegoda Road',
          city: 'Nugegoda',
          postalCode: '10250',
          country: 'Sri Lanka',
          coordinates: {
            lat: 6.8649,
            lng: 79.8997
          },
          contactName: 'Saman Kumara',
          contactPhone: '+94712345678'
        },
        status: 'in_transit',
        priority: 'normal',
        driverId: 'DRV-001',
        estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        route: {
          routeId: 'ROUTE-001',
          sequence: 1
        },
        tracking: [
          {
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            status: 'pending',
            location: 'Order submitted',
            notes: 'Order received from client'
          },
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            status: 'picked_up',
            location: 'Warehouse A',
            notes: 'Package picked up by driver'
          },
          {
            timestamp: new Date(),
            status: 'in_transit',
            location: 'En route to destination',
            notes: 'Package in transit'
          }
        ]
      }
    ];

    await Order.insertMany(orders);
    console.log('Created sample orders');

    console.log('Database setup completed successfully!');

    // Display summary
    console.log('\n=== SETUP SUMMARY ===');
    console.log(`Clients created: ${clients.length}`);
    console.log(`Drivers created: ${drivers.length}`);
    console.log(`Orders created: ${orders.length}`);

    console.log('\n=== SAMPLE LOGIN CREDENTIALS ===');
    console.log('Client Login:');
    console.log('  Client ID: CLI-001');
    console.log('  API Key: techshop_api_key_123');
    console.log('\nDriver Login:');
    console.log('  Driver ID: DRV-001');
    console.log('  Password: (any password for demo)');

  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupDatabase();
