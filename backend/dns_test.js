const dns = require('dns');
const fs = require('fs');

dns.resolveSrv('_mongodb._tcp.cluster0.wgzkhsq.mongodb.net', (err, addresses) => {
    const result = {};
    if (err) {
        result.srv_error = err.message;
        result.srv_err_obj = err;
    } else {
        result.srv_addresses = addresses;
    }

    dns.resolveTxt('cluster0.wgzkhsq.mongodb.net', (err2, txtRecords) => {
        if (err2) {
            result.txt_error = err2.message;
        } else {
            result.txt_records = txtRecords;
        }
        fs.writeFileSync('dns_result.txt', JSON.stringify(result, null, 2));
        console.log('DNS test complete');
    });
});
