import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const BACKEND_URL = process.env.env.VITE_BACKEND_URL;

const ActivateAccount = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const submitHandler = async () => {
        if (!email) {
            toast.error("Email is required");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${BACKEND_URL}/api/auth/activateaccount`,
                { email }
            );

            toast.success(response.data.message);

            // 👉 go to OTP verify page
            navigate("/confirm-account", {
                state: { email }
            });

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">

                <h2>Activate Account</h2>

                <p>Enter your email to receive OTP</p>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={submitHandler}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send OTP"}
                </button>

            </div>
        </div>
    );
};

export default ActivateAccount;