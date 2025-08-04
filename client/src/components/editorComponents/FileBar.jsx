import React, { useContext, useState } from "react";
import axios from "axios";
import FileIcons from "./FileIcons";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import AppContext from "../../context/Context";

const FileBar = ({ props }) => {
  const {
    selectedFile,
    setSelectedFileFn,
    setSelectedFileContent,
    id,
    repo,
    fetchRepo,
    setLanguage,
    extensionMap,
    handleFileSelection,
  } = props;

  const [mainRepo, setMainRepo] = useState(false);
  const [fileName, setFileName] = useState("");
  const [newFileWindow, setNewFileWindow] = useState(false);

  const { apiUrl } = useContext(AppContext);
  const token = localStorage.getItem("token");

  const handleAddFile = (e) => {
    e.stopPropagation();
    setNewFileWindow(true);
  };

  const addFile = async () => {
    const file = fileName.trim().split(".");
    const fileExtension = file[file.length - 1];
    if (!fileName.trim() || !fileExtension) return;

    try {
      const res = await axios.post(
        `${apiUrl}/file/new`,
        { name: fileName, parent: id, type: fileExtension },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        fetchRepo();
      }
    } catch (e) {
      console.error("Error creating file:", e);
    }

    setNewFileWindow(false);
    setFileName("");
  };

  const handleFileClick = async (file) => {
    handleFileSelection(file);
  };

  return (
    <div>
      {repo && (
        <Box className="w-[15vw] flex flex-col h-[80vh] overflow-y-auto">
          <Box
            onClick={() => setMainRepo(!mainRepo)}
            className="flex justify-between items-center p-[1vw] bg-gray-100 dark:bg-gray-800"
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {repo.name}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleAddFile}
            >
              + Add
            </Button>
          </Box>

          {repo.map((file) => (
            <Box
              key={file._id}
              onClick={() => handleFileClick(file)}
              className={`p-2 border-b flex items-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition ${
                selectedFile?.name === file.name ? "bg-gray-400 dark:bg-gray-600" : ""
              }`}
            >
              <FileIcons extension={`.${file.type}`} /> &nbsp;
              <Typography>{file.name}</Typography>
            </Box>
          ))}

          {/* Create File Dialog */}
          <Dialog open={newFileWindow} onClose={() => setNewFileWindow(false)}>
            <DialogTitle>Create New File</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                margin="dense"
                label="File Name (with extension)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="example.js"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNewFileWindow(false)} color="secondary">
                Cancel
              </Button>
              <Button onClick={addFile} variant="contained">
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </div>
  );
};

export default FileBar;
