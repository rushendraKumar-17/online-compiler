import React, { useContext, useEffect } from 'react'
import {Route,Routes,useNavigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import CodeEditor from './components/editorComponents/CodeEditor';
import Home from './components/Home';
import SharingWindow from './components/editorComponents/SharingWindow';
import Signup from './components/Signup';
import Login from "./components/Login"
import MeetingLandingPage from './components/meetComponents/MeetingLandingPage';
import Meeting from "./components/meetComponents/Meeting";
import Editor from './components/meetComponents/Editor';
import EmailVerification from './components/EmailVerification';
import ProtectedRoute from './components/ProtectedRoute';
import { Alert, Snackbar } from '@mui/material';
import AppContext from './context/Context';
const App = () => {
  const navigate = useNavigate();
  const {open,setOpen,alertType,alertMessage} = useContext(AppContext);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div style={{overflow:'hidden'}}>
      <Navbar />
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
     
      <Routes>
        <Route path='*' element={<Home/>}/>
        <Route path='/home/*' element={<Home/>}/>
        <Route path="/login" element = {<Login />}/>
        <Route path='/register' element={<Signup />} />
        <Route path='/code-editor' element={<ProtectedRoute><CodeEditor/></ProtectedRoute>}/>
        <Route path='/repos/:id' element={<ProtectedRoute><CodeEditor /></ProtectedRoute>}/>
        <Route path='/repo/share/code-editor/:id' element={<SharingWindow />}/>
        <Route path='/meet/join/:id' element={<ProtectedRoute><MeetingLandingPage /></ProtectedRoute>}/>
        <Route path="/meet/:id" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />
        <Route path='/editor' element={<ProtectedRoute><Editor /></ProtectedRoute>}/>
        <Route path='/verify-email' element={<EmailVerification/>}/>
      </Routes>
    </div>
  )
}

export default App
