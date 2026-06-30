const dns = require('dns');
// Set DNS resolved globally to Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const srvUri = "mongodb+srv://talentadmin:Mohittej%40123@cluster0.wgzkhsq.mongodb.net/talentcrm?retryWrites=true&w=majority";

console.log("Testing SRV with Google DNS resolver...");

mongoose.connect(srvUri, {
    serverSelectionTimeoutMS: 5000,
}).then(conn => {
    console.log("SUCCESS: Connected to host ->", conn.connection.host);
    process.exit(0);
}).catch(err => {
    console.error("ERROR: Failed to connect ->", err.message);
    process.exit(1);
});
