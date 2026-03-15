import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { LangProvider } from './context/LangContext.jsx'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <LangProvider>
        <App />
      </LangProvider>
    </UserProvider>
  </StrictMode>
);