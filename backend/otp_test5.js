const axios = require('axios');

const test = async () => {
    try {
        const email = 'testuser_' + Date.now() + '@gmail.com';
        const registerPayload = {
            name: 'Test Local',
            email,
            password: 'password123'
        };

        console.log('Registering...', email);
        const reg = await axios.post('http://localhost:5000/api/auth/register', registerPayload).catch(e => e.response);
        console.log('Register Res:', reg.data);

        // DEV ROUTE: check what DB got!
        const check = await axios.post('http://localhost:5000/api/auth/dev-check-user', { email }).catch(e => e.response);
        console.log('\nDB User:', check.data.user);

        if (check.data.user) {
            const otp = check.data.user.verifyOTP;
            console.log('\nVerifying with OTP:', otp);
            const verify = await axios.post('http://localhost:5000/api/auth/verify-email', { email, otp }).catch(e => e.response);
            console.log('Verify Res:', verify.data);
        }
    } catch (e) {
        console.error(e.message);
    }
};
test();
