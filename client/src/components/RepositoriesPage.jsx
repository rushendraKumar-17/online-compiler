import React, { useState,useContext,useEffect } from 'react';
import AppContext from '../context/Context';
import LoginRequired from './LoginRequired';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const RepositoriesPage = ({props}) => {
  const {setNewRepoWindow} = props;
  const { user, apiUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [repos, setRepos] = useState([]);
  useEffect(() => {
    console.log(user);
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
                <button key={repo._id} onClick={() => navigate(`/repos/${repo._id}`)} className='border border-gray-900'>
                  {repo.name}
                </button>
              ))}
            </div>
          ) : (
            <div>No repositories available</div>
          )}
          <button className='border border-black fixed bottom-5 right-5' onClick={() => setNewRepoWindow(true)}>
            Create a new repo
          </button>
        </div>:<LoginRequired />
}
        </div>
  )
}

export default RepositoriesPage
