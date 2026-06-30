const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log("Using MONGO_URI from env:", process.env.MONGO_URI);

const connectTest = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("\n==================================================");
        console.log("SUCCESS: Connected to database host ->", conn.connection.host);
        console.log("==================================================\n");
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.log("\n==================================================");
        console.error("ERROR: Failed to connect ->", err.message);
        console.log("==================================================\n");
        process.exit(1);
    }
};

connectTest();
