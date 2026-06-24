
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Nav.css'
const Nav = () => {
    const navigate = useNavigate();
    const homehandler = (e)=>{

    }
  return (
    <div className="top-home-btn">
        <button onClick={() => navigate("/")} className="home-btn">
        🏠
      </button>
    </div>
  )
}

export default Nav