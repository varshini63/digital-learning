import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SideNav from './components/SideNav';
import Dashboard from './components/Dashboard';
import Material from './components/Material';
import VirtualLab from './components/VirtualLab';
import Practical from './components/Practical';
import Quiz from './components/Quiz';
import Summarize from './components/Summarize';
import Doubts from './components/Doubts';
import Home from './components/Home';
import './App.css';

// Static Profile Component
const StaticProfile = () => (
  <div className="profile-section">
    <h2>Welcome Learner...</h2>
    <p><strong>Name:</strong> P Abhi Varshini</p>
    <p><strong>Email:</strong> saiabhivarshini06@gmail.com</p>
    <p><strong>Dwelling Area:</strong> Hyderabad</p>
    <p><strong>Standard:</strong> 10</p>
    <p><strong>Medium:</strong> Telugu</p>
    <p><strong>Board:</strong> CBSE</p>
  </div>
);

// Navigation Bar Component
const NavBar = () => (
  <div className="navbar">
    <h1>Learning Platform</h1>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation Bar */}
        <NavBar />
        <SideNav />
        <div className="main-content with-sidenav">
          <Routes>
            <Route path="/" element={<StaticProfile />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/material" element={<Material />} />
            <Route
              path="/virtual-lab"
              element={
                <DndProvider backend={HTML5Backend}>
                  <VirtualLab />
                </DndProvider>
              }
            />
            <Route path="/practical" element={<Practical />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/summarize" element={<Summarize />} />
            <Route path="/doubts" element={<Doubts />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
