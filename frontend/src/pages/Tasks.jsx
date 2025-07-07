import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  Divider,
  DatePicker,
  InputNumber,
  Avatar,
  Badge,
  Drawer,
  List,
  Checkbox,
  Progress,
  Tooltip,
  Upload,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  CommentOutlined,
  UploadOutlined,
  SyncOutlined,
  PauseCircleOutlined,
  TagOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../services/api";
import DocumentManager from "../components/Documents/DocumentManager";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [taskDocuments, setTaskDocuments] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
    fetchClients();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tasks");
      // Handle the API response format { tasks, totalPages, currentPage, total }
      setTasks(response.data.tasks || response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");
      // Handle the API response format { clients, totalPages, currentPage, total }
      setClients(response.data.clients || response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/staff");
      // Handle the API response format { staff, totalPages, currentPage, total }
      const staffData = response.data.staff || response.data;

      // Transform the data to match the expected format
      const transformedUsers = staffData.map((staff) => ({
        ...staff,
        id: staff._id,
        name:
          `${staff.personalInfo?.firstName || ""} ${
            staff.personalInfo?.lastName || ""
          }`.trim() || "Unknown",
        email: staff.personalInfo?.email || "",
        position: staff.employmentDetails?.position || "",
        department: staff.employmentDetails?.department || "",
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      "in-progress": "blue",
      completed: "green",
      cancelled: "red",
      overdue: "red",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      "in-progress": <SyncOutlined spin />,
      completed: <CheckCircleOutlined />,
      cancelled: <PauseCircleOutlined />,
      overdue: <ExclamationCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "green",
      medium: "blue",
      high: "orange",
      urgent: "red",
    };
    return colors[priority] || "default";
  };

  const getTypeIcon = (type) => {
    const icons = {
      onboarding: "🎯",
      "client-management": "👥",
      sales: "💰",
      hr: "🏢",
      marketing: "📢",
      finance: "💳",
      operations: "⚙️",
      general: "📋",
    };
    return icons[type] || "📋";
  };

  const calculateProgress = (checklist) => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter((item) => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const isOverdue = (dueDate, status) => {
    return status !== "completed" && dayjs(dueDate).isBefore(dayjs());
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      client: task.client?._id,
      assignedTo: task.assignedTo?._id,
    });
    setIsModalVisible(true);
  };

  const handleView = (task) => {
    setViewingTask(task);
    setIsDrawerVisible(true);
    fetchTaskDocuments(task._id);
  };

  const fetchTaskDocuments = async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/documents`);
      setTaskDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching task documents:", error);
      setTaskDocuments([]);
    }
  };

  const handleDocumentsChange = () => {
    if (viewingTask) {
      fetchTaskDocuments(viewingTask._id);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      setIsModalVisible(false);
      setEditingTask(null);
      form.resetFields();
      fetchTasks();
      message.success(
        `Task ${editingTask ? "updated" : "created"} successfully`
      );
    } catch (error) {
      console.error("Error saving task:", error);
      message.error("Error saving task");
    }
  };

  const handleDelete = async (taskId) => {
    Modal.confirm({
      title: "Delete Task",
      content: "Are you sure you want to delete this task?",
      onOk: async () => {
        try {
          await api.delete(`/tasks/${taskId}`);
          fetchTasks();
          message.success("Task deleted successfully");
        } catch (error) {
          console.error("Error deleting task:", error);
          message.error("Error deleting task");
        }
      },
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
        completedAt:
          newStatus === "completed" ? new Date().toISOString() : null,
      });
      fetchTasks();
      message.success("Task status updated");
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Error updating task status");
    }
  };

  const columns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="flex items-center gap-2">
            <span>{getTypeIcon(record.type)}</span>
            <span className="font-medium">{text}</span>
            {isOverdue(record.dueDate, record.status) && (
              <Badge status="error" text="Overdue" />
            )}
          </div>
          <Text type="secondary" className="text-sm">
            {record.type?.replace("-", " ").toUpperCase()}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record._id, newStatus)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="pending">
            <Tag icon={<ClockCircleOutlined />} color="orange">
              Pending
            </Tag>
          </Option>
          <Option value="in-progress">
            <Tag icon={<SyncOutlined />} color="blue">
              In Progress
            </Tag>
          </Option>
          <Option value="completed">
            <Tag icon={<CheckCircleOutlined />} color="green">
              Completed
            </Tag>
          </Option>
          <Option value="cancelled">
            <Tag icon={<PauseCircleOutlined />} color="red">
              Cancelled
            </Tag>
          </Option>
        </Select>
      ),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "In Progress", value: "in-progress" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
        { text: "Overdue", value: "overdue" },
      ],
      onFilter: (value, record) => {
        if (value === "overdue") {
          return isOverdue(record.dueDate, record.status);
        }
        return record.status === value;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority?.toUpperCase()}</Tag>
      ),
      sorter: (a, b) => {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (assignedUser) => {
        if (!assignedUser) {
          return <Text type="secondary">Unassigned</Text>;
        }

        const userName =
          assignedUser.name ||
          `${assignedUser.personalInfo?.firstName || ""} ${
            assignedUser.personalInfo?.lastName || ""
          }`.trim() ||
          "Unknown User";

        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            {userName}
          </Space>
        );
      },
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) =>
        client ? (
          <div>
            <div className="font-medium">{client.businessName}</div>
            <Text type="secondary" className="text-sm">
              {client.businessType}
            </Text>
          </div>
        ) : (
          <Text type="secondary">No client</Text>
        ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date, record) =>
        date ? (
          <div className={isOverdue(date, record.status) ? "text-red-500" : ""}>
            <CalendarOutlined className="mr-1" />
            {dayjs(date).format("MMM DD, YYYY")}
          </div>
        ) : (
          <Text type="secondary">No due date</Text>
        ),
      sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => {
        const progress = calculateProgress(record.checklist);
        return (
          <Tooltip title={`${progress}% completed`}>
            <Progress percent={progress} size="small" />
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "overdue"
        ? isOverdue(task.dueDate, task.status)
        : task.status === statusFilter);
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === "all" || task.assignedTo?._id === assigneeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesPriority &&
      matchesAssignee
    );
  });

  return (
    <div className="tasks-page">
      <div className="page-header">
        <Title level={2}>
          <FileTextOutlined /> Tasks Management
        </Title>
        <Text type="secondary">
          Track and manage all your business tasks and activities
        </Text>
      </div>

      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search tasks..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="overdue">Overdue</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Types</Option>
              <Option value="onboarding">Onboarding</Option>
              <Option value="client-management">Client Management</Option>
              <Option value="sales">Sales</Option>
              <Option value="hr">HR</Option>
              <Option value="marketing">Marketing</Option>
              <Option value="finance">Finance</Option>
              <Option value="operations">Operations</Option>
              <Option value="general">General</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Priority</Option>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Assignee"
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Assignees</Option>
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} className="text-right">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTask(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Add Task
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredTasks.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tasks`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit Task Modal */}
      <Modal
        title={editingTask ? "Edit Task" : "Add New Task"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Task Title"
                rules={[{ required: true, message: "Please enter task title" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Task Type"
                rules={[{ required: true, message: "Please select task type" }]}
              >
                <Select placeholder="Select type">
                  <Option value="onboarding">Onboarding</Option>
                  <Option value="client-management">Client Management</Option>
                  <Option value="sales">Sales</Option>
                  <Option value="hr">HR</Option>
                  <Option value="marketing">Marketing</Option>
                  <Option value="finance">Finance</Option>
                  <Option value="operations">Operations</Option>
                  <Option value="general">General</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Please select priority" }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="assignedTo"
                label="Assign To"
                rules={[{ required: true, message: "Please assign task" }]}
              >
                <Select placeholder="Select assignee">
                  {users.map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="client" label="Client">
                <Select placeholder="Select client" allowClear>
                  {clients.map((client) => (
                    <Option key={client._id} value={client._id}>
                      {client.businessName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dueDate" label="Due Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estimatedHours" label="Estimated Hours">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="location" label="Location">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? "Update" : "Create"} Task
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Details Drawer */}
      <Drawer
        title="Task Details"
        placement="right"
        size="large"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {viewingTask && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {getTypeIcon(viewingTask.type)}
                </span>
                <Title level={3} className="mb-0">
                  {viewingTask.title}
                </Title>
              </div>
              <Space wrap>
                <Tag
                  icon={getStatusIcon(viewingTask.status)}
                  color={getStatusColor(viewingTask.status)}
                >
                  {viewingTask.status?.replace("-", " ").toUpperCase()}
                </Tag>
                <Tag color={getPriorityColor(viewingTask.priority)}>
                  {viewingTask.priority?.toUpperCase()}
                </Tag>
                <Tag>{viewingTask.type?.replace("-", " ").toUpperCase()}</Tag>
              </Space>
            </div>

            {viewingTask.description && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Description</Title>
                  <Paragraph>{viewingTask.description}</Paragraph>
                </div>
              </>
            )}

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Title level={5}>Assigned To</Title>
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    {viewingTask.assignedTo?.name ||
                      `${
                        viewingTask.assignedTo?.personalInfo?.firstName || ""
                      } ${
                        viewingTask.assignedTo?.personalInfo?.lastName || ""
                      }`.trim() ||
                      "Unassigned"}
                  </Space>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Title level={5}>Client</Title>
                  {viewingTask.client ? (
                    <div>
                      <div className="font-medium">
                        {viewingTask.client.businessName}
                      </div>
                      <Text type="secondary">
                        {viewingTask.client.businessType}
                      </Text>
                    </div>
                  ) : (
                    <Text type="secondary">No client assigned</Text>
                  )}
                </div>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Title level={5}>Due Date</Title>
                  {viewingTask.dueDate ? (
                    <div
                      className={
                        isOverdue(viewingTask.dueDate, viewingTask.status)
                          ? "text-red-500"
                          : ""
                      }
                    >
                      <CalendarOutlined className="mr-2" />
                      {dayjs(viewingTask.dueDate).format("MMM DD, YYYY")}
                    </div>
                  ) : (
                    <Text type="secondary">No due date set</Text>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Title level={5}>Estimated Hours</Title>
                  {viewingTask.estimatedHours ? (
                    <div>
                      <ClockCircleOutlined className="mr-2" />
                      {viewingTask.estimatedHours} hours
                    </div>
                  ) : (
                    <Text type="secondary">Not specified</Text>
                  )}
                </div>
              </Col>
            </Row>

            {viewingTask.location && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Location</Title>
                  <div>
                    <EnvironmentOutlined className="mr-2" />
                    {viewingTask.location}
                  </div>
                </div>
              </>
            )}

            {viewingTask.checklist && viewingTask.checklist.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Checklist</Title>
                  <Progress
                    percent={calculateProgress(viewingTask.checklist)}
                    className="mb-4"
                  />
                  <List
                    size="small"
                    dataSource={viewingTask.checklist}
                    renderItem={(item) => (
                      <List.Item>
                        <Checkbox checked={item.completed} disabled>
                          {item.item}
                        </Checkbox>
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}

            {viewingTask.tags && viewingTask.tags.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Tags</Title>
                  <Space wrap>
                    {viewingTask.tags.map((tag, index) => (
                      <Tag key={index} icon={<TagOutlined />}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </>
            )}

            <Divider />
            <div>
              <Title level={4}>Documents & Attachments</Title>
              <DocumentManager
                entityType="tasks"
                entityId={viewingTask._id}
                documents={taskDocuments}
                onDocumentsChange={handleDocumentsChange}
                canUpload={true}
                canReview={false}
                canShare={false}
              />
            </div>

            {viewingTask.comments && viewingTask.comments.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Comments</Title>
                  <List
                    dataSource={viewingTask.comments}
                    renderItem={(comment) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={comment.user?.name || "Unknown User"}
                          description={comment.text}
                        />
                        <div className="text-sm text-gray-500">
                          {dayjs(comment.createdAt).format(
                            "MMM DD, YYYY HH:mm"
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Tasks;
