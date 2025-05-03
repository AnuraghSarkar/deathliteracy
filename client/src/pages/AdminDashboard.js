import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).token 
      : null;
      
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <div className="sidebar-menu">
          <button 
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="content-header">
          <h1>Death Literacy Assessment Administration</h1>
        </div>
        <div className="content-body">
          {activeTab === 'overview' && (
            <div>
              <h2>Dashboard Overview</h2>
              <p>Welcome to the admin dashboard. Select a tab from the sidebar to get started.</p>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <h2>User Management</h2>
              <p>User management features will be added here.</p>
            </div>
          )}
          
          {activeTab === 'questions' && (
            <div>
              <h2>Question Management</h2>
              <p>Question management features will be added here.</p>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div>
              <h2>Reports</h2>
              <p>Report generation features will be added here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;