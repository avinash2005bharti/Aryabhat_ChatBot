const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../services/mail.service');

/* =========================
REGISTER USER
========================= */

async function registerUser(req, res) {

   
    const {
        email,
        fullName: {
            firstName,
            lastName
        },
        password
    } = req.body;

    const isUserAlreadyExists =
        await userModel.findOne({ email });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

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

        emailVerificationExpire:
            Date.now() + 10 * 60 * 1000

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

}

/* =========================
VERIFY EMAIL
========================= */

async function verifyEmail(req, res) {

const { email, otp } = req.body;

const user = await userModel.findOne({

    email,

    emailVerificationOTP: otp,

    emailVerificationExpire: {
        $gt: Date.now()
    }

});

if (!user) {

    return res.status(400).json({
        message: "Invalid OTP"
    });

}

user.isVerified = true;

user.emailVerificationOTP = undefined;

user.emailVerificationExpire = undefined;

await user.save();

return res.status(200).json({
    message: "Email Verified Successfully"
});


}

// resend otp
async function resendOTP(req, res) {

    const { email } = req.body;

    const user = await userModel.findOne({
        email
    });

    if (!user) {

        return res.status(404).json({
            message: "User not found"
        });

    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    user.emailVerificationOTP = otp;

    user.emailVerificationExpire =
        Date.now() + 10 * 60 * 1000;

    await user.save();

    await transporter.sendMail({

        from: process.env.EMAIL,

        to: email,

        subject: "Aurora AI Verification OTP",

        text: `Your OTP is ${otp}`

    });

    return res.status(200).json({

        message: "OTP Sent Successfully"

    });

}

/* =========================
LOGIN USER
========================= */

async function loginUser(req, res) {

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email
    });

    if (!user) {
        return res.status(400).json({
            message: "User Not Found"
        });
    }

    if (!user.isVerified) {

    return res.status(400).json({
        message: "Please verify your email first"
    });

}

    // if (!user.isVerified) {
    //     return res.status(400).json({
    //         message: "Please verify your email first"
    //     });
    // }

    const isPasswordCorrect =
        await bcrypt.compare(
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

    res.cookie("token", token);

    return res.status(200).json({
        message: "Login Successful",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    });

}

/* =========================
FORGOT PASSWORD
========================= */

async function forgotPassword(req,res){

    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if(!user){
        return res.status(404).json({
            message:"User not found"
        });
    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    user.resetPasswordOTP = otp;

    user.resetPasswordExpire =
        Date.now() + 10 * 60 * 1000;

    await user.save();

    await transporter.sendMail({

        from: process.env.EMAIL,

        to: email,

        subject: "Reset Password OTP",

        text: `Your OTP is ${otp}`

    });

    return res.status(200).json({
        message:"OTP sent successfully",
        email
    });

}

/* =========================
verify resetpass otp
========================= */

async function verifyResetOTP(req,res){

    const { email, otp } = req.body;

    const user = await userModel.findOne({

        email,

        resetPasswordOTP: otp,

        resetPasswordExpire:{
            $gt: Date.now()
        }

    });

    if(!user){

        return res.status(400).json({
            message:"Invalid OTP"
        });

    }

    return res.status(200).json({
        message:"OTP Verified"
    });

}


/* =========================
RESET PASSWORD
========================= */

async function resetPassword(req,res){

    const { email,password } = req.body;

    const user =
        await userModel.findOne({ email });

    if(!user){

        return res.status(404).json({
            message:"User not found"
        });

    }

    const hashedPassword =
        await bcrypt.hash(password,10);

    user.password = hashedPassword;

    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
        message:"Password Reset Successful"
    });

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
resendOTP

};
