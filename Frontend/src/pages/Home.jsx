import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/chatInput";
import MessageBox from "../components/MessageBox";
import UserProfile from "../components/UserProfile";
import HistoryCard from "../components/HistoryCard";

import socket from "../socketServer/soket.service";

import "./Home.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {

  /* =========================
      AUTH STATE (IMPORTANT FIX)
  ========================= */
  const [user, setUser] = useState(null);

  /* =========================
      UI STATE
  ========================= */
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  /* =========================
      CHAT STATE
  ========================= */
  const [chat, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatTitle, setActiveChatTitle] = useState("New Chat");
  const [chatTitle, setChatTitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();

  /* =========================
      INIT USER
  ========================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* =========================
      SOCKET CONNECT
  ========================= */
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  /* =========================
      SOCKET RESPONSE
  ========================= */
  useEffect(() => {
    const handleAIResponse = (data) => {
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
        },
      ]);
    };

    socket.on("ai-response", handleAIResponse);

    return () => {
      socket.off("ai-response", handleAIResponse);
    };
  }, []);

  /* =========================
      FETCH CHATS
  ========================= */
  const fetchChats = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/chat`, {
        withCredentials: true,
      });

      setChats(res.data.chats);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  /* =========================
      CREATE CHAT
  ========================= */
  const createChat = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chat/`,
        { title: chatTitle },
        { withCredentials: true }
      );

      setChats((prev) => [res.data.chat, ...prev]);
      setActiveChatId(res.data.chat._id);
      setActiveChatTitle(res.data.chat.title);
      setMessages([]);

      setChatTitle("");
      setShowPopup(false);

      toast.success("Chat created");
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
      OPEN CHAT
  ========================= */
  const openChat = async (chatId, title) => {
    try {
      setActiveChatId(chatId);
      setActiveChatTitle(title);

      const res = await axios.get(
        `${BACKEND_URL}/api/chat/${chatId}/messages`,
        { withCredentials: true }
      );

      setMessages(res.data.messages);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
      DELETE CHAT
  ========================= */
  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/chat/${chatId}`, {
        withCredentials: true,
      });

      setChats((prev) => prev.filter((c) => c._id !== chatId));

      if (activeChatId === chatId) {
        setActiveChatId(null);
        setActiveChatTitle("New Chat");
        setMessages([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
      SEND MESSAGE
  ========================= */
  const sendMessage = (message) => {
    if (!activeChatId) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    setIsTyping(true);

    socket.emit("ai-message", {
      chat: activeChatId,
      content: message,
    });
  };

  /* =========================
      LOGOUT (FIXED)
  ========================= */
  const handleLogout = () => {

    localStorage.clear();

    setUser(null);
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
    setActiveChatTitle("New Chat");

    socket.disconnect();

    navigate("/login", { replace: true });

    setTimeout(() => {
      toast.success("Logout successful");
    }, 100);
  };

  return (
    <div
      className={`home ${!showSidebar ? "collapsed" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
    >

      {/* Sidebar */}
      <div className={`side-bar ${!showSidebar ? "collapsed-sidebar" : ""}`}>

        {/* Chat History */}
        <div className="history-section">
          {chat.map((chatItem) => (
            <HistoryCard
              key={chatItem._id}
              title={chatItem.title}
              onClick={() => openChat(chatItem._id, chatItem.title)}
              onDelete={() => deleteChat(chatItem._id)}
              active={activeChatId === chatItem._id}
            />
          ))}
        </div>

        {/* User Profile */}
        <UserProfile />

        {/* Logout/Login */}
        {user ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button
            className="logout-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}

      </div>

      {/* Header */}
      <ChatHeader
        title={activeChatTitle}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNewChat={() => {
          if (!user) return toast.error("Login first");
          setShowPopup(true);
        }}
      />

      {/* Messages */}
      <MessageBox messages={messages} isTyping={isTyping} />

      {/* Input */}
      <ChatInput sendMessage={sendMessage} />

    </div>
  );
};

export default Home;