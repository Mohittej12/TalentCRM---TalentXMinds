const axios = require('axios');

const test = async () => {
    try {
        const email = 'test' + Date.now() + '@gmail.com';
        const registerPayload = {
            name: 'Test Local User',
            email,
            password: 'password123'
        };

        console.log('Registering...');
        const res = await axios.post('http://localhost:5000/api/auth/register', registerPayload).catch(e => e.response);
        console.log('Register Res:', res.data);

        // Fetch User from localhost:5000 directly using a debug script or I can't.
        // Wait, local server won't return OTP in response.
    } catch (e) {
        console.error(e.message);
    }
};
test();
