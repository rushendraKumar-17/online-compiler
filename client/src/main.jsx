import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import { AppProvider } from './context/Context.jsx';
import { SocketProvider } from './context/SocketProvider.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
    <BrowserRouter>
    <SocketProvider>
    <App />
    </SocketProvider>
    </BrowserRouter>
    </AppProvider>
  </StrictMode>,
)
