import React, { useEffect } from 'react'
import {Route,Routes,useNavigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import CodeEditor from './components/CodeEditor';
import Home from './components/Home';
import SharingWindow from './components/SharingWindow';
import Signup from './components/Signup';
import Login from "./components/Login"
const App = () => {
  const navigate = useNavigate();
  useEffect(()=>{
    navigate('/home')
  },[])
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/home/*' element={<Home/>}/>
        <Route path="/login" element = {<Login />}/>
        <Route path='/register' element={<Signup />} />
        <Route path='/code-editor' element={<CodeEditor/>}/>
        <Route path='/repos/:id' element={<CodeEditor />}/>
        <Route path='/repo/share/:id' element={<SharingWindow />}/>
      </Routes>
    </div>
  )
}

export default App
