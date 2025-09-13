const mongoose = require('mongoose');
require('dotenv').config();

async function testSchema() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Clear the model cache
        delete mongoose.connection.models.Driver;

        // Load the Driver model
        const Driver = require('./src/models/Driver');

        // Print the schema
        console.log('Driver schema paths:');
        console.log(Driver.schema.paths);
        console.log('\nVehicle field schema:');
        console.log(Driver.schema.paths.vehicle);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
}

testSchema();
