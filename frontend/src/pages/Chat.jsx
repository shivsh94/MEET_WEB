import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [status, setStatus] = useState("Connecting...");
  const [pairedUserId, setPairedUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_SERVER, 
    { autoConnect: false }), []);


  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
      localStorage.setItem("socket", socket.id);
      setIsConnected(true);
      setStatus("Connected, waiting for a chat partner...");
    });

    socket.on('message received', (data) => {
      setReceivedMessages((prevMessages) => [
        ...prevMessages, 
        { text: data.text, sender: data.sender, isReceived: true }
      ]);
    });

    socket.on('status', (data) => {
      console.log("Status update:", data);
      setStatus(data.message);
      
      if (data.type === "unpaired") {
        setPairedUserId(null);
      }
    });

    socket.on('paired', (data) => {
      console.log("Paired with:", data);
      setPairedUserId(data.userId);
      setStatus(`You are now chatting with a partner`);
      // Clear previous messages when paired with new user
      setReceivedMessages([]);
    });

    socket.on('pair disconnected', (data) => {
      console.log("Pair disconnected:", data);
      setPairedUserId(null);
      setStatus(data.message);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setPairedUserId(null);
      setStatus("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    
    setReceivedMessages((prevMessages) => [
      ...prevMessages, 
      { text: message, sender: socket.id, isReceived: false }
    ]);
    
    socket.emit("message", message);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      
      <div className="py-6 bg-gray-800 shadow-lg">
        <h1 className="text-center text-blue-400 text-3xl font-bold tracking-wider">SOCKET.IO CHAT</h1>
        <div className="text-center text-gray-300 mt-2">
          <div className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {status}
        </div>
      </div>
      
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-4 h-full overflow-y-auto">
          <h2 className="text-gray-300 text-xl mb-4 border-b border-gray-700 pb-2">
            {pairedUserId ? "Chat Active" : "Waiting for partner..."}
          </h2>
          
          <div className="space-y-3">
            {receivedMessages.length === 0 ? (
              <p className="text-gray-500 text-center italic py-8">
                {pairedUserId 
                  ? "No messages yet. Start the conversation!" 
                  : "Waiting for a chat partner to be assigned..."}
              </p>
            ) : (
              receivedMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`rounded-lg p-3 shadow ${
                    msg.isReceived 
                      ? "bg-gray-700 text-white" 
                      : "bg-blue-600 text-white ml-auto"
                  }`}
                  style={{ maxWidth: "40%", marginLeft: msg.isReceived ? "0" : "auto" }}
                >
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
              placeholder={pairedUserId ? "Type your message here..." : "Waiting for a partner..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!pairedUserId}
            />
          </div>
          <button 
            type="submit"
            className={`font-bold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              pairedUserId 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!pairedUserId}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;