import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert({ type: '', message: '' });
        setLoading(true);

        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : formData;

        try {
            const response = await API.post(endpoint, payload);
            const { token, name } = response.data;

            // Store in local storage
            localStorage.setItem('token', token);
            localStorage.setItem('userName', name);

            setAlert({ type: 'success', message: `Welcome, ${name}! Redirecting...` });

            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Authentication failed. Please try again.';
            setAlert({ type: 'danger', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? 'Sign In' : 'Join TalentCRM'}</h2>
                    <p>{isLogin ? 'Welcome back! Access your ATS' : 'Create an account to manage candidates'}</p>
                </div>

                {alert.message && (
                    <div className={`alert alert-${alert.type}`}>
                        {alert.type === 'danger' ? '⚠️' : '✅'} {alert.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? (
                        <p>
                            Don't have an account?{' '}
                            <span onClick={() => { setIsLogin(false); setAlert({ type: '', message: '' }); }}>
                                Sign up
                            </span>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <span onClick={() => { setIsLogin(true); setAlert({ type: '', message: '' }); }}>
                                Sign in
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
