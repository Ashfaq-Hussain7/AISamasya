import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BlindPage from './components/Blind/BlindPage';
import DeafPage from './components/Deaf/DeafPage';
import SetSubject from './components/Blind/SetSubject';
import SubjectInfo from './components/Blind/SubjectInfo';
import CameraPage from '../src/components/Blind/CameraPage';
import DisplayImage from './components/Blind/DisplayImage';
import NoteMakingPage from './components/Blind/NoteMaking';
import Upload from './components/Blind/Doc/Upload'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/visual" element={<BlindPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/display" element={<DisplayImage />} />
        <Route path="/note-making" element={<NoteMakingPage />} />
        <Route path="/audial" element={<DeafPage />} />
        <Route path="/subject_b" element={<SetSubject />} />
        <Route path="/learn" element={<SubjectInfo />} />
        <Route path="/doc-summarizer" element={<Upload />} />

      </Routes>
    </Router>
  );
};

export default App;
