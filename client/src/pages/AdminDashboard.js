import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 125,
    totalAssessments: 98,
    averageScore: 72,
    completionRate: 68
  });
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).token 
      : null;
      
    // Temporarily disable redirection for development
    // if (!token) {
    //   navigate('/login');
    // }
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
            <div className="dashboard-overview">
              <h2>Dashboard Overview</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
                
                <div className="stat-card">
                  <h3>Assessments Completed</h3>
                  <div className="stat-value">{stats.totalAssessments}</div>
                </div>
                
                <div className="stat-card">
                  <h3>Average Score</h3>
                  <div className="stat-value">{stats.averageScore}%</div>
                </div>
                
                <div className="stat-card">
                  <h3>Completion Rate</h3>
                  <div className="stat-value">{stats.completionRate}%</div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-time">Today, 10:45 AM</span>
                    <span className="activity-description">New user registered: John Smith</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">Yesterday, 3:20 PM</span>
                    <span className="activity-description">Assessment completed by Sarah Johnson</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">Yesterday, 11:15 AM</span>
                    <span className="activity-description">Question bank updated by Admin</span>
                  </div>
                </div>
              </div>
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