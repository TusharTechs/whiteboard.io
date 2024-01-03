import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface ChatProps {
  socket: Socket;
}

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
}

const Chat: React.FC<ChatProps> = ({ socket }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessage: Message = {
        id: socket.id,
        text: inputMessage,
        fromUser: true,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      socket.emit("send", inputMessage);

      setInputMessage("");
    }
  };

  useEffect(() => {
    const handleChatMessage = (data: { message: string; name: string }) => {
      const { message, name } = data;
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: uuidv4(), text: message, fromUser: socket.id === name },
      ]);
    };

    const handleUserJoined = (userName: string) => {
      const messageId = uuidv4();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: messageId,
          text: `${userName} joined the chat.`,
          fromUser: false,
        },
      ]);
    };

    const handleUserLeft = (userName: string) => {
      const messageId = uuidv4();
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: messageId, text: `${userName} left the chat.`, fromUser: false },
      ]);
    };

    socket.on("receive", handleChatMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("left", handleUserLeft);

    return () => {
      socket.off("receive", handleChatMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("left", handleUserLeft);
    };
  }, [socket]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="position-absolute bottom-0 right-0"
      style={{
        height: "300px",
        border: "1px solid #ccc",
        overflowY: "scroll",
        borderRadius: "10px",
      }}
      ref={chatBoxRef}
    >
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          style={{ padding: "5px", color: message.fromUser ? "blue" : "black" }}
        >
          {message.fromUser ? "You: " : "Other user: "} {message.text}
        </div>
      ))}
      <div className="d-flex justify-content-between align-items-center p-2">
        <input
          className="form-control me-2"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
