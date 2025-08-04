import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { nanoid } from "nanoid";
import AppContext from "../context/Context";

const WelcomePage = () => {
  const { apiUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!meetingId) return;
    try {
      const response = await axios.get(`${apiUrl}/meet/${meetingId}`);
      if (response.status === 200) {
        navigate(`/meet/join/${meetingId}`);
      } else {
        setSnack({ open: true, msg: "This meeting is not available.", severity: "error" });
      }
    } catch {
      setSnack({ open: true, msg: "This meeting is not available.", severity: "error" });
    }
  };

  const handleStartMeeting = async () => {
    const newMeetingId = `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
    await navigator.clipboard.writeText(newMeetingId);
    setSnack({ open: true, msg: "Meeting ID copied to clipboard!", severity: "success" });
    navigate(`/meet/${newMeetingId}?isInitiator=true`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 540, width: "100%", mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Welcome to <span style={{ color: "#1976d2" }}>Code Meet</span>
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Collaborative coding made easy! <br />
        Join an existing room or start a new one:
      </Typography>
      <Stack component="form" onSubmit={handleJoinMeeting} direction="row" spacing={2} alignItems="center" mb={2}>
        <TextField
          label="Meeting ID"
          variant="outlined"
          size="small"
          name="meetingId"
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          sx={{ flexGrow: 1, bgcolor: "#f9f9fb" }}
          required
        />
        <Button type="submit" variant="contained" disableElevation sx={{ minWidth: 100 }}>
          Join
        </Button>
      </Stack>
      <Typography align="center" color="text.secondary" my={2}>
        or
      </Typography>
      <Button
        onClick={handleStartMeeting}
        variant="outlined"
        fullWidth
        sx={{
          fontWeight: 600,
          py: 1.2,
          bgcolor: "#f7f7fa",
          ":hover": { bgcolor: "#e3eafc" }
        }}
      >
        Start a meeting
      </Button>
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default WelcomePage;
