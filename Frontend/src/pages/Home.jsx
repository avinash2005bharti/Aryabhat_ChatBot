
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/chatInput';
import MessageBox from '../components/MessageBox';
import UserProfile from '../components/UserProfile';
import HistoryCard from '../components/HistoryCard';

import socket from '../socketServer/soket.service';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Backend URL from environment

import './Home.css';

const Home = () => {

  /* =========================
      SIDEBAR STATE
  ========================= */
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  /* =========================
      LOGIN CHECK
      User exists in localStorage?
  ========================= */
  const isLoggedIn = !!localStorage.getItem("user");

  /* =========================
      POPUP STATE
      Used while creating chat
  ========================= */
  const [showPopup, setShowPopup] = useState(false);

  /* =========================
      CHAT TITLE INPUT
  ========================= */
  const [chatTitle, setChatTitle] = useState("");

  /* =========================
      ALL CHAT HISTORY
      Example:
      [
        {
          _id:"123",
          title:"React Notes"
        }
      ]
  ========================= */
  const [chat, setChats] = useState([]);

  /* =========================
      CURRENT CHAT MESSAGES
  ========================= */
  const [messages, setMessages] = useState([]);

  /* =========================
      ACTIVE CHAT ID
      Used while sending message
  ========================= */
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatTitle, setActiveChatTitle] = useState("New Chat");
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();


  /* ===================================================
      NEW CHAT BUTTON CLICK
  =================================================== */
  const handleNewChatClick = () => {

    const user = localStorage.getItem("user");

    if (!user) {
      toast.error("Please Login first")
      return;
    }
    setShowPopup(true);
    
  };

  /* ===================================================
      CREATE NEW CHAT
  =================================================== */
  const createChat = async () => {

    try {

      const response = await axios.post(
        `${BACKEND_URL}/api/chat/`,
        {
          title: chatTitle
        },
        {
          withCredentials: true
        }
      );

      console.log("Chat Created:", response.data);
      toast.success("Chat created Successfully")

      // Add new chat at top
      setChats(prev => [
        response.data.chat,
        ...prev
      ]);

      // Save current active chat id
      setActiveChatId(response.data.chat._id);
      

      setActiveChatTitle(response.data.chat.title);

      setMessages([]);

      // Clear old messages
      setMessages([]);

      // Close popup
      setShowPopup(false);

      // Clear title input
      setChatTitle("");

    } catch (error) {

      if (error.response?.status === 401) {
        alert("Please Login First");
      }

      console.error(error);
    }
  };

  

  /* ===================================================
      SOCKET CONNECTION
      Runs once when Home loads
  =================================================== */
  useEffect(() => {

    socket.connect();

    const handleConnect = () => {
      console.log("Socket Connected:", socket.id);
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };

  }, []);

  /* ===================================================
      SEND MESSAGE TO AI
  =================================================== */
  const sendMessage = (message) => {

    // No chat selected
    if (!activeChatId) {
      alert("Please Create A Chat First");
      return;
    }

    // Show user message instantly
    setMessages(prev => [
          ...prev,
          {
            role: "user",
            content: message
          }
        ]);

        setIsTyping(true);

      // Send to backend
      socket.emit("ai-message", {
        chat: activeChatId,
        content: message
      });

      console.log("Message Sent:", {
        chat: activeChatId,
        content: message
      });
  };

  /* ===================================================
      LISTEN FOR AI RESPONSE
  =================================================== */
useEffect(() => {

  const handleAIResponse = (data) => {

    console.log("AI Response:", data);
     setIsTyping(false);

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: data.content,
        chat: data.chat
      }
    ]);

  };

  socket.on("ai-response", handleAIResponse);

  return () => {
    socket.off("ai-response", handleAIResponse);
  };

}, []);

  /* ===================================================
      FETCH ALL CHATS
      Runs when page loads
  =================================================== */
  const fetchChats = async () => {

    try {

      const response = await axios.get(
        `${BACKEND_URL}/api/chat`,
        {
          withCredentials: true
        }
      );

      console.log("Fetched Chats:", response.data);

      setChats(response.data.chats);

    } catch (error) {

      console.error(error);

    }
  };

  /* ===================================================
      LOAD CHATS ON PAGE LOAD
  =================================================== */
  useEffect(() => {
    fetchChats();
  }, []);

  const messageLoader = async () =>{
    console.log("hello")
  }
  
  const openChat = async (chatId, title) => {

  try {

    setActiveChatId(chatId);

    setActiveChatTitle(title);
    

    const response = await axios.get(
      `${BACKEND_URL}/api/chat/${chatId}/messages`,
      {
        withCredentials: true
      }
    );

    setMessages(response.data.messages);

  } catch (error) {

    console.log(error);

  }

};

