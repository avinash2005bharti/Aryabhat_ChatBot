import React from "react";
import { toast } from "react-toastify";
import "./HistoryCard.css";

const HistoryCard = ({
    title,
    onClick,
    onDelete,
    active
}) => {

    return (

       <div
            className={`history-card ${active ? "active" : ""}`}
            onClick={onClick}
            >
            <div className="history-title">
                {title}
            </div>

            <button
                className="delete-btn"
                onClick={(e) => {
                e.stopPropagation();
                onDelete();
                toast.success("Chat deleted")
                }}
            >
                🗑️
            </button>
        </div>

    );

};

export default HistoryCard;