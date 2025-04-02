import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import AppContext from "../context/Context";
import {CircleUser} from 'lucide-react'
const Navbar = () => {
  const { user } = useContext(AppContext);

  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Link to="/"><Typography variant="h6">CodeMeet</Typography></Link>
        {user?.name ? (
          <Button><Typography variant="body1"><CircleUser /></Typography></Button>
        ) : (
          <Button component={Link} to="/login" color="inherit">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
