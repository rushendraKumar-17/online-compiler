import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AppContext from '../context/Context';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RepositoriesPage = ({ props }) => {
  const { setNewRepoWindow } = props;
  const { user, apiUrl, sharedRepos,repos,setRepos } = useContext(AppContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  // const [repos, setRepos] = useState([]);

  useEffect(() => {
    if (user) {
      axios
        .get(`${apiUrl}/repo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setRepos(res.data);
        })
        .catch((e) => console.log(e));
    }
  }, [user]);

  return (
    <Container sx={{ mt: 2 }}>
      {/* <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}> */}
        <Typography variant="h5" gutterBottom>
          Your Repositories
        </Typography>
        {repos.length > 0 ? (
          <Grid container spacing={2} mb={4}>
            {repos.map((repo) => (
              <Grid item xs={12} sm={6} md={4} key={repo._id}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/repos/${repo._id}`)}
                >
                  {repo.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" mb={4}>
            No repositories available.
          </Typography>
        )}

        <Typography variant="h5" gutterBottom>
          Shared Repositories
        </Typography>
        {sharedRepos.length > 0 ? (
          <Grid container spacing={2}>
            {sharedRepos.map((repo) => (
              <Grid item xs={12} sm={6} md={4} key={repo._id}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/repos/${repo._id}`)}
                >
                  {repo.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No shared repositories available.
          </Typography>
        )}
      {/* </Paper> */}

      {/* Floating Create Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setNewRepoWindow(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default RepositoriesPage;
