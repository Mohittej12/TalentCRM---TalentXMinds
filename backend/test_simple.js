const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
}).then(conn => {
    fs.writeFileSync('test_result.txt', 'SUCCESS: ' + conn.connection.host);
    console.log('Done');
    process.exit(0);
}).catch(err => {
    fs.writeFileSync('test_result.txt', 'ERROR: ' + err.message + '\nFull: ' + JSON.stringify(err, null, 2));
    console.log('Done with error');
    process.exit(1);
});
