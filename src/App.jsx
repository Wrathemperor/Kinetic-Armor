import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/marketing/Landing';
import Dashboard from './pages/app/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
