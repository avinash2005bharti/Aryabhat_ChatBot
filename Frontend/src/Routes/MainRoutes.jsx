import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import Settings from '../pages/Setting'
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
import VerifyResetOTP  from "../pages/VerifyResetOTP"
import ActivateAccount from "../pages/ActivateAccount"
import ConfirmAccount from "../pages/ConfirmAccount";

const  MainRoutes = () => {
  return(
  <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>
<Route
    path="/reset-password"
    element={<ResetPassword />}
/>

<Route
    path="/settings"
    element={<Settings />}
/>
<Route
    path="/verify-email"
    element={<VerifyEmail />}
/>
<Route
    path="/verify-reset-otp"
    element={<VerifyResetOTP />}
/>
<Route
    path="/activateaccount"
    element={<ActivateAccount />}
/>
<Route path="/confirm-account" element={<ConfirmAccount />} />
  </Routes>
  )
}

export default MainRoutes