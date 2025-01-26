import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        

        {/* Main Content */}
        <main className="main-content">
          <h1>Welcome Learner...</h1>
          <div className="user-details">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Dwelling Area:</strong> {user.dwelling_area}</p>
            <p><strong>Standard:</strong> {user.standard}</p>
            <p><strong>Medium:</strong> {user.medium}</p>
            <p><strong>Board:</strong> {user.board}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
