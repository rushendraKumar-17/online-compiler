import React from 'react'
import {Button} from "@mui/material";
import { Link, useNavigate } from 'react-router-dom';
// import {Link} from '@mui/material';
import {nanoid} from 'nanoid';
const WelcomePage = () => {
  const navigate = useNavigate();
  const handleStartMeeting = ()=>{
    const meetingId = nanoid(3)+"-"+nanoid(4)+"-"+nanoid(3);
    console.log(meetingId);
    console.log("Trying to start a meeting");
    navigate(`/meet/${meetingId}`);
  }
  return (
    <div className='p-4'>
      Welcome to Code meet, a collaborative coding tool.
      <br/>
      <Button onClick={handleStartMeeting}>Start a meeting</Button>
    </div>
  )
}

export default WelcomePage;
