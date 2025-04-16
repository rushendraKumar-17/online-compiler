import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, TextField, Button, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ChatWindow = ({ closeChat, socket, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleMessage = (message, time, sender) => {
      setMessages(prev => [...prev, { message, time, sender }]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const time = new Date().toLocaleTimeString();
    socket.emit("message", message, time, "Me", roomId);
    setMessages(prev => [...prev, { message, time, sender: "You" }]);
    setMessage("");
  };

  return (
    <Box sx={{
      height: "100%",
      p: 2,
      border: "1px solid #ccc",
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">In Call Messages</Typography>
        <IconButton onClick={closeChat}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ my: 1 }} />

      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        mb: 2,
        maxHeight: "65vh",
        px: 1
      }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ my: 1 }}>
            <Typography variant="subtitle2" color="primary">
              {msg.sender}
            </Typography>
            <Typography variant="body2">{msg.message}</Typography>
            <Typography variant="caption" color="textSecondary">{msg.time}</Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={!message.trim()}>
          Send
        </Button>
      </form>
    </Box>
  );
};

export default ChatWindow;
