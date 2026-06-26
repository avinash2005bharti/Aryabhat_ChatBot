import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./VerifyEmail.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const VerifyResetOTP = () => {

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const submitHandler = async () => {

        try {

            const response = await axios.post(
                `${BACKEND_URL}/api/auth/verify-reset-otp`,
                {
                    email,
                    otp
                }
            );

            toast.success(response.data.message);

            navigate("/reset-password", {
                state: {
                    email,
                    otp   // ✅ otp bhi bhejo ResetPassword ke liye
                }
            });

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Invalid OTP"
            );

        }

    };

    useEffect(() => {

        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);

    }, [timer]);

    const resendOTP = async () => {

        if (timer > 0) return;

        try {

            setLoading(true);

            const response = await axios.post(
                `${BACKEND_URL}/api/auth/resend-reset-otp`, // ✅ URL fix
                {
                    email
                }
            );

            toast.success(response.data.message);

            setTimer(30);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Failed to resend OTP"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="verify-box">
            <div className="otp-card">

                <h2>Verify OTP</h2>

                <input
                    type="text"
                    placeholder="Enter your OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />

                <button onClick={submitHandler}>
                    Submit OTP
                </button>

                <button
                    className="resend-btn"
                    onClick={resendOTP}
                    disabled={timer > 0 || loading}
                >
                    {
                        loading
                        ? "Sending..."
                        : timer > 0
                        ? `Resend OTP in ${timer}s`
                        : "Resend OTP"
                    }
                </button>

            </div>
        </div>

    );

};

export default VerifyResetOTP;