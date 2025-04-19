import React, { useState,useContext,useEffect } from 'react';
import AppContext from '../context/Context';
import LoginRequired from './LoginRequired';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
const RepositoriesPage = ({props}) => {
  const {setNewRepoWindow} = props;
  const { user, apiUrl,sharedRepos } = useContext(AppContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [repos, setRepos] = useState([]);
  useEffect(() => {
    if (user) {
      axios.get(`${apiUrl}/repo`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      }).then(res => {
        console.log(res);
        setRepos(res.data);
      }).catch(e => console.log(e));
    }
  }, [user]);
  return (
    <div>
      {user ? 
      <div>
          Your Repositories:
          {repos.length > 0 ? (
            <div>
              {repos.map((repo) => (
                <Button variant='outlined' key={repo._id} onClick={() => navigate(`/repos/${repo._id}`)} className='border border-gray-900'>
                  {repo.name}
                </Button>
              ))}
            </div>
          ) : (
            <div>No repositories available</div>
          )}
           Shared Repositories:
          {sharedRepos.length > 0 ? (
            <div>
              {sharedRepos.map((repo) => (
                <Button variant='outlined' key={repo._id} onClick={() => navigate(`/repos/${repo._id}`)} className='border border-gray-900'>
                  {repo.name}
                </Button>
              ))}
            </div>
          ) : (
            <div>No repositories available</div>
          )}
          <Button variant='contained' style={{position:'absolute',right:10,bottom:10}} onClick={() => setNewRepoWindow(true)}>
            Create a new repo
          </Button>
        </div>:<LoginRequired />
}
        </div>
  )
}

export default RepositoriesPage
