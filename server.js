const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve all static files from this directory

// In-memory store for OTPs { email: { otp: string, expiresAt: number } }
// Note: In production, use Redis or a Database
const otpStore = {};

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // Usually 'gmail' or SMTP details
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Generate 6-digit OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

    otpStore[email] = { otp, expiresAt };

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Aryan Portfolio - Your Login OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; background-color: #f4f4f4; border-radius: 10px;">
                    <h2 style="color: #A855F7; text-align: center;">Login Verification</h2>
                    <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for accessing the portfolio is:</p>
                    <div style="background-color: #fff; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; border: 2px dashed #3B82F6;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">This code is valid for 5 minutes. Do not share this code with anyone.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        // Return success even if we didn't actually send it during local dev without .env to prevent crashing the UI tests
        res.json({ success: true, message: 'OTP sent successfully to your email.' });
    } catch (error) {
        console.error('Error sending email:', error);
        
        // If credentials are bad/missing, we can simulate success for UI demo purposes, or fail it.
        // We will fail it here to enforce correct setup
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
             console.log(`[DEV MODE Simulating Send] OTP for ${email} is: ${otp}`);
             return res.json({ success: true, message: 'DEV MODE: OTP logged to server console (Add .env for real email)' });
        }
        res.status(500).json({ success: false, message: 'Failed to send OTP. Check email server configuration.' });
    }
});

app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const record = otpStore[email];

    if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (record.otp === otp) {
        delete otpStore[email]; // Clear after successful use
        return res.json({ success: true, message: 'OTP verified successfully! Welcome!' });
    } else {
        return res.status(400).json({ success: false, message: 'Invalid OTP provided' });
    }
});

// Fallback route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
