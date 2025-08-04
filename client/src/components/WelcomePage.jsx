import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { nanoid } from "nanoid";
import AppContext from "../context/Context";

const WelcomePage = () => {
  const { apiUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!meetingId) return;
    try {
      const response = await axios.get(`${apiUrl}/meet/${meetingId}`);
      if (response.status === 200) {
        navigate(`/meet/join/${meetingId}`);
      } else {
        setSnack({
          open: true,
          msg: "This meeting is not available.",
          severity: "error",
        });
      }
    } catch {
      setSnack({
        open: true,
        msg: "This meeting is not available.",
        severity: "error",
      });
    }
  };

  const handleStartMeeting = async () => {
    const newMeetingId = `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
    await navigator.clipboard.writeText(newMeetingId);
    setSnack({
      open: true,
      msg: "Meeting ID copied to clipboard!",
      severity: "success",
    });
    navigate(`/meet/${newMeetingId}?isInitiator=true`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e0ecfc, #f4f9ff)", // gradient background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 500, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome to <span style={{ color: "#1976d2" }}>Code Meet</span>
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Start or join a collaborative coding session effortlessly.
        </Typography>

        <form onSubmit={handleJoinMeeting}>
          <Stack spacing={2}>
            <TextField
              label="Enter Meeting ID"
              variant="outlined"
              fullWidth
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth size="large">
              Join Meeting
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>or</Divider>

        <Button
          onClick={handleStartMeeting}
          variant="outlined"
          fullWidth
          size="large"
          sx={{
            fontWeight: 600,
            bgcolor: "#fff",
            ":hover": {
              bgcolor: "#e3eafc",
              borderColor: "#1976d2",
            },
          }}
        >
          Start a New Meeting
        </Button>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WelcomePage;
