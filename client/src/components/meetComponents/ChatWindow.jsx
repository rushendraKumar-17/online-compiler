import React from 'react'

const ChatWindow = ({props}) => {
    const {closeWindow,socket,roomId}  = props;
    const [messages,setMessages] = useState([]);
    socket.on("message", (message,time,sender) => {
        setMessages((prevMessages) => [...prevMessages, {message,time,sender}]);
    }
    );
    const sendMessage = (message) => {
        const time = new Date().toLocaleTimeString();
        socket.emit("message", message,time,"Me",roomId);
        setMessages((prevMessages) => [...prevMessages, {message,time,sender:"You"}]);
    }
  return (
    <div>
      <h1>In call messages</h1>
        <button onClick={closeWindow}>Close</button>
        <div>
            {messages.map((message, index) => (
                <div key={index}>
                    <strong>{message.sender}</strong>: {message.message} <span>{message.time}</span>
                </div>
            ))}

        </div>
        <input type="text" placeholder="Type a message" onKeyDown={(e) => {
            if (e.key === "Enter") {
                sendMessage(e.target.value);
                e.target.value = "";
            }
        }} />
    </div>
  )
}

export default ChatWindow
