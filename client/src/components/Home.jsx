import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Outlet, Routes, useNavigate,Route } from 'react-router-dom';
import AppContext from "../context/Context";
import Sidebar from "./Sidebar.jsx";
import RepositoriesPage from "./RepositoriesPage.jsx";
import LoginRequired from "./LoginRequired.jsx";
import WelcomePage from "./WelcomePage.jsx";
import TeammatesPage from './TeammatesPage.jsx';
import Invitations from "./Invitations.jsx";
const Home = () => {
  const navigate = useNavigate();
  const { user, apiUrl } = useContext(AppContext);
  const [repoName, setRepoName] = useState('');
  const [newRepoWindow, setNewRepoWindow] = useState(false);
  const token = localStorage.getItem('token');
  

  const handleCreateNewRepo = async (e) => {
    e.preventDefault();
    console.log(repoName);
    const response = await axios.post(`${apiUrl}/repo/new`, { name:repoName }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(response);
    if (response.status === 200) {
      setRepos([...repos, response.data]);
      setNewRepoWindow(false);
      setRepoName('');

    }

  };

  return (
    <div className='flex h-[100vh] z-10 w-[98vw]'>
      <Sidebar />
      <div className='w-full'>
      <Routes>
        <Route path='/' element={<WelcomePage />}/>
        <Route path='/repos' element={<RepositoriesPage props={{setNewRepoWindow}}/>}/>
        <Route path='/teammates' element={<TeammatesPage/> }/>
        <Route path='/invitations' element={<Invitations />} />
      </Routes>
      </div>
      <Outlet />

      {/* {user ? (
        <RepositoriesPage />
      ) : (
        <LoginRequired />
      )} */}
      {newRepoWindow && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-5 rounded shadow-lg">
            <h2 className="text-xl mb-4">Create New Repository</h2>
            <form onSubmit={handleCreateNewRepo}>
              <input
                type="text"
                placeholder="Repository Name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="border p-2 mb-4 w-full"
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setNewRepoWindow(false)}
                  className="border border-gray-900 px-4 py-2 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="border border-gray-900 px-4 py-2"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;