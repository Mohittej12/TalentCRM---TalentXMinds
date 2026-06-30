const axios = require('axios');
const mongoose = require('mongoose');

const test = async () => {
    try {
        console.log('Connecting to db...');
        await mongoose.connect('mongodb://127.0.0.1:27017/talentcrm', { serverSelectionTimeoutMS: 2000 });
        const db = mongoose.connection.db;

        const email = 'test' + Date.now() + '@gmail.com';
        const registerPayload = {
            name: 'Test Local User',
            email,
            password: 'password123'
        };

        console.log('Registering...', email);
        const res = await axios.post('http://localhost:5000/api/auth/register', registerPayload).catch(e => e.response);
        console.log('Register Res:', res.data);

        // Fetch User directly from mongodb
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        console.log('User in DB:', user);

        const otp = user.verifyOTP;

        const verifyRes = await axios.post('http://localhost:5000/api/auth/verify-email', { email, otp }).catch(e => e.response);
        console.log('Verify Res:', verifyRes.data);

    } catch (e) {
        console.error(e.message);
    } finally {
        await mongoose.disconnect();
    }
};
test();
