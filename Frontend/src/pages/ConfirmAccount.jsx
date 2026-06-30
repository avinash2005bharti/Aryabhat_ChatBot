import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const BACKEND_URL = process.env.env.VITE_BACKEND_URL;

const ConfirmAccount = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const submitHandler = async () => {
        if (!otp) {
            toast.error("OTP is required");
            return;
        }

        if (!email) {
            toast.error("Email missing, please try again");
            navigate("/activate-account");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${BACKEND_URL}/api/auth/confirmaccount`,
                {
                    email,
                    otp
                }
            );

            toast.success(response.data.message);

            // after success → login page
            navigate("/login");

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Invalid or expired OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">

                <h2>Verify Account</h2>

                <p>Enter OTP sent to your email</p>

                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />

                <button
                    onClick={submitHandler}
                    disabled={loading}
                >
                    {loading ? "Verifying..." : "Verify Account"}
                </button>

            </div>
        </div>
    );
};

export default ConfirmAccount;