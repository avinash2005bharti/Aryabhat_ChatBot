const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        firstName:{
        type:String,
        required:true  
    },
    lastName:{
        type:String,
        required:true
    }
    },
    
    password:{
    type:String,
    required:true
    },

    resetPasswordToken:{
        type:String
    },

    resetPasswordExpire:{
        type:Date
    },
    emailVerificationOTP:{
    type:String
    },

    emailVerificationExpire:{
        type:Date
    },

    isVerified:{
        type:Boolean,
        default:false
    },

    forgotPasswordOTP:{
        type:String
    },
    resetPasswordOTP:{
        type:String
    },
    resetPasswordExpire:{
         type:Date
    },

    forgotPasswordExpire:{
        type:Date
    },
    avatar:{
    type:String,
    default:""
    }
    
},
    {
        timestamps:true
    }
);

const userModel = mongoose.model('User',userSchema);

module.exports = userModel;