const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "co.workingspace.swdev.hello@gmail.com",
    pass: "mairoira123456",
  },
});

// Function to send email
exports.sendEmail = async (to, subject, text) => {
  try {
    // console.log(process.env.EMAIL_USERNAME,process.env.EMAIL_PASSWORD)
    await transporter.sendMail({
      from: "co.workingspace.swdev.hello@gmail.com",
      to,
      subject,
      text,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Function to generate OTP
exports.generateOTP = () => {
  // Generate and return OTP logic here
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  return otp.toString();
};
