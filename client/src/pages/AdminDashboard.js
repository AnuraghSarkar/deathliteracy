import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  QuestionCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

// Import separate components
import Dashboard from '../components/Dashboard'
import UserManagement from '../components/UserManagement';
import QuestionManagement from '../components/QuestionManagement';
import AssessmentResult from '../components/AssesmentResults';
// Temporarily keep DatabaseTest for debugging
import DatabaseTest from './DatabaseTest';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      message.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    message.success('Logged out successfully');
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: 'questions',
      icon: <QuestionCircleOutlined />,
      label: 'Question Management',
    },
    {
      key: 'assessments',
      icon: <BarChartOutlined />,
      label: 'Analytics & Reports',
    },
    {
      key: 'database-test',
      icon: <SettingOutlined />,
      label: 'Database Test',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'questions':
        return <QuestionManagement />;
      case 'assessments':
        return <AssessmentResult />;
      case 'database-test':
        return <DatabaseTest />;
      default:
        return <Dashboard />;
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // or loading spinner
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
        width={250}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          borderBottom: '1px solid #404040'
        }}>
          {collapsed ? 'DL' : 'Death Literacy Admin'}
        </div>
        
        <Menu
          theme="dark"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[activeTab]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => setActiveTab(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#1890ff' }}>
              {menuItems.find(item => item.key === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Welcome, <strong>{user.username}</strong></span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              danger
            >
              Logout
            </Button>
          </div>
        </Header>
        
        <Content style={{ 
          margin: 0, 
          padding: 0,
          background: '#f5f5f5',
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;