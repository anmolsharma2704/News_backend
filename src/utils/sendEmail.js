// sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: email,
            subject: subject,
            text: message,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent.');
    }
};

module.exports = sendEmail;
