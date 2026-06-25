import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./VerifyEmail.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Backend URL from environment

const VerifyResetOTP = () => {


const [otp, setOtp] = useState("");

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

        toast.success(
            response.data.message
        );

        navigate(
            "/reset-password",
            {
                state: {
                    email
                }
            }
        );

    } catch (error) {

        toast.error(
            error.response?.data?.message ||
            "Invalid OTP"
        );

    }

};

return (

<div className="verify-box">
  <div className="otp-card">
    <h2>Verify Email</h2>

    <input
      type="text"
      placeholder="Enter your OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
    />

    <button onClick={submitHandler}>
      Submit OTP
    </button>
  </div>
</div>

    );


};

export default VerifyResetOTP;
