import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Terminal = ({props}) => {
  const { closeTerminal, output, execResult, progress } = props;
  const theme = useTheme();
  console.log(execResult);
  const isError = execResult?.error;
  const result = execResult?.result || "";
  const errorMessage = result.split(",")[1] || result;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "20vh",
        bgcolor: "#000",
        color: "#fff",
        zIndex: 10,
        px: 2,
        py: 1,
        borderTop: `1px solid ${theme.palette.grey[700]}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Terminal Output
        </Typography>
        <IconButton onClick={closeTerminal} size="small" sx={{ color: "red" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ bgcolor: theme.palette.grey[800], mb: 1 }} />

      <Box
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {progress ? (
          <Typography color="warning.main" fontStyle="italic">
            Compiling...
          </Typography>
        ) : isError ? (
          <>
            <Typography color="error.main">Compilation failed!!!</Typography>
            <Typography variant="body2" color="error.light">
              {errorMessage}
            </Typography>
          </>
        ) : (
          <>
            <Typography color="success.main">Compilation successful!!!</Typography>
            <Typography variant="body2" color="success.light">
              {result}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Terminal;
