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
  Avatar,
  Badge,
  Drawer,
  List,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import DocumentManager from "../components/Documents/DocumentManager";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const Staff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/staff");
      // Handle the API response format { staff, totalPages, currentPage, total }
      const staffData = response.data.staff || response.data;

      // Transform the data to match the expected format
      const transformedData = staffData.map((staff) => ({
        ...staff,
        id: staff._id,
        name:
          `${staff.personalInfo?.firstName || ""} ${
            staff.personalInfo?.lastName || ""
          }`.trim() || "Unknown",
        email: staff.personalInfo?.email || "",
        phone: staff.personalInfo?.phone || "",
        phoneNumber: staff.personalInfo?.phone || "",
        position: staff.employmentDetails?.position || "",
        department: staff.employmentDetails?.department || "",
        role: staff.employmentDetails?.position || "staff",
        isActive: staff.status === "active",
        startDate: staff.employmentDetails?.startDate || "",
      }));

      setUsers(transformedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "red",
      management: "purple",
      hr: "blue",
      sales: "green",
      director: "gold",
    };
    return colors[role] || "default";
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <CrownOutlined />,
      management: <TeamOutlined />,
      hr: <UserOutlined />,
      sales: <BankOutlined />,
      director: <SafetyCertificateOutlined />,
    };
    return icons[role] || <UserOutlined />;
  };

  const getDepartmentColor = (department) => {
    const colors = {
      management: "purple",
      hr: "blue",
      sales: "green",
      admin: "red",
      operations: "orange",
      finance: "gold",
    };
    return colors[department] || "default";
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      phoneNumber: user.phoneNumber,
      position: user.position,
    });
    setIsModalVisible(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setIsDrawerVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, values);
      } else {
        await api.post("/users", values);
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (userId) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user?",
      onOk: async () => {
        try {
          await api.delete(`/users/${userId}`);
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      },
    });
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar size="large" src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.name || "Unknown"}</div>
            <Text type="secondary" className="text-sm">
              {record.email || "No email"}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag icon={getRoleIcon(role)} color={getRoleColor(role)}>
          {role?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Management", value: "management" },
        { text: "HR", value: "hr" },
        { text: "Sales", value: "sales" },
        { text: "Director", value: "director" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) =>
        department ? (
          <Tag color={getDepartmentColor(department)}>
            {department?.toUpperCase()}
          </Tag>
        ) : (
          <Text type="secondary">Not assigned</Text>
        ),
      filters: [
        { text: "Management", value: "management" },
        { text: "HR", value: "hr" },
        { text: "Sales", value: "sales" },
        { text: "Admin", value: "admin" },
        { text: "Operations", value: "operations" },
        { text: "Finance", value: "finance" },
      ],
      onFilter: (value, record) => record.department === value,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (position) =>
        position ? position : <Text type="secondary">Not specified</Text>,
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.phoneNumber && (
            <div className="text-sm">
              <PhoneOutlined className="mr-1" />
              {record.phoneNumber}
            </div>
          )}
          <div className="text-sm">
            <MailOutlined className="mr-1" />
            {record.email || "No email"}
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive, record) => (
        <Space>
          <Switch
            checked={isActive}
            onChange={() => handleStatusToggle(record._id, isActive)}
            size="small"
          />
          <Badge
            status={isActive ? "success" : "error"}
            text={isActive ? "Active" : "Inactive"}
          />
        </Space>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
      (user.position?.toLowerCase() || "").includes(searchText.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "all" || user.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  return (
    <div className="staff-page">
      <div className="page-header">
        <Title level={2}>
          <TeamOutlined /> Staff Management
        </Title>
        <Text type="secondary">
          Manage your team members, roles, and permissions
        </Text>
      </div>

      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search staff..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={8} sm={6} md={4}>
            <Select
              placeholder="Role"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="management">Management</Option>
              <Option value="hr">HR</Option>
              <Option value="sales">Sales</Option>
              <Option value="director">Director</Option>
            </Select>
          </Col>
          <Col xs={8} sm={6} md={4}>
            <Select
              placeholder="Department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Departments</Option>
              <Option value="management">Management</Option>
              <Option value="hr">HR</Option>
              <Option value="sales">Sales</Option>
              <Option value="admin">Admin</Option>
              <Option value="operations">Operations</Option>
              <Option value="finance">Finance</Option>
            </Select>
          </Col>
          <Col xs={8} sm={6} md={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} className="text-right">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingUser(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Add Staff
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} staff members`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? "Edit Staff Member" : "Add New Staff Member"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
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
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role">
                  <Option value="admin">Admin</Option>
                  <Option value="management">Management</Option>
                  <Option value="hr">HR</Option>
                  <Option value="sales">Sales</Option>
                  <Option value="director">Director</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Select placeholder="Select department">
                  <Option value="management">Management</Option>
                  <Option value="hr">HR</Option>
                  <Option value="sales">Sales</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="operations">Operations</Option>
                  <Option value="finance">Finance</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="Position">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Phone Number">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            label="Active Status"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Update" : "Create"} Staff Member
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Details Drawer */}
      <Drawer
        title="Staff Member Details"
        placement="right"
        size="large"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {viewingUser && (
          <div className="space-y-6">
            <div className="text-center">
              <Avatar
                size={80}
                src={viewingUser.avatar}
                icon={<UserOutlined />}
              />
              <Title level={3} className="mt-4 mb-2">
                {viewingUser.name}
              </Title>
              <Space wrap className="mb-4">
                <Tag
                  icon={getRoleIcon(viewingUser.role)}
                  color={getRoleColor(viewingUser.role)}
                >
                  {viewingUser.role?.toUpperCase()}
                </Tag>
                {viewingUser.department && (
                  <Tag color={getDepartmentColor(viewingUser.department)}>
                    {viewingUser.department?.toUpperCase()}
                  </Tag>
                )}
                <Badge
                  status={viewingUser.isActive ? "success" : "error"}
                  text={viewingUser.isActive ? "Active" : "Inactive"}
                />
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={4}>Contact Information</Title>
              <Space direction="vertical" className="w-full">
                <div>
                  <MailOutlined /> <strong>Email:</strong> {viewingUser.email}
                </div>
                {viewingUser.phoneNumber && (
                  <div>
                    <PhoneOutlined /> <strong>Phone:</strong>{" "}
                    {viewingUser.phoneNumber}
                  </div>
                )}
                {viewingUser.position && (
                  <div>
                    <strong>Position:</strong> {viewingUser.position}
                  </div>
                )}
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={4}>Role & Permissions</Title>
              <div className="space-y-4">
                <div>
                  <strong>Role:</strong>
                  <Tag
                    icon={getRoleIcon(viewingUser.role)}
                    color={getRoleColor(viewingUser.role)}
                    className="ml-2"
                  >
                    {viewingUser.role?.toUpperCase()}
                  </Tag>
                </div>
                {viewingUser.department && (
                  <div>
                    <strong>Department:</strong>
                    <Tag
                      color={getDepartmentColor(viewingUser.department)}
                      className="ml-2"
                    >
                      {viewingUser.department?.toUpperCase()}
                    </Tag>
                  </div>
                )}

                {viewingUser.permissions &&
                  viewingUser.permissions.length > 0 && (
                    <div>
                      <strong>Permissions:</strong>
                      <div className="mt-2">
                        {viewingUser.permissions.map((permission, index) => (
                          <div key={index} className="mb-2">
                            <Tag icon={<SettingOutlined />}>
                              {permission.module?.toUpperCase()}
                            </Tag>
                            <div className="ml-4 mt-1">
                              {permission.actions.map((action, actionIndex) => (
                                <Tag
                                  key={actionIndex}
                                  size="small"
                                  color="blue"
                                >
                                  {action}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <Divider />

            <div>
              <Title level={4}>Account Status</Title>
              <Space direction="vertical" className="w-full">
                <div className="flex items-center justify-between">
                  <span>Active Status</span>
                  {viewingUser.isActive ? (
                    <Badge status="success" text="Active" />
                  ) : (
                    <Badge status="error" text="Inactive" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Account Created</span>
                  <span className="text-gray-600">
                    {new Date(viewingUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span className="text-gray-600">
                    {new Date(viewingUser.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={4}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Documents
              </Title>
              <DocumentManager
                entityType="staff"
                entityId={viewingUser?._id}
                documents={viewingUser?.documents || []}
                onDocumentsChange={fetchUsers}
                canUpload={true}
                canReview={true}
                canShare={false}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Staff;
