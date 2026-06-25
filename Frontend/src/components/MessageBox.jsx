import React, { useEffect, useRef } from 'react';
import MessageCard from './MessageCard';
import './messageBox.css';

const MessageBox = ({messages, isTyping,darkMode}) =>  {
  const bottomRef = useRef(null);
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
        behavior: "smooth"
    });

}, [messages]);

  return (
    <div className="message-box-container">

      {
        messages.map((msg, index) => (

          <MessageCard
            key={index}
            role={msg.role}
            content={msg.content}
            darkMode={darkMode}
          />

        ))
      }
      <div ref={bottomRef}></div>
      {
        isTyping && (

            <div className="typing-indicator">
              🌍 Aryabhat is typing<span className="dots"></span>
            </div>
          )
        }

    </div>
  );
};

export default MessageBox;