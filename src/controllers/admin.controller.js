import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiErrors.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Admin from "../models/admin.model.js";
import * as common from "../helper/common.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../util/sendEmail.js";

// Register a new user
const register = asyncHandler(async (req, res) => {
  const userData = req.body;

  try {
    await Admin.create(userData);

    return res
      .status(201)
      .json(new ApiResponse(200, "User registered successfully"));
  } catch (err) {
    return res
      .status(400)
      .json(new ApiError(400, "Something went wrong during registration"));
  }
});

// Admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Admin.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json(new ApiError(400, "This email is not connected to any user"));
  }

  if (!user.status) {
    return res.status(400).json(new ApiError(400, "User is blocked"));
  }

  const auth = await user.isPasswordCorrect(password);
  if (!auth) {
    return res
      .status(400)
      .json(new ApiError(400, "Please enter correct password"));
  }

  // Generate OTP
  // const otp = await common.generateOTP();
  const otp = 123456;
  user.otp = otp;
  await user.save();

  // Send OTP to user's email
  const mailOptions = {
    from: "refundreplace.acctssupport@eurekaforbes.com", // Sender email address
    to: email, // Recipient email address
    subject: "OTP to login: Admin Panel", // Email subject
    text: `Dear ${user.username},

You have requested to log in to the Admin Panel. Please use the following One-Time Password (OTP) to complete your login process:

OTP: ${otp}

This OTP is valid for a limited time. If you did not initiate this request, please contact support immediately.

Thank you, 
Eurekaforbes Team`,
  };
  // await sendEmail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful, OTP sent to email"));
});
const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("email:", email);

  const user = await Admin.findOne({ email, userType: "Super Admin" });
  if (!user) {
    return res
      .status(400)
      .json(new ApiError(400, "This email is not connected to any user"));
  }

  if (!user.status) {
    return res.status(400).json(new ApiError(400, "User is blocked"));
  }

  const auth = await user.isPasswordCorrect(password);
  if (!auth) {
    return res
      .status(400)
      .json(new ApiError(400, "Please enter correct password"));
  }

  // Generate OTP
  // const otp = await common.generateOTP();
  const otp = 123456;
  user.otp = otp;
  await user.save();

  // Send OTP to user's email
  const mailOptions = {
    from: "prabhat.poddar@spacetotech.com", // Sender email address
    to: email, // Recipient email address
    subject: "OTP to login: Super Admin Panel", // Email subject
    text: `Dear Admin,

You have requested to log in to the Super Admin Panel. Please use the following One-Time Password (OTP) to complete your login process:

OTP: ${otp}

This OTP is valid for a limited time. If you did not initiate this request, please contact support immediately.

Thank you, 
Eurekaforbes Team`, // Plain text body
    // html: '<strong>and easy to do anywhere, even with Node.js</strong>',  // HTML body
  };
  // await sendEmail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful, OTP sent to email"));
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await Admin.findOne({ email }).select("otp");
  if (!user) {
    return res
      .status(400)
      .json(new ApiError(400, "No user found with this email"));
  }

  if (user.otp !== otp) {
    return res.status(400).json(new ApiError(400, "Invalid OTP"));
  }

  user.otp = null;

  // Generate Access and Refresh Tokens
  const { accessToken, refreshToken } =
    await common.generateAccessAndRefreshTokensAdmin(user._id);
  user.refreshToken = refreshToken;

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, accessToken, "OTP verified successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const user = await Admin.findById(_id).select("profileImg email username userType");
  if (!user) {
    return res.status(400).json(new ApiError(400, "No user found "));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user get successfully"));
});


export { register, loginAdmin, loginSuperAdmin, verifyOTP, getUser };
