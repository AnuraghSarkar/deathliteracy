import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Space, Button } from 'antd';
import { 
  UserOutlined, 
  QuestionCircleOutlined, 
  BarChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalAssessments: 0,
    activeUsers: 0,
    recentUsers: [],
    recentAssessments: [],
    questionsByCategory: [],
    usersByRole: []
  });
  const [loading, setLoading] = useState(true);

  // Get token for API calls
  const getAuthToken = () => {
    return user?.token || localStorage.getItem('adminToken');
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      
      // Fetch multiple endpoints
      const [usersRes, questionsRes] = await Promise.all([
        axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/questions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        // Add assessment endpoint when available
        // axios.get('/api/admin/assessments', {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
      ]);

      const users = usersRes.data.users || [];
      const questions = questionsRes.data.questions || [];
      const assessments = []; // Will be populated when assessment API is ready

      // Calculate statistics
      const activeUsers = users.filter(u => u.hasCompletedOnboarding).length;
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Group questions by category
      const questionsByCategory = questions.reduce((acc, q) => {
        const category = q.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Group users by role
      const usersByRole = users.reduce((acc, u) => {
        const role = u.role || 'individual';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalUsers: users.length,
        totalQuestions: questions.length,
        totalAssessments: assessments.length,
        activeUsers,
        recentUsers,
        recentAssessments: assessments.slice(0, 5),
        questionsByCategory: Object.entries(questionsByCategory).map(([category, count]) => ({
          category,
          count,
          percentage: questions.length > 0 ? ((count / questions.length) * 100).toFixed(1) : 0
        })),
        usersByRole: Object.entries(usersByRole).map(([role, count]) => ({
          role,
          count,
          percentage: users.length > 0 ? ((count / users.length) * 100).toFixed(1) : 0
        }))
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Table columns for recent users
  const recentUsersColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          admin: 'red',
          researcher: 'blue',
          organization_admin: 'orange',
          individual: 'green'
        };
        return <Tag color={colors[role]}>{role}</Tag>;
      }
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Welcome back, {user?.username}!</h1>
        <p style={{ color: '#666', fontSize: 16 }}>
          Here's what's happening with your Death Literacy platform today.
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.totalUsers}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Questions"
              value={stats.totalQuestions}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Assessments"
              value={stats.totalAssessments}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Questions by Category */}
        <Col xs={24} lg={12}>
          <Card 
            title="Questions by Category" 
            extra={<Button size="small">View All</Button>}
          >
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {stats.questionsByCategory.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>No questions found</p>
              ) : (
                stats.questionsByCategory.map((item, index) => (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{item.category}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress 
                      percent={parseFloat(item.percentage)} 
                      showInfo={false} 
                      size="small"
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>

        {/* Users by Role */}
        <Col xs={24} lg={12}>
          <Card 
            title="Users by Role" 
            extra={<Button size="small">Manage Roles</Button>}
          >
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {stats.usersByRole.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>No users found</p>
              ) : (
                stats.usersByRole.map((item, index) => (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {item.role.replace('_', ' ')}
                      </span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress 
                      percent={parseFloat(item.percentage)} 
                      showInfo={false} 
                      size="small"
                      strokeColor={{
                        admin: '#ff4d4f',
                        researcher: '#1890ff',
                        organization_admin: '#fa8c16',
                        individual: '#52c41a'
                      }[item.role]}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card 
            title="Recent Users" 
            extra={
              <Space>
                <Button size="small">Export Data</Button>
                <Button type="primary" size="small">View All Users</Button>
              </Space>
            }
          >
            <Table
              columns={recentUsersColumns}
              dataSource={stats.recentUsers}
              rowKey="_id"
              pagination={false}
              loading={loading}
              size="small"
              locale={{ emptyText: 'No recent users' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card 
        title="Quick Actions" 
        style={{ marginTop: 16 }}
      >
        <Space wrap>
          <Button type="primary" icon={<UserOutlined />}>
            Add New User
          </Button>
          <Button icon={<QuestionCircleOutlined />}>
            Create Question
          </Button>
          <Button icon={<BarChartOutlined />}>
            Generate Report
          </Button>
          <Button icon={<ClockCircleOutlined />}>
            View Activity Log
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;