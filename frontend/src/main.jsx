import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from "./Home.jsx"
import Register from './Register.jsx';
import Login from './Login.jsx';
import { BrowserRouter, Routes, Route } from 'react-router';

export default function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
    
  )

};

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />)
