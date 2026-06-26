const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    // Email verification
    emailVerificationOTP: {
        type: String
    },
    emailVerificationExpire: {
        type: Date
    },

    // Password reset
    resetPasswordOTP: {
        type: String
    },
    resetPasswordExpire: {
        type: Date          // ✅ Only once now
    },

    avatar: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;