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
  // Questions management state
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
  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    // In a real app, you would fetch the full question details here
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
    setShowQuestionForm(true);
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentQuestion) {
      // Update existing question
      const updatedQuestions = questions.map((q) =>
        q.id === currentQuestion.id
          ? {
              ...formData,
              id: currentQuestion.id,
              options: formData.options.length,
            }
          : q
      );
      setQuestions(updatedQuestions);
    } else {
      // Add new question
      const newQuestion = {
        ...formData,
        id: questions.length + 1,
        options: formData.options.length,
      };
      setQuestions([...questions, newQuestion]);
    }
    setShowQuestionForm(false);
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
  const handleDeleteQuestion = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((q) => q.id !== id));
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
                        }
                        required
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
