import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { toast } from "react-toastify";

const BACKEND_URL = process.env.env.VITE_BACKEND_URL;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log(response.data);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // ✅ backend message use
      toast.success(response.data.message);

      navigate("/");

    } catch (error) {
      console.error("Login error:", error);

      // ✅ backend error message use
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>Welcome Back</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={submitHandler}>
          Login
        </button>

        <p>
          Don't have an account?{" "}
          <NavLink to="/register">Sign Up</NavLink>
        </p>

        <p>
          Forgot Password?{" "}
          <NavLink to="/forgot-password">Click Here</NavLink>
        </p>

        <p>
          Verify Email?{" "}
          <NavLink to="/activateaccount">Activate Account</NavLink>
        </p>

      </div>
    </div>
  );
};

export default Login;