import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import adminService from "../services/adminService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    averageScore: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Questions management state
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    type: "single_choice",
    category: "Demographics",
    options: [
      { value: "", label: "" },
      { value: "", label: "" },
    ],
  });

  // Reports management state
  const [reportType, setReportType] = useState("summary");
  const [dateRange, setDateRange] = useState("last30days");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  // Users management state
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  useEffect(() => {
    // Check if user is authenticated
    const userInfo = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;

    // Temporarily disable redirection for development
    // if (!userInfo) {
    // navigate('/login');
    // }
    
    // Load initial data
    loadDashboardData();
    loadQuestions();
    loadUsers();
  }, [navigate]);

  // Load dashboard stats
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Try to get real data, fallback to mock data if API not yet implemented
      try {
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.log("Using mock dashboard data");
        // Use mock data as fallback
        setStats({
          totalUsers: 125,
          totalAssessments: 98,
          averageScore: 72,
          completionRate: 68,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load questions
  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getQuestions();
      
      // Transform API data to match component data structure
      const formattedQuestions = response.map(q => ({
        id: q._id,
        text: q.text,
        type: q.type,
        category: q.category,
        options: q.options.length,
      }));
      
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("Failed to load questions:", error);
      // Keep existing mock data if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers();
      
      // Transform API data to match component data structure
      const formattedUsers = response.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        joined: new Date(user.createdAt).toISOString().split('T')[0],
        assessments: user.assessments?.length || 0,
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
      // Keep existing mock data if API fails
      if (users.length === 0) {
        setUsers([
          {
            id: 1,
            username: "user1",
            email: "user1@example.com",
            role: "individual",
            joined: "2024-04-15",
            assessments: 3,
          },
          {
            id: 2,
            username: "researcher1",
            email: "researcher1@example.com",
            role: "researcher",
            joined: "2024-04-10",
            assessments: 1,
          },
          {
            id: 3,
            username: "admin",
            email: "admin@example.com",
            role: "admin",
            joined: "2024-04-01",
            assessments: 2,
          },
          {
            id: 4,
            username: "user2",
            email: "user2@example.com",
            role: "individual",
            joined: "2024-04-18",
            assessments: 0,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter questions based on search term and category
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || question.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole =
      userRoleFilter === "all" || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle showing the form for adding a new question
  const handleAddQuestion = () => {
    setCurrentQuestion(null);
    setFormData({
      text: "",
      type: "single_choice",
      category: "Demographics",
      options: [
        { value: "", label: "" },
        { value: "", label: "" },
      ],
    });
    setShowQuestionForm(true);
  };

  // Handle showing the form for editing an existing question
  const handleEditQuestion = async (question) => {
    setCurrentQuestion(question);
    try {
      // Fetch the full question details from the API
      const questionDetails = await adminService.getQuestionById(question.id);
      
      setFormData({
        text: questionDetails.text,
        type: questionDetails.type,
        category: questionDetails.category,
        options: questionDetails.options.length > 0 
          ? questionDetails.options 
          : [{ value: "", label: "" }, { value: "", label: "" }],
      });
    } catch (error) {
      console.error("Failed to fetch question details:", error);
      // Fallback to using the limited data from the list
      setFormData({
        text: question.text,
        type: question.type,
        category: question.category,
        options: Array(question.options)
          .fill()
          .map((_, i) => ({
            value: `option${i + 1}`,
            label: `Option ${i + 1}`,
          })),
      });
    }
    
    setShowQuestionForm(true);
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert options from form format to API format
      const formattedOptions = formData.options.map((opt, index) => ({
        value: opt.value || `option${index + 1}`,
        label: opt.label || `Option ${index + 1}`
      }));
      
      const questionData = {
        ...formData,
        options: formattedOptions
      };
      
      if (currentQuestion) {
        // Update existing question
        await adminService.updateQuestion(currentQuestion.id, questionData);
        
        // Update questions list
        setQuestions(questions.map((q) =>
          q.id === currentQuestion.id
            ? {
                ...q,
                text: formData.text,
                type: formData.type,
                category: formData.category,
                options: formData.options.length,
              }
            : q
        ));
      } else {
        // Add new question
        const newQuestion = await adminService.createQuestion(questionData);
        
        // Add to questions list
        setQuestions([...questions, {
          id: newQuestion._id,
          text: newQuestion.text,
          type: newQuestion.type,
          category: newQuestion.category,
          options: newQuestion.options.length,
        }]);
      }

      setShowQuestionForm(false);
    } catch (error) {
      alert(error.message || "An error occurred while saving the question");
    }
  };

  // Handle adding an option
  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { value: "", label: "" }],
    });
  };

  // Handle removing an option
  const handleRemoveOption = (index) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  // Handle option value/label change
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  // Handle deleting a question
  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await adminService.deleteQuestion(id);
        setQuestions(questions.filter((q) => q.id !== id));
      } catch (error) {
        alert(error.message || "Failed to delete question");
      }
    }
  };

  // Handle generating report
  const handleGenerateReport = async () => {
    setGeneratingReport(true);

    try {
      const report = await adminService.generateReport(reportType, dateRange);
      setGeneratedReport(report);
    } catch (error) {
      console.error("Failed to generate report:", error);
      // Fallback to mock data
      const mockReport = {
        type: reportType,
        dateRange: dateRange,
        generatedAt: new Date().toLocaleString(),
        data: {
          totalParticipants: 98,
          averageScore: 72,
          demographicBreakdown: {
            "18-30": 22,
            "31-45": 35,
            "46-60": 28,
            "61+": 13,
          },
          scoreDistribution: {
            "Low (0-40%)": 15,
            "Medium (41-70%)": 38,
            "High (71-100%)": 45,
          },
          topStrengthAreas: [
            "Understanding grief processes",
            "Knowledge of funeral planning",
            "Comfort discussing death",
          ],
          improvementAreas: [
            "Legal aspects of end-of-life planning",
            "Palliative care options",
            "Supporting others through bereavement",
          ],
        },
      };
      setGeneratedReport(mockReport);
    } finally {
      setGeneratingReport(false);
    }
  };

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
          {isLoading && <div className="loading-indicator">Loading data...</div>}
          
          {error && <div className="error-message">{error}</div>}
          
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
            <div className="users-management">
              <div className="section-header">
                <h2>User Management</h2>
                <button className="btn-primary">Add New User</button>
              </div>

              <div className="filter-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-dropdown">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="individual">Individual</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                      <th>Assessments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </span>
                        </td>
                        <td>{user.joined}</td>
                        <td>{user.assessments}</td>
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

          {activeTab === "questions" && (
            <div className="questions-management">
              <div className="section-header">
                <h2>Question Management</h2>
                <button className="btn-primary" onClick={handleAddQuestion}>
                  Add New Question
                </button>
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
                {questions.length === 0 ? (
                  <div className="no-data-message">No questions found. Add your first question!</div>
                ) : (
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
                              <button
                                className="btn-edit"
                                onClick={() => handleEditQuestion(question)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="reports-management">
              <div className="section-header">
                <h2>Reports</h2>
              </div>

              <div className="report-options">
                <div className="form-group">
                  <label>Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="summary">Summary Report</option>
                    <option value="detailed">Detailed Analysis</option>
                    <option value="demographics">Demographics Report</option>
                    <option value="responses">Individual Responses</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                    <option value="alltime">All Time</option>
                  </select>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? "Generating..." : "Generate Report"}
                </button>
              </div>

              {generatedReport && (
                <div className="generated-report">
                  <div className="report-header">
                    <h3>
                      {generatedReport.type === "summary"
                        ? "Summary Report"
                        : generatedReport.type === "detailed"
                        ? "Detailed Analysis"
                        : generatedReport.type === "demographics"
                        ? "Demographics Report"
                        : "Individual Responses"}
                    </h3>
                    <p>Generated on: {generatedReport.generatedAt}</p>
                    <p>
                      Date Range:{" "}
                      {generatedReport.dateRange === "last7days"
                        ? "Last 7 Days"
                        : generatedReport.dateRange === "last30days"
                        ? "Last 30 Days"
                        : generatedReport.dateRange === "last90days"
                        ? "Last 90 Days"
                        : "All Time"}
                    </p>
                  </div>

                  <div className="report-content">
                    <div className="report-section">
                      <h4>Participation Overview</h4>
                      <div className="stat-row">
                        <div className="stat-item">
                          <span className="stat-label">Total Participants</span>
                          <span className="stat-value">
                            {generatedReport.data.totalParticipants}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Average Score</span>
                          <span className="stat-value">
                            {generatedReport.data.averageScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="report-section">
                      <h4>Demographic Breakdown</h4>
                      <div className="chart-placeholder">
                        {Object.entries(
                          generatedReport.data.demographicBreakdown
                        ).map(([age, count]) => (
                          <div className="chart-bar" key={age}>
                            <span className="bar-label">{age}</span>
                            <div className="bar" style={{ width: `${count}%` }}>
                              <span className="bar-value">{count}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="report-section">
                      <h4>Score Distribution</h4>
                      <div className="chart-placeholder">
                        {Object.entries(
                          generatedReport.data.scoreDistribution
                        ).map(([level, percentage]) => (
                          <div className="chart-bar" key={level}>
                            <span className="bar-label">{level}</span>
                            <div
                              className="bar"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="bar-value">{percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="report-section split">
                      <div className="section-half">
                        <h4>Top Strength Areas</h4>
                        <ul>
                          {generatedReport.data.topStrengthAreas.map(
                            (area, index) => (
                              <li key={index}>{area}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div className="section-half">
                        <h4>Areas for Improvement</h4>
                        <ul>
                          {generatedReport.data.improvementAreas.map(
                            (area, index) => (
                              <li key={index}>{area}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="report-actions">
                    <button className="btn-secondary">Download PDF</button>
                    <button className="btn-secondary">Download CSV</button>
                    <button className="btn-secondary">Print</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentQuestion ? "Edit Question" : "Add New Question"}</h3>
              <button
                className="close-button"
                onClick={() => setShowQuestionForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Question Text</label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Question Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="single_choice">Single Choice</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="scale">Scale</option>
                  <option value="yes_no">Yes/No</option>
                  <option value="text">Text Entry</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="Demographics">Demographics</option>
                  <option value="Experience">Experience</option>
                  <option value="Skills">Skills</option>
                  <option value="Knowledge">Knowledge</option>
                </select>
              </div>

              {(formData.type === "single_choice" ||
                formData.type === "multiple_choice" ||
                formData.type === "scale") && (
                <div className="form-group">
                  <label>Options</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="text"
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) =>
                          handleOptionChange(index, "value", e.target.value)
                        }required
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) =>
                          handleOptionChange(index, "label", e.target.value)
                        }
                        required
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          className="btn-remove-option"
                          onClick={() => handleRemoveOption(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddOption}
                  >
                    Add Option
                  </button>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowQuestionForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {currentQuestion ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;