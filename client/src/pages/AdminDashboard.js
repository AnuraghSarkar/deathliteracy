import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 125,
    totalAssessments: 98,
    averageScore: 72,
    completionRate: 68,
  });

  // Add state for questions management
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "How confident are you in discussing end-of-life matters?",
      type: "scale",
      category: "Skills",
      options: 5,
    },
    {
      id: 2,
      text: "What is your age group?",
      type: "single_choice",
      category: "Demographics",
      options: 5,
    },
    {
      id: 3,
      text: "Have you ever experienced the death of a close family member?",
      type: "yes_no",
      category: "Experience",
      options: 2,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo")).token
      : null;

    // Temporarily disable redirection for development
    // if (!token) {
    // navigate('/login');
    // }
  }, [navigate]);

  // Filter questions based on search term and category
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || question.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <div className="sidebar-menu">
          <button
            className={`sidebar-item ${
              activeTab === "overview" ? "active" : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`sidebar-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`sidebar-item ${
              activeTab === "questions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
          <button
            className={`sidebar-item ${
              activeTab === "reports" ? "active" : ""
            }`}
            onClick={() => setActiveTab("reports")}
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
          {activeTab === "overview" && (
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
                    <span className="activity-description">
                      New user registered: John Smith
                    </span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">Yesterday, 3:20 PM</span>
                    <span className="activity-description">
                      Assessment completed by Sarah Johnson
                    </span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">Yesterday, 11:15 AM</span>
                    <span className="activity-description">
                      Question bank updated by Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h2>User Management</h2>
              <p>User management features will be added here.</p>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="questions-management">
              <div className="section-header">
                <h2>Question Management</h2>
                <button className="btn-primary">Add New Question</button>
              </div>

              <div className="filter-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-dropdown">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Demographics">Demographics</option>
                    <option value="Experience">Experience</option>
                    <option value="Skills">Skills</option>
                    <option value="Knowledge">Knowledge</option>
                  </select>
                </div>
              </div>

              <div className="questions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Options</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question) => (
                      <tr key={question.id}>
                        <td>{question.text}</td>
                        <td>{question.type}</td>
                        <td>{question.category}</td>
                        <td>{question.options}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-edit">Edit</button>
                            <button className="btn-delete">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
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
