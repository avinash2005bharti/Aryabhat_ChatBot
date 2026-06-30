import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./ResetPassword.css";

const BACKEND_URL = process.env.env.VITE_BACKEND_URL;

const ResetPassword = () => {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const otp = location.state?.otp; // ✅ otp lo state se

    const submitHandler = async () => {

        // ✅ Direct compare karo, state use mat karo
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!password || password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {

            const response = await axios.post(
                `${BACKEND_URL}/api/auth/reset-password`,
                {
                    email,
                    otp,      // ✅ otp bhi bhejo
                    password
                }
            );

            toast.success(response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Reset Failed"
            );

        }

    };

    return (

        <div className="reset-container">
            <div className="reset-card">

                <h2>Reset Password</h2>
                <p>Enter your new password</p>

                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button onClick={submitHandler}>
                    Reset Password
                </button>

            </div>
        </div>

    );

};

export default ResetPassword;