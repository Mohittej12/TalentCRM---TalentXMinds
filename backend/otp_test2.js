const mongoose = require('mongoose');
const User = require('./src/models/User');

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/talentcrm-test');
        console.log('Connected');
        const email = 'test' + Date.now() + '@gmail.com';
        const otpReq = '123456';

        await User.create({
            name: 'Test',
            email,
            password: 'password',
            isVerified: false,
            verifyOTP: otpReq,
            verifyOTPExpiry: new Date(Date.now() + 15 * 60000)
        });

        const user = await User.findOne({ email });
        console.log('OTP from DB:', user.verifyOTP, typeof user.verifyOTP);
        console.log('OTP from Req:', otpReq, typeof otpReq);
        console.log('Match?', user.verifyOTP === otpReq);

    } catch (e) {
        console.log(e);
    } finally {
        await mongoose.disconnect();
    }
};
test();
