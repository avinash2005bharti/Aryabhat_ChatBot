import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation,useNavigate } from "react-router-dom";
import './VerifyEmail.css'

const BACKEND_URL = process.env.VITE_BACKEND_URL; // Backend URL from environment

const VerifyEmail= () => {

const [otp,setOtp] = useState("");
const [loading, setLoading] = useState(false);
const [timer, setTimer] = useState(30);

const location = useLocation();
const navigate = useNavigate();

const email = location.state?.email;

const submitHandler = async () => {

    try{

        const response =
        await axios.post(

            `${BACKEND_URL}/api/auth/verify-email`,

            {
                email,
                otp
            }

        );

        toast.success(
            response.data.message
        );

        navigate("/login");

    }

    catch(error){

        toast.error(
            error.response?.data?.message
        );

    }

}

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
            `${BACKEND_URL}/api/auth/resend-otp`,
            {
                email
            }
        );

        toast.success(
            response.data.message
        );

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
}
export default VerifyEmail;