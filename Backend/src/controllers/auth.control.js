const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../services/mail.service');

/* =========================
REGISTER USER
========================= */

async function registerUser(req, res) {

    try {

        const {
            email,
            fullName: {
                firstName,
                lastName
            },
            password
        } = req.body;

        if (!email || !firstName || !lastName || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const isUserAlreadyExists = await userModel.findOne({ email });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const user = await userModel.create({
            email,
            fullName: {
                firstName,
                lastName
            },
            password: hashedPassword,
            emailVerificationOTP: otp,
            isVerified: false,
            emailVerificationExpire: Date.now() + 10 * 60 * 1000
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Email",
            text: `Your OTP is ${otp}`
        });

        return res.status(201).json({
            message: "OTP sent successfully",
            email: user.email
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}

/* =========================
VERIFY EMAIL
========================= */

async function verifyEmail(req, res) {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await userModel.findOne({
            email,
            emailVerificationOTP: otp,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        await userModel.findOneAndUpdate(
            { email },
            {
                $set: { isVerified: true },
                $unset: {
                    emailVerificationOTP: "",
                    emailVerificationExpire: ""
                }
            }
        );

        return res.status(200).json({
            message: "Email Verified Successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}

/* =========================
RESEND VERIFICATION OTP
========================= */

async function resendOTP(req, res) {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await userModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    emailVerificationOTP: otp,
                    emailVerificationExpire: Date.now() + 10 * 60 * 1000
                }
            }
        );

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Email OTP",
            text: `Your OTP is ${otp}`
        });

        return res.status(200).json({
            message: "OTP Sent Successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}

/* =========================
LOGIN USER
========================= */

async function loginUser(req, res) {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User Not Found"
            });
        }

        if (user.isVerified===false) {
            return res.status(400).json({
                message: "Please verify your email first"
            });
        }
        

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login Successful",
            user: {
                email: user.email,
                _id: user._id,
                fullName: user.fullName
            }
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}

/* =========================
Logout
========================= */
async function logoutUser(req, res) {

    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });

    return res.status(200).json({
        message: "Logout Successful"
    });

}

/* =========================
FORGOT PASSWORD
========================= */

async function forgotPassword(req, res) {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await userModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    resetPasswordOTP: otp,
                    resetPasswordExpire: Date.now() + 10 * 60 * 1000
                }
            }
        );

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password OTP",
            text: `Your OTP is ${otp}`
        });

        return res.status(200).json({
            message: "OTP sent successfully",
            email
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}


/* =========================
VERIFY RESET OTP
========================= */

async function verifyResetOTP(req, res) {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await userModel.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        return res.status(200).json({
            message: "OTP Verified"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}

/* =========================
RESET PASSWORD
========================= */

async function resetPassword(req, res) {

    try {

        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const user = await userModel.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.findOneAndUpdate(
            { email },
            {
                $set: { password: hashedPassword },
                $unset: {
                    resetPasswordOTP: "",
                    resetPasswordExpire: ""
                }
            }
        );

        return res.status(200).json({
            message: "Password reset successful"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}

/* =========================
RESEND RESET OTP
========================= */

async function resendcode(req, res) {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await userModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    resetPasswordOTP: otp,
                    resetPasswordExpire: Date.now() + 10 * 60 * 1000
                }
            }
        );

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password OTP",
            text: `Your OTP is ${otp}`
        });

        return res.status(200).json({
            message: "OTP Sent Successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

}

// Activate account 
async function verifyaccount(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified === true) {
            return res.status(400).json({ message: "Account already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await userModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    emailVerificationOTP: otp,
                    emailVerificationExpire: Date.now() + 10 * 60 * 1000
                }
            }
        );

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}`
        });

        return res.status(200).json({
            message: "OTP sent for account verification",
            email
        });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
}

async function confirmAccount(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await userModel.findOne({
            email,
            emailVerificationOTP: otp,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        await userModel.findOneAndUpdate(
            { email },
            {
                $set: { isVerified: true },
                $unset: {
                    emailVerificationOTP: "",
                    emailVerificationExpire: ""
                }
            }
        );

        return res.status(200).json({
            message: "Account verified successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
}
/* =========================
EXPORTS
========================= */

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    resendOTP,
    resendcode,
    logoutUser,
    verifyaccount,
    confirmAccount
};