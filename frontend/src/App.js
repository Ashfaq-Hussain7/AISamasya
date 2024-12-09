import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BlindPage from './components/Blind/BlindPage';
import DeafPage from './components/Deaf/DeafPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/visual" element={<BlindPage />} />
        <Route path="/audial" element={<DeafPage />} />
      </Routes>
    </Router>
  );
};

export default App;
