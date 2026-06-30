const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (to, otp, type) => {
    const isReset = type === 'reset';
    const subject = isReset
        ? 'TalentCRM — Password Reset Code'
        : 'TalentCRM — Verify Your Account';
    const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
    const message = isReset
        ? 'You requested a password reset. Use the 6-digit code below:'
        : 'Thanks for signing up for TalentCRM! Use the code below to verify your email:';

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">🧠 TalentCRM</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Applicant Tracking System</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#e2e8f0;margin:0 0 8px;">${heading}</h2>
        <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">${message}</p>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
          <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#818cf8;font-family:monospace;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px;margin:0;">⏰ This code expires in <strong style="color:#94a3b8;">15 minutes</strong>.</p>
        <p style="color:#64748b;font-size:13px;margin:8px 0 0;">🔒 Never share this code with anyone.</p>
      </div>
      <div style="background:#0a0f1e;padding:16px 32px;border-top:1px solid #1e293b;">
        <p style="color:#475569;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>`;

    await transporter.sendMail({
        from: `"TalentCRM" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

module.exports = { sendOTPEmail };
