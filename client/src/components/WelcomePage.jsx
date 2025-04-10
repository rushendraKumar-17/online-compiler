import React from 'react'
import {Button} from "@mui/material";
import { Link } from 'react-router-dom';
// import {Link} from '@mui/material';
const WelcomePage = () => {
  const handleStartMeeting = ()=>{
    console.log("Trying to start a meeting");
  }
  return (
    <div className='p-4'>
      Welcome to Code meet, a collaborative coding tool.
      <br/>
      <Button><Link to="/meet">Start a meeting</Link></Button>
    </div>
  )
}

export default WelcomePage;
