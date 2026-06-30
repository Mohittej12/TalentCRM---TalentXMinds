import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('enter'); // enter → hold → exit

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 600);
        const t2 = setTimeout(() => setPhase('exit'), 2200);
        const t3 = setTimeout(() => onComplete(), 2800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <div className={`splash-screen splash-${phase}`}>
            {/* Animated background orbs */}
            <div className="splash-orb splash-orb-1" />
            <div className="splash-orb splash-orb-2" />
            <div className="splash-orb splash-orb-3" />

            <div className="splash-content">
                {/* Logo Mark */}
                <div className="splash-logo-wrap">
                    <div className="splash-logo-ring" />
                    <div className="splash-logo-inner">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M24 8C15.16 8 8 15.16 8 24s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8zm0 6a6 6 0 110 12 6 6 0 010-12zm0 22.4a11.6 11.6 0 01-8.93-4.2C15.26 30.14 19.48 28.8 24 28.8c4.52 0 8.74 1.34 8.93 3.4A11.6 11.6 0 0124 36.4z"
                                fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#818cf8" />
                                    <stop offset="1" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Brand text */}
                <div className="splash-brand">
                    <h1 className="splash-title">TalentCRM</h1>
                    <p className="splash-subtitle">Applicant Tracking System</p>
                </div>

                {/* Loading dots */}
                <div className="splash-dots">
                    <span /><span /><span />
                </div>

                {/* Version tag */}
                <span className="splash-version">v2.0</span>
            </div>
        </div>
    );
};

export default SplashScreen;
