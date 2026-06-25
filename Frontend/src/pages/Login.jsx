import React from 'react'
import {useState }from 'react'
import { useNavigate,NavLink } from 'react-router-dom'
import axios from 'axios'
import './Login.css'
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Backend URL from environment

const Login = () => {
   const Navigate = useNavigate();
  const [email,Setemail] = useState("");
  const [password,Setpassword] = useState("");

  const submitHandler = (e) => {  
    e.preventDefault();
    axios.post(`${BACKEND_URL}/api/auth/login`, { email, password }
      ,{
        withCredentials: true
      }
    )
      .then((response) => {
                
            console.log(response.data);

            localStorage.setItem(
              "user",
              JSON.stringify(response.data.user)
            );
            toast.success("Login Successful");

            Navigate("/");
        })
      
      .catch((error) => {
        console.error("Login error:", error);
        toast.error("Invalid Email or Password");
      });
  }
  
  return (


   <div className="login-container">

  <div className="login-card">

    <h2>Welcome Back</h2>

    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => Setemail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => Setpassword(e.target.value)}
    />

    <button onClick={submitHandler}>
      Login
    </button>

    <p>
      Don't have an account?
      <NavLink to="/register">
        Sign Up
      </NavLink></p>
      <p>
      ForgotPassword?
      <NavLink to="/forgot-password">ForgotPassword</NavLink>
    </p>

  </div>

</div>
  )
}

export default Login