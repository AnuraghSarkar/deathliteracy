import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spin, Table, Tag, message } from 'antd';
import { DatabaseOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const DatabaseTest = () => {
  const { user } = useAuthContext();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState({
    connection: null,
    users: null,
    questions: null,
    categories: null,
    usersData: [],
    questionsData: [],
    categoriesData: []
  });

  const getAuthToken = () => {
    return user?.token || localStorage.getItem('adminToken');
  };

  const testDatabaseConnection = async () => {
    setTesting(true);
    const token = getAuthToken();
    
    if (!token) {
      message.error('No authentication token found');
      setTesting(false);
      return;
    }

    const testResults = {
      connection: null,
      users: null,
      questions: null,
      categories: null,
      usersData: [],
      questionsData: [],
      categoriesData: []
    };

    try {
      console.log('🔄 Testing database connections...');

      // Test 1: Users endpoint
      console.log('Testing users endpoint...');
      try {
        const usersResponse = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        testResults.users = {
          status: 'success',
          message: `Found ${usersResponse.data.users?.length || 0} users`,
          data: usersResponse.data
        };
        testResults.usersData = usersResponse.data.users || [];
        console.log('✅ Users endpoint working');
      } catch (error) {
        testResults.users = {
          status: 'error',
          message: error.response?.data?.message || error.message,
          error: error.response?.status || 'Network Error'
        };
        console.log('❌ Users endpoint failed:', error.message);
      }

      // Test 2: Questions endpoint
      console.log('Testing questions endpoint...');
      try {
        const questionsResponse = await axios.get('/api/admin/questions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        testResults.questions = {
          status: 'success',
          message: `Found ${questionsResponse.data.questions?.length || 0} questions`,
          data: questionsResponse.data
        };
        testResults.questionsData = questionsResponse.data.questions || [];
        console.log('✅ Questions endpoint working');
      } catch (error) {
        testResults.questions = {
          status: 'error',
          message: error.response?.data?.message || error.message,
          error: error.response?.status || 'Network Error'
        };
        console.log('❌ Questions endpoint failed:', error.message);
      }

      // Test 3: Categories endpoint
      console.log('Testing categories endpoint...');
      try {
        const categoriesResponse = await axios.get('/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        testResults.categories = {
          status: 'success',
          message: `Found ${categoriesResponse.data.categories?.length || 0} categories`,
          data: categoriesResponse.data
        };
        testResults.categoriesData = categoriesResponse.data.categories || [];
        console.log('✅ Categories endpoint working');
      } catch (error) {
        testResults.categories = {
          status: 'error',
          message: error.response?.data?.message || error.message,
          error: error.response?.status || 'Network Error'
        };
        console.log('❌ Categories endpoint failed:', error.message);
      }

      // Overall connection status
      const hasAnySuccess = testResults.users?.status === 'success' || 
                           testResults.questions?.status === 'success' || 
                           testResults.categories?.status === 'success';
      
      testResults.connection = {
        status: hasAnySuccess ? 'success' : 'error',
        message: hasAnySuccess ? 'Database connection established' : 'All endpoints failed'
      };

      setResults(testResults);
      
    } catch (error) {
      console.error('Database test failed:', error);
      setResults({
        ...testResults,
        connection: {
          status: 'error',
          message: 'Database connection test failed'
        }
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testDatabaseConnection();
  }, []);

  const renderStatus = (result) => {
    if (!result) return <Tag color="default">Not Tested</Tag>;
    
    return (
      <div>
        <Tag 
          color={result.status === 'success' ? 'green' : 'red'}
          icon={result.status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {result.status === 'success' ? 'Success' : 'Failed'}
        </Tag>
        <span style={{ marginLeft: 8 }}>{result.message}</span>
        {result.error && (
          <div style={{ color: 'red', fontSize: '12px', marginTop: 4 }}>
            Error {result.error}: {result.message}
          </div>
        )}
      </div>
    );
  };

  const userColumns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <Tag>{role}</Tag> },
    { title: 'Active', dataIndex: 'hasCompletedOnboarding', key: 'active', render: (val) => val ? '✅' : '❌' }
  ];

  const questionColumns = [
    { title: 'ID', dataIndex: 'questionId', key: 'questionId' },
    { title: 'Question', dataIndex: 'questionText', key: 'questionText', render: (text) => text?.substring(0, 50) + '...' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => <Tag>{type}</Tag> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (cat) => <Tag color="blue">{cat}</Tag> },
    { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (val) => val ? '✅' : '❌' }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DatabaseOutlined />
            Database Connection Test
          </div>
        }
        extra={
          <Button 
            type="primary" 
            onClick={testDatabaseConnection} 
            loading={testing}
            icon={<DatabaseOutlined />}
          >
            {testing ? 'Testing...' : 'Test Again'}
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        {testing ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Testing database connections...</p>
          </div>
        ) : (
          <div>
            <h3>Connection Status:</h3>
            <div style={{ marginBottom: 16 }}>
              <strong>Overall Connection: </strong>
              {renderStatus(results.connection)}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Users API: </strong>
              {renderStatus(results.users)}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Questions API: </strong>
              {renderStatus(results.questions)}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Categories API: </strong>
              {renderStatus(results.categories)}
            </div>

            {results.connection?.status === 'error' && (
              <Alert
                message="Database Connection Issues"
                description="Some or all database endpoints are not working. Check your server logs and ensure the backend routes are properly configured."
                type="error"
                style={{ marginTop: 16 }}
                showIcon
              />
            )}
          </div>
        )}
      </Card>

      {/* Users Data Preview */}
      {results.usersData.length > 0 && (
        <Card title={`Users Data (${results.usersData.length} records)`} style={{ marginBottom: 24 }}>
          <Table
            columns={userColumns}
            dataSource={results.usersData}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      )}

      {/* Questions Data Preview */}
      {results.questionsData.length > 0 && (
        <Card title={`Questions Data (${results.questionsData.length} records)`} style={{ marginBottom: 24 }}>
          <Table
            columns={questionColumns}
            dataSource={results.questionsData}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      )}

      {/* Categories Data Preview */}
      {results.categoriesData.length > 0 && (
        <Card title={`Categories Data (${results.categoriesData.length} records)`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {results.categoriesData.map((category, index) => (
              <Tag key={index} color="blue">{category}</Tag>
            ))}
          </div>
        </Card>
      )}

      {/* Debug Info */}
      <Card title="Debug Information" style={{ marginTop: 24 }}>
        <pre style={{ background: '#f6f6f6', padding: 16, borderRadius: 4, fontSize: 12 }}>
          {JSON.stringify({
            user: { username: user?.username, role: user?.role },
            token: !!getAuthToken(),
            endpoints: {
              users: results.users?.status,
              questions: results.questions?.status,
              categories: results.categories?.status
            }
          }, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

export default DatabaseTest;