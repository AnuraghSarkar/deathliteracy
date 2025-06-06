import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, message, Tag, Space, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

const QuestionManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [form] = Form.useForm();

  // Get token from localStorage
  const getAuthToken = () => {
    return user?.token || localStorage.getItem('adminToken') || sessionStorage.getItem('token');
  };

  // Fetch all questions
  const fetchQuestions = async () => {
    setLoadingTable(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        logout();
        navigate('/login');
        return;
      }

      const { data } = await axios.get('/api/admin/questions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        message.error('Unauthorized. Please log in again.');
        logout();
        navigate('/login');
      } else {
        message.error('Failed to load questions.');
      }
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch categories for the select dropdown
  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      const { data } = await axios.get('/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      // Set some default categories if API fails
      setCategories([
        'Death Anxiety',
        'Grief Understanding', 
        'Cultural Perspectives',
        'End-of-Life Planning',
        'Bereavement Support',
        'Medical Knowledge',
        'Spiritual Beliefs'
      ]);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      message.error('Access denied.');
      navigate('/');
      return;
    }
    
    fetchQuestions();
    fetchCategories();
  }, [user]);

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'questionId',
      key: 'questionId',
      width: '10%',
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '35%',
      render: (text) => (
        <div style={{ 
          maxWidth: '300px', 
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          {text?.length > 100 ? `${text.substring(0, 100)}...` : text}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '12%',
      render: (type) => {
        const typeColors = {
          'single_choice': 'blue',
          'multiple_choice': 'blue',
          'boolean': 'green',
          'true_false': 'green',
          'scale': 'orange',
          'likert_5': 'orange',
          'text': 'purple',
          'multiselect': 'cyan',
          'grid': 'magenta'
        };
        const displayType = type?.replace('_', ' ').toUpperCase();
        return <Tag color={typeColors[type] || 'default'}>{displayType}</Tag>;
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '18%',
      render: (category) => <Tag color="cyan">{category}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '10%',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
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
                    handleDeleteQuestion(record._id);
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

  // Open create modal
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedQuestion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (questionRecord) => {
    setModalMode('edit');
    setSelectedQuestion(questionRecord);
    form.setFieldsValue({
      questionText: questionRecord.questionText,
      type: questionRecord.type,
      category: questionRecord.category,
      subcategory: questionRecord.subcategory,
      options: questionRecord.options?.map(opt => opt.label || opt).join('\n') || '',
      correctAnswer: questionRecord.correctAnswer,
      isActive: questionRecord.isActive,
      points: questionRecord.points || 1,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const onFinish = async (values) => {
    const token = getAuthToken();
    
    if (!token) {
      message.error('No authentication token found. Please log in again.');
      logout();
      navigate('/login');
      return;
    }

    // Process form data
    const questionData = {
      ...values,
      options: values.options ? values.options.split('\n').filter(opt => opt.trim()) : [],
    };

    try {
      if (modalMode === 'create') {
        await axios.post('/api/admin/questions', questionData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        message.success('Question created successfully');
      } else if (modalMode === 'edit' && selectedQuestion) {
        await axios.put(`/api/admin/questions/${selectedQuestion._id}`, questionData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        message.success('Question updated successfully');
      }
      
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || `${modalMode === 'create' ? 'Create' : 'Update'} question failed`);
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (id) => {
    const token = getAuthToken();
    
    if (!token) {
      message.error('No authentication token found. Please log in again.');
      logout();
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`/api/admin/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      message.success('Question deleted successfully');
      fetchQuestions();
    } catch (err) {
      console.error('Delete error:', err);
      if (err.response?.status === 401) {
        message.error('Unauthorized. Please log in again.');
        logout();
        navigate('/login');
      } else {
        message.error(err.response?.data?.message || 'Delete question failed');
      }
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Question Management</h1>
        <Space>
          <Button type="default">Import Questions</Button>
          <Button type="default">Export Questions</Button>
          <Button type="primary" onClick={openCreateModal}>
            + Add New Question
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={questions}
        loading={loadingTable}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} questions`
        }}
        scroll={{ x: 1000 }}
      />

      {/* Create/Edit Question Modal */}
      <Modal
        title={modalMode === 'create' ? 'Create New Question' : 'Edit Question'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? 'Create Question' : 'Update Question'}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="questionForm"
          onFinish={onFinish}
          initialValues={{ 
            type: 'multiple_choice',
            isActive: true,
            points: 1
          }}
        >
          <Form.Item
            label="Question Text"
            name="questionText"
            rules={[{ required: true, message: 'Please enter the question text' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Enter your question here..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Question Type"
            name="type"
            rules={[{ required: true, message: 'Please select a question type' }]}
          >
            <Select placeholder="Select question type">
              <Option value="multiple_choice">Multiple Choice</Option>
              <Option value="true_false">True/False</Option>
              <Option value="scale">Scale (1-5)</Option>
              <Option value="text">Text Response</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Answer Options (for Multiple Choice)"
            name="options"
            tooltip="Enter each option on a new line. Only needed for multiple choice questions."
          >
            <TextArea 
              rows={4} 
              placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
            />
          </Form.Item>

          <Form.Item
            label="Correct Answer"
            name="correctAnswer"
            tooltip="For multiple choice: enter the exact option text. For true/false: enter 'true' or 'false'"
          >
            <Input placeholder="Enter the correct answer" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="Points"
              name="points"
              style={{ flex: 1 }}
            >
              <Input type="number" min={1} max={10} />
            </Form.Item>

            <Form.Item
              label="Status"
              name="isActive"
              style={{ flex: 1 }}
            >
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionManagement;