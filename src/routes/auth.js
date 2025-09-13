const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Client = require('../models/Client');
const Driver = require('../models/Driver');

// Client login
router.post('/client/login', async (req, res) => {
  try {
    const { clientId, apiKey } = req.body;

    console.log('Login attempt:', { clientId, apiKey });

    const client = await Client.findOne({
      clientId,
      'apiCredentials.apiKey': apiKey,
      status: 'active'
    });

    console.log('Found client:', client ? 'Yes' : 'No');

    if (!client) {
      // Debug: Check if client exists with different criteria
      const clientById = await Client.findOne({ clientId });
      console.log('Client by ID exists:', clientById ? 'Yes' : 'No');
      if (clientById) {
        console.log('Client API key:', clientById.apiCredentials?.apiKey);
        console.log('Client status:', clientById.status);
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        clientId: client.clientId,
        type: 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      client: {
        clientId: client.clientId,
        companyName: client.companyName
      }
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Driver login
router.post('/driver/login', async (req, res) => {
  try {
    const { driverId, password } = req.body;

    // In a real system, you'd have proper password authentication
    // For demo purposes, we'll use a simple validation
    const driver = await Driver.findOne({ driverId });

    if (!driver) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update driver status to available
    await Driver.findOneAndUpdate(
      { driverId },
      { status: 'available' }
    );

    const token = jwt.sign(
      {
        driverId: driver.driverId,
        type: 'driver'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      driver: {
        driverId: driver.driverId,
        name: `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
        vehicle: driver.vehicle
      }
    });
  } catch (error) {
    console.error('Driver login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Logout (for drivers to go offline)
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type === 'driver') {
        await Driver.findOneAndUpdate(
          { driverId: decoded.driverId },
          { status: 'offline' }
        );
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

module.exports = router;
