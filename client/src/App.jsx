import React, { useEffect } from 'react'
import {Route,Routes,useNavigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import CodeEditor from './components/editorComponents/CodeEditor';
import Home from './components/Home';
import SharingWindow from './components/editorComponents/SharingWindow';
import Signup from './components/Signup';
import Login from "./components/Login"
import MeetingLandingPage from './components/meetComponents/MeetingLandingPage';
import Meeting from "./components/meetComponents/Meeting";
const App = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/home/*' element={<Home/>}/>
        <Route path="/login" element = {<Login />}/>
        <Route path='/register' element={<Signup />} />
        <Route path='/code-editor' element={<CodeEditor/>}/>
        <Route path='/repos/:id' element={<CodeEditor />}/>
        <Route path='/repo/share/code-editor/:id' element={<SharingWindow />}/>
        <Route path='/meet/' element={<MeetingLandingPage />}/>
        <Route path="/meet/:id" element={<Meeting />} />
      </Routes>
    </div>
  )
}

export default App
