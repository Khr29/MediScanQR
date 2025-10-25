const nodemailer = require("nodemailer");

// Create transporter once for efficiency
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"MediScanQR Support" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Message sent to ${to}: ${info.messageId}`);
        
    } catch (error) {
        console.error(`[Email] ❌ Failed to send email to ${to}. Error: ${error.message}`);
        const err = new Error("Failed to send email due to a server error.");
        err.statusCode = 500;
        throw err;
    }
};

module.exports = sendEmail;