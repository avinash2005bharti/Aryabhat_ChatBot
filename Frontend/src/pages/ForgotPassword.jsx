import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate,NavLink } from 'react-router-dom'
import "./ForgotPassword.css";

const BACKEND_URL = process.env.env.VITE_BACKEND_URL; // Backend URL from environment

const ForgotPassword = () => {

    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const submitHandler = async () => {

    try {

        const response = await axios.post(
            `${BACKEND_URL}/api/auth/forgot-password`,
            {
                email
            }
        );

        toast.success(
            response.data.message
        );

        navigate(
            "/verify-reset-otp",
            {
                state: {
                    email
                }
            }
        );

    } catch (error) {

        toast.error(
            error.response?.data?.message ||
            "Something went wrong"
        );

    }

};

    return (

        <div className="forgot-container">

            <div className="forgot-card">

                <h2>Forgot Password</h2>

                <p>
                    Enter your email and we'll send a reset link.
                </p>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <button onClick={submitHandler}>
                    Send Otp
                </button>

            </div>

        </div>

    );

};

export default ForgotPassword;