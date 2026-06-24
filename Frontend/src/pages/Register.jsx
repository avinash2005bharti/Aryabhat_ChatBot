import React from 'react'
import {useState }from 'react'
import { useNavigate,NavLink } from 'react-router-dom'
import { toast } from "react-toastify";
import axios from 'axios'
import './Register.css'

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName,setfirstName]= useState("");
  const [lastName, setlastName] = useState("");
  

  const submitHandler = (e) =>{
    e.preventDefault();
    axios.post("http://localhost:5000/api/auth/register", { 
        email : email,
        fullName:{
          firstName : firstName,
          lastName: lastName
        },
        password: password
    }
      ,{
        withCredentials: true
      }
    )
      .then((response) => {
        console.log(response.data);
        toast.success(
        response.data.message
     );

        navigate("/verify-email",
            {
                state:{
                    email: response.data.email
                }
            }
        );
      })
      .catch((error) => {
    console.log(error.response);
    console.log(error.response?.data);

    toast.error(
        error.response?.data?.message ||
        "Registration Failed"
    );
});
  }

  return (
   <div className="register-container">

    <div className="register-card">

        <h2>Create Account</h2>

        <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        <input
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setfirstName(e.target.value)}
        />

        <input
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setlastName(e.target.value)}
        />

        <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        

        <button onClick={submitHandler}>
            Register
        </button>

        <p>
            Already have an account?
            <NavLink to="/login">
                Sign In
            </NavLink>
        </p>

    </div>

</div>
  )
}

export default Register