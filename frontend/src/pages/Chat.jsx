import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  
  const socket = useMemo(() => io('https://meet-web-8wo9.onrender.com/', 
    { autoConnect: false }), []);
  
  useEffect(() => {
    socket.connect();
    
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
      localStorage.setItem("socket", socket.id);
    });
    
    socket.on('message received', (data) => {
      // console.log("Received message:", data);  // Debugging log
      setReceivedMessages((prevMessages) => [...prevMessages, data]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    
    socket.emit("message", message);
    
    setMessage("");
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="py-6 bg-gray-800 shadow-lg">
        <h1 className="text-center text-blue-400 text-3xl font-bold tracking-wider">SOCKET.IO CHAT</h1>
      </div>
      
      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-4 h-full overflow-y-auto">
          <h2 className="text-gray-300 text-xl mb-4 border-b border-gray-700 pb-2">Messages</h2>
          
          <div className="space-y-3">
            {receivedMessages.length === 0 ? (
              <p className="text-gray-500 text-center italic py-8">No messages yet. Start the conversation!</p>
            ) : (
              receivedMessages.map((msg, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3 text-white shadow">
                  <p className="text-lg">{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Message Input Area */}
      <div className="bg-gray-800 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end gap-2">
          <div className="flex-grow">
            <label className="text-gray-300 text-sm mb-1 block">Message</label>
            <input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;