import React, { useContext,useState } from "react";
import { AppBar, Toolbar, Typography, Button, Paper, Divider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AppContext from "../context/Context";
import {CircleUser} from 'lucide-react'
const Navbar = () => {
  const { user,logout } = useContext(AppContext);
  const [profileOpen,setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = ()=>{
    navigate("/login");
    setProfileOpen(false);
    logout();
  }
  return (
    <>
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Link to="/"><Typography variant="h6">CodeMeet</Typography></Link>
        {user?.name ? (
          <Button onClick={()=>setProfileOpen(!profileOpen)}><Typography variant="body1"><CircleUser /></Typography></Button>
        ) : (
          <Button component={Link} to="/login" color="inherit">
            Login
          </Button>
        )}
      </Toolbar>
      </AppBar>

{
  profileOpen && (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: '60px', // Adjust according to your header height
        right: '16px',
        width: '260px',
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        boxShadow: 3,
        zIndex: 10,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {user?.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {user?.email}
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Button
        variant="outlined"
        fullWidth
        color="error"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Paper>
  )
}

  </>
  );
};

export default Navbar;