const deleteChat = async (chatId) => {

    const confirmDelete = window.confirm(
        "Delete this chat?"
    );

    if (!confirmDelete) return;

    try {

        await axios.delete(
            `${BACKEND_URL}/api/chat/${chatId}`,
            {
                withCredentials: true
            }
        );

        setChats(prev =>
            prev.filter(
                item => item._id !== chatId
            )
        );

        if (activeChatId === chatId) {

            setActiveChatId(null);

            setActiveChatTitle("New Chat");

            setMessages([]);
        }

    } catch (error) {

        console.log(error);

    }

};

  /* ===================================================
      LOGOUT
  =================================================== */
  const handleLogout = () => {

    // Remove local user data
    localStorage.removeItem("user");

    // Remove token cookie if accessible
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
    socket.disconnect();
    navigate("/");
    toast.success("User Logout successfully")
  };


useEffect(() => {

  const savedTheme =
    localStorage.getItem("theme");

  if(savedTheme === "dark"){
    setDarkMode(true);
  }

}, []);


useEffect(() => {

  localStorage.setItem(
    "theme",
    darkMode ? "dark" : "light"
  );

}, [darkMode]);

  
  return (
      <div
        className={`home
          ${!showSidebar ? "collapsed" : ""}
          ${darkMode ? "dark-mode" : ""}
        `}
      >

      {/* Sidebar Toggle Button */}
      <button
        className={`close-btn ${!showSidebar ? 'open-btn':''}`}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        ☰
      </button>

      {/* ================= SIDEBAR ================= */}
      {/* ================= SIDEBAR ================= */}
        <div
          className={`side-bar ${
            !showSidebar ? "collapsed-sidebar" : ""
          }`}
        >

          {/* Chat History */}
          <div className="history-section">
          {
            chat.map((chatItem) => (

              <HistoryCard
                key={chatItem._id}
                title={chatItem.title}
                onClick={() =>
                  openChat(
                    chatItem._id,
                    chatItem.title
                  )
                }
                onDelete={() =>
                  deleteChat(chatItem._id)
                }
                active={activeChatId === chatItem._id}
              />

            ))
          }
          </div>


          {/* User Profile */}
          <div className="profile-section">
            <UserProfile />
          </div>


          {/* Create Chat Popup */}
          {
             showPopup && (
              <div className="popup">

                <div className="popup-content">

                  <h3>✨ Create New Chat</h3>

                  <p className="popup-subtitle">
                    Give your conversation a name
                  </p>

                  <input
                    type="text"
                    placeholder="e.g. React Notes"
                    value={chatTitle}
                    onChange={(e) =>
                      setChatTitle(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        createChat();
                      }
                    }}
                  />

                  <div className="popup-buttons">

                    <button
                      className="cancel-btn"
                      onClick={() => setShowPopup(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="create-btn"
                      onClick={createChat}
                    >
                      Create Chat
                    </button>

                  </div>

                </div>

              </div>
            )
          }

          {/* Login / Logout Button */}
          {
            isLoggedIn ? (
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button
                className="logout-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )
          }

        </div>
      

      {/* Header */}
      <div className="chat-header">
        <ChatHeader
          title={activeChatTitle}
          onNewChat={handleNewChatClick}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>

      {/* Messages */}
      <div className="message-box">
        <MessageBox
          messages={messages}
          isTyping={isTyping}
          darkMode={darkMode}
        />
      </div>

      {/* Input */}
      <div className="chat-input">
        <ChatInput sendMessage={sendMessage} />
        
      </div>

    </div>
  );
};

export default Home;
