// require('../config/db.config');
const mongoose = require("mongoose");
const departmentSeeder = require('./department.seed');
const seed = async () => {
    try {
        await departmentSeeder();
    } catch (error) {
        console.error(`Error during seeding: ${error.stack}`);
    } finally {
        mongoose.disconnect();
        console.info('Seeding completed.');
    }
}

seed();