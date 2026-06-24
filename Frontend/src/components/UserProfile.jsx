import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
    const Navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) {
        return (
            <div className="user-profile-card">
                Guest User
            </div>
        );
    }

    return (

        <div className="user-profile-card">

            <div className="avatar" onClick={()=>Navigate("/settings")}>
                {user.fullName.firstName[0]}
                
            </div>

            <div className="user-info">

                <h4>
                    {user.fullName.firstName}
                    {" "}
                    {user.fullName.lastName}
             <button
                className="settings-btn"
                onClick={() => Navigate("/settings")}
             >
                ⚙️
            </button>

                </h4>
                

                <p>
                    {user.email}
                </p>
                
             

            </div>

        </div>

    );
};

export default UserProfile;