import React, { useContext } from "react";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// import {Link} from '@mui/material';
import { nanoid } from "nanoid";
import AppContext from "../context/Context";
const WelcomePage = () => {
  const {apiUrl} = useContext(AppContext);
  const navigate = useNavigate();

  const handleJoinMeeting = async (e) => {
    e.preventDefault();

    const meetingId = e.target.meetingId.value;
    if (meetingId != "") {
      const response = await axios.get(
        `${apiUrl}/meet/${meetingId}`
      );
      console.log(response);
      if (response.status == 200) {
        navigate(`/meet/join/${meetingId}`);
      } else {
        alert("This meeting is not available");
      }
    }
  };
  const handleStartMeeting = async() => {
    const meetingId = nanoid(3) + "-" + nanoid(4) + "-" + nanoid(3);
    console.log(meetingId);
    await navigator.clipboard.writeText(meetingId);
    console.log("Trying to start a meeting");
    navigate(`/meet/${meetingId}?isInitiator=true`);
  };
  return (
    <div className="p-4">
      Welcome to Code meet, a collaborative coding tool.
      <br />
      <div>
        <form onSubmit={handleJoinMeeting}>
          <input type="text" placeholder="Enter meeting id" name="meetingId" />{" "}
          <Button type="submit">Join meeting</Button>
        </form>
      </div>
      <Button onClick={handleStartMeeting}>Start a meeting</Button>
    </div>
  );
};

export default WelcomePage;
