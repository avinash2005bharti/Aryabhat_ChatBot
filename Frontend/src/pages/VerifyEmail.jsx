import React, { useState, } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation,useNavigate } from "react-router-dom";
import './VerifyEmail.css'

const VerifyEmail= () => {

const [otp,setOtp] = useState("");

const location = useLocation();
const navigate = useNavigate();

const email = location.state?.email;

const submitHandler = async () => {

    try{

        const response =
        await axios.post(

            "http://localhost:5000/api/auth/verify-email",

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
}
export default VerifyEmail;