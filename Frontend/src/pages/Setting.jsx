import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Setting.css";

const BACKEND_URL = process.env.VITE_BACKEND_URL; // Backend URL from environment

const Settings = () => {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [avatar, setAvatar] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const response = await axios.get(
                `${BACKEND_URL}/api/setting/profile`,
                {
                    withCredentials: true
                }
            );

            const user = response.data;

            setFirstName(
                user.fullName?.firstName || ""
            );

            setLastName(
                user.fullName?.lastName || ""
            );

            setAvatar(
                user.avatar || ""
            );

        } catch (error) {

            console.log(error);

        }

    };

    const handleProfileUpdate = async () => {

        try {

            const response = await axios.put(
                `${BACKEND_URL}/api/setting/update-name`,
                {
                    firstName,
                    lastName
                },
                {
                    withCredentials: true
                }
            );

            toast.success(
                response.data.message
            );

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Profile Update Failed"
            );

        }

    };

    const handlePasswordUpdate = async () => {

        if (
            !currentPassword ||
            !newPassword
        ) {

            return toast.error(
                "Fill all fields"
            );

        }

        try {

            const response = await axios.put(
                `${BACKEND_URL}/api/setting/change-password`,
                {
                    currentPassword,
                    newPassword
                },
                {
                    withCredentials: true
                }
            );

            toast.success(
                response.data.message
            );

            setCurrentPassword("");
            setNewPassword("");

        } catch (error) {

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Password Update Failed"
            );

        }

    };

    const handleAvatarChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            toast.error(
                "Image must be less than 5MB"
            );

            return;

        }

        const imageUrl =
            URL.createObjectURL(file);

        setAvatar(imageUrl);

        toast.success(
            "Avatar Preview Updated"
        );

    };

    return (

        <div className="settings-page">

            <div className="settings-container">

                <h1 className="settings-title">
                    ⚙ Account Settings
                </h1>

                {/* Avatar */}

                <div className="settings-card">

                    <h3>
                        Profile Photo
                    </h3>

                    <div className="avatar-section">

                        <div className="settings-avatar">

                            {
                                avatar
                                ? (
                                    <img
                                        src={avatar}
                                        alt="avatar"
                                    />
                                )
                                : (
                                    firstName
                                        ?.charAt(0)
                                        ?.toUpperCase()
                                )
                            }

                        </div>

                        <div className="avatar-actions">

                            <label
                                htmlFor="avatar-upload"
                                className="upload-btn"
                            >
                                Change Photo
                            </label>

                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={
                                    handleAvatarChange
                                }
                            />

                            <p>
                                JPG, PNG up to 5MB
                            </p>

                        </div>

                    </div>

                </div>

                {/* Personal Information */}

                <div className="settings-card">

                    <h3>
                        Personal Information
                    </h3>

                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) =>
                            setFirstName(
                                e.target.value
                            )
                        }
                    />

                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) =>
                            setLastName(
                                e.target.value
                            )
                        }
                    />

                    <button
                        className="save-btn"
                        onClick={
                            handleProfileUpdate
                        }
                    >
                        Save Changes
                    </button>

                </div>

                {/* Change Password */}

                <div className="settings-card">

                    <h3>
                        Change Password
                    </h3>

                    <input
                        type="password"
                        placeholder="Current Password"
                        value={
                            currentPassword
                        }
                        onChange={(e) =>
                            setCurrentPassword(
                                e.target.value
                            )
                        }
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(
                                e.target.value
                            )
                        }
                    />

                    <button
                        className="save-btn"
                        onClick={
                            handlePasswordUpdate
                        }
                    >
                        Update Password
                    </button>

                </div>

            </div>

        </div>

    );

};

export default Settings;