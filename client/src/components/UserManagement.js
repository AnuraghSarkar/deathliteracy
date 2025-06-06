import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, message, Tag, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const { Option } = Select;

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // State for modal (create/update)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  const [form] = Form.useForm();

  // Get token from localStorage using the correct key from AuthContext
  const getAuthToken = () => {
    return user?.token || localStorage.getItem('adminToken') || sessionStorage.getItem('token');
  };

  // Configure axios defaults for authentication
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [user]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingTable(true);
    try {
      const token = getAuthToken();
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        logout();
        navigate('/login');
        return;
      }

      // Using the correct route based on server.js mounting
      const { data } = await axios.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        message.error('Unauthorized. Please log in again.');
        logout();
        navigate('/login');
      } else {
        message.error('Failed to load users.');
      }
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Columns for Ant Table
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleColors = {
          admin: 'red',
          researcher: 'blue',
          organization_admin: 'orange',
          individual: 'green'
        };
        return <Tag color={roleColors[role]}>{role.replace('_', ' ').toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Researcher', value: 'researcher' },
        { text: 'Organization Admin', value: 'organization_admin' },
        { text: 'Individual', value: 'individual' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Onboarded',
      dataIndex: 'hasCompletedOnboarding',
      key: 'hasCompletedOnboarding',
      render: (val) => (
        <Tag color={val ? 'green' : 'orange'}>
          {val ? 'Completed' : 'Pending'}
        </Tag>
      ),
      filters: [
        { text: 'Completed', value: true },
        { text: 'Pending', value: false },
      ],
      onFilter: (value, record) => record.hasCompletedOnboarding === value,
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_text, record) => {
        const isConfirmingDelete = deleteConfirmId === record._id;
        
        return (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => openEditModal(record)}
            >
              Edit
            </Button>
            
            {!isConfirmingDelete ? (
              <Button 
                type="link" 
                danger 
                size="small"
                onClick={() => setDeleteConfirmId(record._id)}
              >
                Delete
              </Button>
            ) : (
              <Space>
                <Button 
                  type="link" 
                  danger 
                  size="small"
                  onClick={() => {
                    handleDeleteUser(record._id);
                    setDeleteConfirmId(null);
                  }}
                >
                  ✓ Confirm
                </Button>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  ✗ Cancel
                </Button>
              </Space>
            )}
          </Space>
        );
      },
    },
  ];

  // Open "Create User" modal
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open "Edit User" modal
  const openEditModal = (userRecord) => {
    setModalMode('edit');
    setSelectedUser(userRecord);
    form.setFieldsValue({
      username: userRecord.username,
      email: userRecord.email,
      role: userRecord.role,
    });
    setIsModalOpen(true);
  };

  // Handle create or update form submission
  const onFinish = async (values) => {
    const token = getAuthToken();
    
    if (!token) {
      message.error('No authentication token found. Please log in again.');
      logout();
      navigate('/login');
      return;
    }

    if (modalMode === 'create') {
      try {
        // Using the correct route based on server.js mounting
        await axios.post('/api/admin/users', values, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        message.success('User created successfully');
        setIsModalOpen(false);
        fetchUsers();
      } catch (err) {
        console.error(err);
        message.error(err.response?.data?.message || 'Create user failed');
      }
    } else if (modalMode === 'edit' && selectedUser) {
      try {
        // Using the correct route based on server.js mounting
        await axios.put(`/api/admin/users/${selectedUser._id}`, values, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        message.success('User updated successfully');
        setIsModalOpen(false);
        fetchUsers();
      } catch (err) {
        console.error(err);
        message.error(err.response?.data?.message || 'Update user failed');
      }
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    const token = getAuthToken();
    
    if (!token) {
      message.error('No authentication token found. Please log in again.');
      logout();
      navigate('/login');
      return;
    }

    try {
      console.log('=== DELETE USER DEBUG ===');
      console.log('User ID to delete:', id);
      console.log('Token exists:', !!token);
      console.log('Current user:', user);
      
      // Using the correct route based on server.js mounting
      const response = await axios.delete(`/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Delete response:', response.data);
      message.success('User deleted successfully');
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('Delete error:', err);
      if (err.response?.status === 401) {
        message.error('Unauthorized. Please log in again.');
        logout();
        navigate('/login');
      } else {
        message.error(err.response?.data?.message || 'Delete user failed');
      }
    }
  };

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Space>
          <Button type="default">Export Users</Button>
          <Button type="primary" onClick={openCreateModal}>
            + Create New User
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={users}
        loading={loadingTable}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
        }}
        scroll={{ x: 1000 }}
      />

      {/* Create/Edit User Modal */}
      <Modal
        title={modalMode === 'create' ? 'Create New User' : 'Edit User'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? 'Create User' : 'Update User'}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
          onFinish={onFinish}
          initialValues={{ role: 'individual' }}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please enter a username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          {modalMode === 'create' && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password (min 6 characters)" />
            </Form.Item>
          )}

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select user role">
              <Option value="individual">Individual</Option>
              <Option value="organization_admin">Organization Admin</Option>
              <Option value="researcher">Researcher</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;