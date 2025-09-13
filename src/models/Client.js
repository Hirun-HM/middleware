const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  contractDetails: {
    contractId: String,
    startDate: Date,
    endDate: Date,
    billingType: {
      type: String,
      enum: ['per_delivery', 'monthly', 'volume_based']
    },
    rates: {
      baseRate: Number,
      perKmRate: Number,
      weightMultiplier: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  apiCredentials: {
    apiKey: String,
    secretKey: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
