import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./ResetPassword.css";

const ResetPassword = () => {


const [password, setPassword] = useState("");
const [confirmPassword, setconfirmPassword] = useState("")
const [isSame , setisSame] = useState(false)

const navigate = useNavigate();

const location = useLocation();

const email = location.state?.email;

const submitHandler = async () => {

    if(password === confirmPassword) setisSame(true)

    
        if(isSame==true){
         try {
        

        const response = await axios.post(
            "http://localhost:5000/api/auth/reset-password",
            {
                email,
                password
            }
        );

        toast.success(
            response.data.message
        );

        setTimeout(() => {

            navigate("/login");

        }, 1500);

    } catch (error) {

        toast.error(
            error.response?.data?.message ||
            "Reset Failed"
        );

    }
}

else {
    toast.error("password is not same")
}

};

return (

    <div className="reset-container">

        <div className="reset-card">

            <h2>Reset Password</h2>

            <p>
                Enter your new password
            </p>

            <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                    setconfirmPassword(e.target.value)
                }
            />

            <button onClick={submitHandler}>
                Reset Password
            </button>

        </div>

    </div>

);


};

export default ResetPassword;
