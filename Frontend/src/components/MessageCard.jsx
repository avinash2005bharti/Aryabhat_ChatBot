import React from 'react';
import './messageCard.css';
import MarkdownRenderer from "./MarkdownRenderer";

const MessageCard = ({ role,content, darkMode }) => {

  return (
   <div
    className={`
        message-card
        ${
            role === "user"
            ? (darkMode
                ? "user-card-dark"
                : "user-card")
            : (darkMode
                ? "ai-card-dark"
                : "ai-card")
        }
    `}
>
<MarkdownRenderer content={content} />
</div>
  );
};

export default MessageCard;