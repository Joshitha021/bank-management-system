const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Construct the email payload
  const mailOptions = {
    from: `"BankHub Security" <${process.env.NODEMAILER_USER}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
        <h2 style="color: #1e293b; text-align: center;">🏦 BankHub Security</h2>
        <p style="color: #475569; font-size: 16px;">Hello,</p>
        <p style="color: #475569; font-size: 16px;">${options.message}</p>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request this OTP, please contact our support team immediately.</p>
      </div>
    `
  };

  // Dispatch the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ [Nodemailer] SUCCESS: Real email dispatched to ${options.email}`);
    return true;
  } catch (err) {
    console.error('❌ [Nodemailer] ERROR: Failed to send email.', err.message);
    return false;
  }
};

module.exports = sendEmail;
