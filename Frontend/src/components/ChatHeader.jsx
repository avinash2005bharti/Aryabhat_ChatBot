import "./chatHeader.css";

const ChatHeader = ({title,onNewChat,darkMode,setDarkMode}) => {


  return (

    <div className="chat-header-container">

      <h2 className="chat-title">
        {title || "New Chat"}
      </h2>

      <div className="header-actions">

        <button
          className="theme-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <button
          className="new-chat-icon-btn"
          onClick={onNewChat}
        >
          +
        </button>

      </div>

    </div>

  );
};

export default ChatHeader;