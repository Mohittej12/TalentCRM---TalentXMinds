const mongoose = require('mongoose');

const standardUri = "mongodb://talentadmin:Mohittej%40123@ac-ww24uny-shard-00-00.wgzkhsq.mongodb.net:27017,ac-ww24uny-shard-00-01.wgzkhsq.mongodb.net:27017,ac-ww24uny-shard-00-02.wgzkhsq.mongodb.net:27017/talentcrm?ssl=true&replicaSet=atlas-uiyjh5-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log("Testing standard connection string...");

mongoose.connect(standardUri, {
    serverSelectionTimeoutMS: 5000,
}).then(conn => {
    console.log("SUCCESS: Connected to host ->", conn.connection.host);
    process.exit(0);
}).catch(err => {
    console.error("ERROR: Failed to connect ->", err.message);
    process.exit(1);
});
