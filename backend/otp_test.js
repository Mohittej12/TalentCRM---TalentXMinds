const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/User');

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/talentcrm-test');
        console.log('Connected to DB');
        await User.deleteMany({}); // clear users

        const email = 'test' + Date.now() + '@gmail.com';
        const registerPayload = {
            name: 'Test User',
            email,
            password: 'password123'
        };

        const res = await axios.post('http://localhost:5000/api/auth/register', registerPayload).catch(e => e.response);
        console.log('Register Res:', res.data);

        // Fetch User from DB and print verifyOTP
        const user = await User.findOne({ email });
        console.log('User in DB:', JSON.stringify(user, null, 2));

        const otp = user.verifyOTP;

        const verifyRes = await axios.post('http://localhost:5000/api/auth/verify-email', { email, otp }).catch(e => e.response);
        console.log('Verify Res:', verifyRes.data);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

test();
