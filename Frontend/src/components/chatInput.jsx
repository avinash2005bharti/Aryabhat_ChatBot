import React, { useState } from 'react';
import './chatInput.css';

const ChatInput = ({ sendMessage }) => {

  const [message, setMessage] = useState("");

  const handleSubmit = () => {

    if (!message.trim()) return;

    sendMessage(message);

    setMessage("");
  };

  return (
    <div className="chat-input-container">

      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {

          if (e.key === "Enter") {

            if (!message.trim()) return;

            sendMessage(message);

            setMessage("");
          }

        }}
      />

      <button onClick={handleSubmit}>
        Send
      </button>

    </div>
  );
};

export default ChatInput;