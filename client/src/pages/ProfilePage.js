import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    demographics: {
      age: '',
      gender: '',
      location: ''
    },
    consentToResearch: false
  });
 
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    demographics: {
      age: '',
      gender: '',
      location: ''
    },
    consentToResearch: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const checkAuth = async () => {
      const userInfo = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null;
       
      if (!userInfo) {
        navigate('/login');
        return;
      }
     
      loadUserData();
    };
   
    checkAuth();
  }, [navigate]);
 
  const loadUserData = () => {
    // For development, use mock data
    setIsLoading(true);
   
    // Simulate API call
    setTimeout(() => {
      const mockUserData = {
        username: 'johndoe',
        email: 'john.doe@example.com',
        demographics: {
          age: '35',
          gender: 'Male',
          location: 'Melbourne, Australia'
        },
        consentToResearch: true
      };
     
      const mockAssessments = [
        { id: 1, date: '2024-04-10', score: 78, completed: true },
        { id: 2, date: '2024-04-15', score: 84, completed: true },
        { id: 3, date: '2024-04-20', score: null, completed: false }
      ];
     
      setUserData(mockUserData);
      setFormData({
        username: mockUserData.username,
        email: mockUserData.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        demographics: { ...mockUserData.demographics },
        consentToResearch: mockUserData.consentToResearch
      });
     
      setAssessments(mockAssessments);
      setIsLoading(false);
     
      // In a real app, you would fetch the user data like this:
      // const token = userInfo.token;
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // };
      // const { data } = await axios.get('/api/users/profile', config);
      // setUserData(data);
      // setFormData({
      //   username: data.username,
      //   email: data.email,
      //   currentPassword: '',
      //   newPassword: '',
      //   confirmPassword: '',
      //   demographics: { ...data.demographics },
      //   consentToResearch: data.consentToResearch
      // });
     
      // const assessmentsResponse = await axios.get('/api/assessments/user', config);
      // setAssessments(assessmentsResponse.data);
      // setIsLoading(false);
    }, 1000);
  };
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
   
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
   
    // Validate passwords if the user is trying to change them
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }
     
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Please enter your current password' });
        return;
      }
    }
   
    // Simulate API call
    setIsLoading(true);
   
    setTimeout(() => {
      // Update local state with form data
      setUserData({
        username: formData.username,
        email: formData.email,
        demographics: { ...formData.demographics },
        consentToResearch: formData.consentToResearch
      });
     
      setIsLoading(false);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
     
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
     
    }, 1000);
  };
 
  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing && (
            <button
              className="btn-primary edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
       
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
       
        {isEditing ? (
          <div className="profile-edit">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Account Information</h2>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
               
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
             
              <div className="form-section">
                <h2>Change Password</h2>
                <p className="form-note">Leave blank if you don't want to change your password</p>
               
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
               
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
               
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
             
              <div className="form-section">
                <h2>Demographics</h2>
                <p className="form-note">This information helps with research analytics (optional)</p>
               
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="text"
                    name="demographics.age"
                    value={formData.demographics.age}
                    onChange={handleChange}
                  />
                </div>
               
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="demographics.gender"
                    value={formData.demographics.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
               
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="demographics.location"
                    value={formData.demographics.location}
                    onChange={handleChange}
                  />
                </div>
               
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    name="consentToResearch"
                    checked={formData.consentToResearch}
                    onChange={handleChange}
                    id="consentToResearch"
                  />
                  <label htmlFor="consentToResearch">
                    I consent to my data being used for research purposes
                  </label>
                </div>
              </div>
             
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-details">
            <div className="profile-section">
              <h2>Account Information</h2>
              <div className="profile-field">
                <div className="field-label">Username:</div>
                <div className="field-value">{userData.username}</div>
              </div>
              <div className="profile-field">
                <div className="field-label">Email:</div>
                <div className="field-value">{userData.email}</div>
              </div>
            </div>
           
            <div className="profile-section">
              <h2>Demographics</h2>
              <div className="profile-field">
                <div className="field-label">Age:</div>
                <div className="field-value">{userData.demographics.age || 'Not provided'}</div>
              </div>
              <div className="profile-field">
                <div className="field-label">Gender:</div>
                <div className="field-value">{userData.demographics.gender || 'Not provided'}</div>
              </div>
              <div className="profile-field">
                <div className="field-label">Location:</div>
                <div className="field-value">{userData.demographics.location || 'Not provided'}</div>
              </div>
              <div className="profile-field">
                <div className="field-label">Research Consent:</div>
                <div className="field-value">
                  {userData.consentToResearch ? 'Provided' : 'Not provided'}
                </div>
              </div>
            </div>
           
            <div className="profile-section">
              <h2>Assessment History</h2>
              {assessments.length === 0 ? (
                <p>You haven't taken any assessments yet.</p>
              ) : (
                <div className="assessment-history">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map(assessment => (
                        <tr key={assessment.id}>
                          <td>{assessment.date}</td>
                          <td>
                            <span className={`status-badge ${assessment.completed ? 'completed' : 'incomplete'}`}>
                              {assessment.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td>{assessment.completed ? `${assessment.score}%` : '-'}</td>
                          <td>
                            <button
                              className="btn-link"
                              onClick={() => navigate(`/assessment/${assessment.id}`)}
                            >
                              {assessment.completed ? 'View Results' : 'Continue'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
             
              <button
                className="btn-secondary new-assessment-btn"
                onClick={() => navigate('/assessment')}
              >
                Start New Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;