const mongoose = require('mongoose');

// Clear any existing model
delete mongoose.connection.models.Driver;

const vehicleSchema = new mongoose.Schema({
  vehicleId: String,
  type: String, // van, truck, motorcycle
  capacity: {
    weight: Number,
    volume: Number
  },
  licensePlate: String
}, { _id: false });

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    licenseNumber: String
  },
  vehicle: {
    type: vehicleSchema,
    default: {}
  },
  status: {
    type: String,
    enum: ['available', 'on_route', 'delivering', 'offline'],
    default: 'offline'
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  },
  currentRoute: {
    routeId: String,
    deliveries: [{
      orderId: String,
      sequence: Number,
      status: String
    }]
  },
  performance: {
    totalDeliveries: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    avgDeliveryTime: Number,
    rating: { type: Number, default: 5.0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
