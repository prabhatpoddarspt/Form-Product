import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const generateAccessAndRefreshTokensUsers = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};
export const generateAccessAndRefreshTokensAdmin = async (userId) => {
  try {
    const user = await Admin.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

export const generateOTP = () => {
  // Generate a random 6-digit OTP
  return crypto.randomInt(100000, 999999);
};

export const calculateDaysSince = (createdAt) => {
  const today = new Date(); // Get today's date
  const createdDate = new Date(createdAt); // Convert createdAt to a Date object

  // Calculate the difference in time
  const timeDifference = today - createdDate;

  // Convert time difference from milliseconds to days
  const daysDifference = timeDifference / (1000 * 3600 * 24);

  return Math.floor(daysDifference); // Return the integer part of the difference
}

export const generatePermissionToken = (tokenPayload) => {
  return jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
};
export const getSbu = (value) => {
  // Generate a random 6-digit OTP
  let parts = value.split(' ');
  let number = parts[1];

  // Pad the number to ensure it is at least 2 digits long
  let sbuCode = parts[0] + number.padStart(2, '0');

  return sbuCode;
};
export const encryptToken = (input) => {
  let jsonString = JSON.stringify(input);

  let output = '';
  let shift = 4;
  for (let i = 0; i < jsonString.length; i++) {
    let charCode = jsonString.charCodeAt(i);
    output += String.fromCharCode(charCode + shift); // Shift the character code
  }
  return output;
};



export const getFormatDate = (dateString) => {
  const date = new Date(dateString);

  // Define an array of month abbreviations
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // Get the month, day, and year
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // Return the formatted date string
  return `${month} ${day}, ${year}`;

};

export const getFormatDateTime = (dateString) => {
  // Check if the dateString is valid
  const date = new Date(dateString);
  if (isNaN(date)) {
    return "";
  }

  // Define an array of month abbreviations
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // Get the month, day, year, hours, minutes, and seconds
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Format the hours, minutes, and seconds to always be two digits (e.g., 09:05)
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  // Return the formatted date and time string
  return `${month} ${day}, ${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};