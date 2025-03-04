import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: "192.168.9.81",
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false, 
  },
});
// const transporter = nodemailer.createTransport({
//   service: 'gmail', 
//   auth: {
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS,  
//   },
// });

// Send email function
export const sendEmail = async (mailOptions) => {
  try {
    // Send email using the transporter
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Error sending email:", error);
    if (error.response) {
      console.log("Response:", error.response);
    }
  }
};
