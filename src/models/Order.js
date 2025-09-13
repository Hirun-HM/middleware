const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: String,
    required: true
  },
  packageDetails: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    description: String,
    value: Number
  },
  pickupAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    contactName: String,
    contactPhone: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  driverId: String,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  proofOfDelivery: {
    signature: String,
    photo: String,
    notes: String
  },
  route: {
    routeId: String,
    sequence: Number,
    optimizedRoute: Object
  },
  tracking: [{
    timestamp: { type: Date, default: Date.now },
    status: String,
    location: String,
    notes: String
  }]
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ clientId: 1, status: 1 });
orderSchema.index({ driverId: 1, status: 1 });
orderSchema.index({ orderId: 1 });

module.exports = mongoose.model('Order', orderSchema);
