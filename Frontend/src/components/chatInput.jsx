import React, { useRef, useState } from "react";
import "./chatInput.css";

const ChatInput = ({ sendMessage }) => {

    const [message, setMessage] = useState("");

    const textareaRef = useRef(null);

    const handleChange = (e) => {

        setMessage(e.target.value);

        e.target.style.height = "45px";
        e.target.style.height = e.target.scrollHeight + "px";

    };

    const handleSubmit = () => {

        if (!message.trim()) return;

        sendMessage(message);

        setMessage("");

        textareaRef.current.style.height = "45px";

    };

    return (

        <div className="chat-input-container">

            <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Type a message..."
                value={message}
                onChange={handleChange}
                onKeyDown={(e) => {

                    if (e.key === "Enter" && !e.shiftKey) {

                        e.preventDefault();

                        handleSubmit();

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