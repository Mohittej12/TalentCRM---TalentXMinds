const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Bypass Jio ISP DNS blocking

const mongoose = require('mongoose');
const fs = require('fs');

const passwords = [
    { label: "Decoded 'Mohittej@123' (encoded as Mohittej%40123)", uri: "mongodb+srv://talentadmin:Mohittej%40123@cluster0.wgzkhsq.mongodb.net/talentcrm?retryWrites=true&w=majority" },
    { label: "Literal 'Mohittej%40123' (double encoded as Mohittej%2540123)", uri: "mongodb+srv://talentadmin:Mohittej%2540123@cluster0.wgzkhsq.mongodb.net/talentcrm?retryWrites=true&w=majority" },
    { label: "Plain 'Mohittej123' (encoded as Mohittej123)", uri: "mongodb+srv://talentadmin:Mohittej123@cluster0.wgzkhsq.mongodb.net/talentcrm?retryWrites=true&w=majority" }
];

async function runTests() {
    const results = [];
    for (const test of passwords) {
        console.log(`Testing: ${test.label}`);
        try {
            const conn = await mongoose.connect(test.uri, { serverSelectionTimeoutMS: 5000 });
            results.push({ label: test.label, success: true, host: conn.connection.host });
            await mongoose.disconnect();
        } catch (err) {
            results.push({ label: test.label, success: false, error: err.message });
        }
    }
    fs.writeFileSync('auth_test_results.txt', JSON.stringify(results, null, 2));
    console.log("All auth variant tests complete");
}

runTests();
