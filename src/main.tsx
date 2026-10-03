import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/landing.css'
import { installSelectOnFocus } from './lib/selectOnFocus'

installSelectOnFocus();

createRoot(document.getElementById("root")!).render(<App />);
