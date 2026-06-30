import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

// screen values: 'login' | 'register' | 'verify-email' | 'forgot-email' | 'forgot-otp' | 'forgot-newpass'

const Auth = () => {
    const [screen, setScreen] = useState('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const showAlert = (type, message) => setAlert({ type, message });
    const clearAlert = () => setAlert({ type: '', message: '' });

    const goTo = (s) => { clearAlert(); setScreen(s); };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // ── LOGIN ──
    const handleLogin = async (e) => {
        e.preventDefault(); clearAlert(); setLoading(true);
        try {
            const res = await API.post('/auth/login', { email: formData.email, password: formData.password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.name);
            showAlert('success', `Welcome, ${res.data.name}! Redirecting...`);
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            const data = err.response?.data;
            if (data?.needsVerification) {
                setPendingEmail(data.email);
                showAlert('danger', data.message);
                setTimeout(() => goTo('verify-email'), 1500);
            } else {
                showAlert('danger', data?.message || 'Login failed. Please try again.');
            }
        } finally { setLoading(false); }
    };

    // ── REGISTER ──
    const handleRegister = async (e) => {
        e.preventDefault(); clearAlert(); setLoading(true);
        try {
            const res = await API.post('/auth/register', formData);
            if (res.data.needsVerification) {
                setPendingEmail(res.data.email);
                goTo('verify-email');
                showAlert('success', 'Account created! Check your email for a verification code.');
            }
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Registration failed.');
        } finally { setLoading(false); }
    };

    // ── VERIFY EMAIL ──
    const handleVerifyEmail = async (e) => {
        e.preventDefault(); clearAlert(); setLoading(true);
        try {
            const res = await API.post('/auth/verify-email', { email: pendingEmail, otp });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.name);
            showAlert('success', '✅ Account verified! Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Invalid or expired code.');
        } finally { setLoading(false); }
    };

    const handleResendVerification = async () => {
        try {
            await API.post('/auth/resend-verification', { email: pendingEmail });
            showAlert('success', 'New verification code sent to your email!');
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Failed to resend code.');
        }
    };

    // ── FORGOT PASSWORD: SEND OTP ──
    const handleForgotSend = async (e) => {
        e.preventDefault(); clearAlert(); setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email: forgotEmail });
            setPendingEmail(forgotEmail);
            goTo('forgot-otp');
            showAlert('success', 'Reset code sent! Check your email.');
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Failed to send reset code.');
        } finally { setLoading(false); }
    };

    // ── FORGOT PASSWORD: VERIFY OTP ──
    const handleForgotVerifyOtp = async (e) => {
        e.preventDefault(); clearAlert(); setLoading(true);
        try {
            const res = await API.post('/auth/verify-reset-otp', { email: pendingEmail, otp });
            setResetToken(res.data.resetToken);
            goTo('forgot-newpass');
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Invalid or expired code.');
        } finally { setLoading(false); }
    };

    // ── FORGOT PASSWORD: SET NEW PASSWORD ──
    const handleResetPassword = async (e) => {
        e.preventDefault(); clearAlert();
        if (newPassword !== confirmPassword)
            return showAlert('danger', 'Passwords do not match.');
        if (newPassword.length < 6)
            return showAlert('danger', 'Password must be at least 6 characters.');
        setLoading(true);
        try {
            await API.post('/auth/reset-password', { resetToken, newPassword });
            showAlert('success', 'Password reset! Please sign in with your new password.');
            setTimeout(() => goTo('login'), 2000);
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Failed to reset password.');
        } finally { setLoading(false); }
    };

    const titleMap = {
        'login': 'Sign In',
        'register': 'Join TalentCRM',
        'verify-email': 'Verify Your Email',
        'forgot-email': 'Forgot Password',
        'forgot-otp': 'Enter Reset Code',
        'forgot-newpass': 'Create New Password',
    };
    const subtitleMap = {
        'login': 'Welcome back! Access your ATS dashboard',
        'register': 'Create an account to manage candidates',
        'verify-email': `Enter the 6-digit code sent to ${pendingEmail}`,
        'forgot-email': 'Enter your email to receive a reset code',
        'forgot-otp': `Enter the 6-digit code sent to ${pendingEmail}`,
        'forgot-newpass': 'Set a strong new password for your account',
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{titleMap[screen]}</h2>
                    <p>{subtitleMap[screen]}</p>
                </div>

                {alert.message && (
                    <div className={`alert alert-${alert.type}`}>
                        {alert.type === 'danger' ? '⚠️' : '✅'} {alert.message}
                    </div>
                )}

                {/* ── LOGIN ── */}
                {screen === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" placeholder="name@company.com"
                                value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" placeholder="••••••••"
                                value={formData.password} onChange={handleChange} required />
                        </div>
                        <div style={{ textAlign: 'right', margin: '-8px 0 12px' }}>
                            <span className="auth-link" onClick={() => { setForgotEmail(formData.email); goTo('forgot-email'); }}
                                style={{ fontSize: '0.85rem' }}>
                                Forgot password?
                            </span>
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                )}

                {/* ── REGISTER ── */}
                {screen === 'register' && (
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" placeholder="John Doe"
                                value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-email">Email Address</label>
                            <input type="email" id="reg-email" name="email" placeholder="name@company.com"
                                value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-password">Password</label>
                            <input type="password" id="reg-password" name="password" placeholder="Min. 6 characters"
                                value={formData.password} onChange={handleChange} required minLength={6} />
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                )}

                {/* ── VERIFY EMAIL OTP ── */}
                {screen === 'verify-email' && (
                    <form onSubmit={handleVerifyEmail}>
                        <div className="form-group">
                            <label>6-Digit Verification Code</label>
                            <input type="text" placeholder="Enter 6-digit code" maxLength={6}
                                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                required style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', fontFamily: 'monospace' }} />
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </button>
                        <p style={{ textAlign: 'center', marginTop: '14px', color: '#6b7280', fontSize: '0.85rem' }}>
                            Didn't receive the code?{' '}
                            <span className="auth-link" onClick={handleResendVerification}>Resend</span>
                        </p>
                    </form>
                )}

                {/* ── FORGOT: ENTER EMAIL ── */}
                {screen === 'forgot-email' && (
                    <form onSubmit={handleForgotSend}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="name@company.com"
                                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                {/* ── FORGOT: ENTER OTP ── */}
                {screen === 'forgot-otp' && (
                    <form onSubmit={handleForgotVerifyOtp}>
                        <div className="form-group">
                            <label>6-Digit Reset Code</label>
                            <input type="text" placeholder="Enter 6-digit code" maxLength={6}
                                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                required style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', fontFamily: 'monospace' }} />
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                )}

                {/* ── FORGOT: NEW PASSWORD ── */}
                {screen === 'forgot-newpass' && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" placeholder="Min. 6 characters"
                                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" placeholder="Re-enter new password"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                required minLength={6} />
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* ── FOOTER LINKS ── */}
                <div className="auth-footer">
                    {screen === 'login' && (
                        <p>Don't have an account?{' '}
                            <span onClick={() => goTo('register')}>Sign up</span>
                        </p>
                    )}
                    {screen === 'register' && (
                        <p>Already have an account?{' '}
                            <span onClick={() => goTo('login')}>Sign in</span>
                        </p>
                    )}
                    {(screen === 'forgot-email' || screen === 'forgot-otp' || screen === 'forgot-newpass' || screen === 'verify-email') && (
                        <p><span onClick={() => goTo('login')}>← Back to Sign In</span></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
