import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import './Nav.css';

const Nav = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const homeHandler = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      toast.error("No user logged in");
      navigate("/login", { replace: true });
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    navigate("/");
  };

  return (
    <div className="top-home-btn">
      <button onClick={homeHandler} className="home-btn">
        🏠
      </button>
    </div>
  );
};

export default Nav;