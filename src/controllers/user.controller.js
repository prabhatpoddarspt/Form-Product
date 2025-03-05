import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiErrors.js";
import { ApiResponse } from "../util/ApiResponse.js";
import * as common from "../helper/common.js";
import { sendOTPEmail } from "../helper/mailer.js";

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";


// Register a new user and send tokens after successful registration
const register = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json(new ApiError(400, "User already exists with this email"));
        }

        // const otp = common.generateOTP();

        // Create user with OTP and other details but without generating tokens yet
        const user = await User.create({ email, username, password });


        // Generate tokens after successful registration
        const { accessToken, refreshToken } = await common.generateAccessAndRefreshTokensUsers(user._id);
        const registeredUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { user: registeredUser, accessToken, refreshToken },
                    "User registered successfully. Please verify your email with OTP."
                )
            );
    } catch (err) {
        return res
            .status(400)
            .json(new ApiError(400, "Something went wrong during registration"));
    }
});

// Send OTP to the user's email for verification
const sendOtp = asyncHandler(async (req, res) => {
    const { email, reason, username } = req.body;

    try {
        const user = await User.findOne({ email });


        if (user && reason === "Register") {
            return res
                .status(404)
                .json(new ApiError(404, "User already exists"));
        }

        if (!user && reason === "Login") {
            return res
                .status(404)
                .json(new ApiError(404, "User does not exist"));
        }



        // Generate new OTP and send it
        const otp = common.generateOTP();
        OTP.create({
            email: email,
            otp: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        });

        await sendOTPEmail(email, username, otp);

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "OTP sent to your email. Please verify your email with the OTP."));
    } catch (err) {
        console.log('err:', err)
        return res
            .status(400)
            .json(new ApiError(400, "Something went wrong while sending OTP"));
    }
});

// Verify OTP and activate user
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    try {
        const Otp = await OTP.findOne({ email });



        if (!Otp.verifyOTP(otp)) {
            return res
                .status(401)
                .json(new ApiError(401, "Invalid OTP"));
        }
        // Delete the OTP document after successful verification
        await OTP.findOneAndDelete({ email });

        // Generate tokens for the verified user

        return res
            .status(200)

            .json(
                new ApiResponse(
                    200,
                    "Email verified successfully"
                )
            );
    } catch (err) {
        return res
            .status(400)
            .json(new ApiError(400, "Something went wrong during OTP verification"));
    }
});


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, " email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await common.generateAccessAndRefreshTokensUsers(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: false,
        secure: false,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in Successfully")
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } }, // removes refreshToken field
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } = await common.generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});



export {
    register,
    verifyOtp,
    sendOtp,
    login,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
   
};
