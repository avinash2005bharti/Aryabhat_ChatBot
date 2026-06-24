const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

/* =========================
UPDATE NAME
========================= */

async function updateName(req, res) {

    try {

        const { firstName, lastName } = req.body;

        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.fullName.firstName = firstName;
        user.fullName.lastName = lastName;

        await user.save();

        return res.status(200).json({
            message: "Name Updated Successfully",
            user
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

}

/* =========================
UPDATE AVATAR
========================= */

async function updateAvatar(req, res) {

    try {

        const { avatar } = req.body;

        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.avatar = avatar;

        await user.save();

        return res.status(200).json({
            message: "Avatar Updated Successfully",
            avatar: user.avatar
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

}

/* =========================
CHANGE PASSWORD
========================= */

async function changePassword(req,res){

    try{

        const {
            currentPassword,
            newPassword
        } = req.body;

        const user =
            await userModel.findById(
                req.user._id
            );

        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }

        const match =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if(!match){

            return res.status(400).json({
                message:"Current Password Incorrect"
            });

        }

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );

        await user.save();

        return res.status(200).json({
            message:"Password Changed Successfully"
        });

    }
    catch(error){

        console.log(error);

        return res.status(500).json({
            message:"Server Error"
        });

    }

}

/* =========================
GET USER PROFILE
========================= */

async function getProfile(req, res) {

    try {

        const user = await userModel.findById(req.user.id)
        .select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        return res.status(200).json(user);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

}

module.exports = {
    updateName,
    updateAvatar,
    changePassword,
    getProfile
};