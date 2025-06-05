import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import axios from 'axios'
import '../styles/ProfilePage.css'  // ← Make sure this path matches where you put the CSS

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthContext()
  const navigate = useNavigate()

  // Local form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    demographics: {
      age: '',
      gender: '',
      location: ''
    },
    consentToResearch: false,
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Pre-fill form on mount (or redirect if not logged in)
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    setFormData({
      username: user.username,
      email: user.email,
      demographics: {
        age: user.demographics?.age || '',
        gender: user.demographics?.gender || '',
        location: user.demographics?.location || ''
      },
      consentToResearch: user.consentToResearch || false,
      password: '',
      confirmPassword: ''
    })
  }, [user, navigate])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'consentToResearch') {
      setFormData((prev) => ({ ...prev, consentToResearch: checked }))
    } else if (name.startsWith('demographics.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        demographics: { ...prev.demographics, [field]: value }
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Submit updated profile
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    // Password match validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords don't match.")
      setLoading(false)
      return
    }

    try {
      const token = user.token
      if (!token) throw new Error('No authorization token')

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }

      // Build payload
      const payload = {
        username: formData.username,
        email: formData.email,
        demographics: formData.demographics,
        consentToResearch: formData.consentToResearch
      }
      if (formData.password) payload.password = formData.password

      const { data: updatedUser } = await axios.put(
        '/api/users/profile',
        payload,
        config
      )

      // Update context & localStorage
      updateUser(updatedUser)

      setSuccessMsg('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      setErrorMsg(
        err.response?.data?.message ||
          'Failed to update profile. Please try again.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        {successMsg && <div className="message success">{successMsg}</div>}
        {errorMsg && <div className="message error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* --- Basic Info Section --- */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-note">
              Update your username, email, and password (leave password blank to keep current)
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                name="username"
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                name="password"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                name="confirmPassword"
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
              />
            </div>
          </div>

          {/* --- Demographics Section --- */}
          <div className="form-section">
            <h2>Demographics</h2>
            <div className="form-note">
              Help us tailor your experience by providing a few details
            </div>

            <div className="form-group">
              <label htmlFor="demographics.age">Age</label>
              <input
                name="demographics.age"
                id="demographics.age"
                type="number"
                min="0"
                value={formData.demographics.age}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="demographics.gender">Gender</label>
              <select
                name="demographics.gender"
                id="demographics.gender"
                value={formData.demographics.gender}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
                <option value="prefernot">Prefer not to say</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="demographics.location">Location</label>
              <input
                name="demographics.location"
                id="demographics.location"
                type="text"
                value={formData.demographics.location}
                onChange={handleChange}
                placeholder="e.g. Melbourne, Australia"
              />
            </div>
          </div>

          {/* --- Consent Section --- */}
          <div className="form-section">
            <h2>Research Consent</h2>
            <div className="checkbox-group">
              <input
                name="consentToResearch"
                id="consentToResearch"
                type="checkbox"
                checked={formData.consentToResearch}
                onChange={handleChange}
              />
              <label htmlFor="consentToResearch">
                I consent to my anonymised data being used for research purposes.
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
