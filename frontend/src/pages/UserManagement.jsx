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
  Switch,
  Tooltip,
  Avatar,
  Badge,
  Drawer,
  Transfer,
  Tabs,
  Alert,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  KeyOutlined,
  SafetyOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] =
    useState(false);
  const [isClientAccountModalVisible, setIsClientAccountModalVisible] =
    useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [permissionConfig, setPermissionConfig] = useState({});
  const [viewingUser, setViewingUser] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();
  const [clientAccountForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchClients();
    fetchPermissionConfig();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchPermissionConfig = async () => {
    try {
      const response = await api.get("/users/config/permissions");
      setPermissionConfig(response.data);
    } catch (error) {
      console.error("Error fetching permission config:", error);
    }
  };

  const handleEditPermissions = (user) => {
    setEditingUser(user);
    setIsPermissionModalVisible(true);

    // Pre-populate form with current permissions
    const permissions = {};
    user.permissions.forEach((p) => {
      permissions[p.module] = {
        level: p.level,
        actions: p.actions,
      };
    });

    permissionForm.setFieldsValue({
      role: user.role,
      userType: user.userType,
      isActive: user.isActive,
      permissions: permissions,
    });
  };

  const handleView = (user) => {
    setViewingUser(user);
    setIsDrawerVisible(true);
  };

  const handleUpdatePermissions = async (values) => {
    try {
      const { role, userType, isActive, permissions } = values;

      // Transform permissions object to array format
      const permissionsArray = Object.entries(permissions || {}).map(
        ([module, config]) => ({
          module,
          level: config.level,
          actions: config.actions || [],
        })
      );

      await api.put(`/users/${editingUser._id}/permissions`, {
        role,
        userType,
        isActive,
        permissions: permissionsArray,
      });

      message.success("User permissions updated successfully");
      setIsPermissionModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating permissions:", error);
      message.error("Failed to update permissions");
    }
  };

  const handleCreateClientAccount = async (values) => {
    try {
      await api.post("/users/client-account", values);
      message.success("Client account created successfully");
      setIsClientAccountModalVisible(false);
      clientAccountForm.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Error creating client account:", error);
      message.error("Failed to create client account");
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "red",
      management: "purple",
      hr: "blue",
      sales: "green",
      director: "gold",
      client: "cyan",
    };
    return colors[role] || "default";
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <CrownOutlined />,
      management: <TeamOutlined />,
      hr: <UserOutlined />,
      sales: <SafetyOutlined />,
      director: <SettingOutlined />,
      client: <UserOutlined />,
    };
    return icons[role] || <UserOutlined />;
  };

  const getPermissionLevelColor = (level) => {
    const colors = {
      none: "default",
      view: "blue",
      edit: "orange",
      full: "green",
    };
    return colors[level] || "default";
  };

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{text}</div>
            <Text type="secondary" className="text-sm">
              {record.email}
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
        { text: "Client", value: "client" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Type",
      dataIndex: "userType",
      key: "userType",
      render: (type) => (
        <Tag color={type === "staff" ? "blue" : "green"}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_, record) => (
        <div>
          <Text type="secondary">
            {record.permissions?.length || 0} modules
          </Text>
        </div>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "Never"),
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
          <Tooltip title="Edit Permissions">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => handleEditPermissions(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());

    const matchesUserType =
      userTypeFilter === "all" || user.userType === userTypeFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesUserType && matchesRole;
  });

  return (
    <div className="user-management-page">
      <div className="page-header">
        <Title level={2}>
          <TeamOutlined /> User Management
        </Title>
        <Text type="secondary">
          Manage user roles, permissions, and access control
        </Text>
      </div>

      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search users..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="User Type"
              value={userTypeFilter}
              onChange={setUserTypeFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Types</Option>
              <Option value="staff">Staff</Option>
              <Option value="client">Client</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
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
              <Option value="client">Client</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10} className="text-right">
            <Space>
              <Button
                type="default"
                icon={<UserOutlined />}
                onClick={() => setIsClientAccountModalVisible(true)}
              >
                Create Client Account
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Add Staff User
              </Button>
            </Space>
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
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Permission Management Modal */}
      <Modal
        title="Edit User Permissions"
        open={isPermissionModalVisible}
        onCancel={() => setIsPermissionModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={handleUpdatePermissions}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="role" label="Role">
                <Select>
                  {permissionConfig.roles?.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="userType" label="User Type">
                <Select>
                  <Option value="staff">Staff</Option>
                  <Option value="client">Client</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Module Permissions</Divider>

          {permissionConfig.modules?.map((module) => (
            <Card key={module.value} size="small" className="mb-4">
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <strong>{module.label}</strong>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {module.description}
                  </Text>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name={["permissions", module.value, "level"]}
                    label="Access Level"
                  >
                    <Select placeholder="Select level">
                      {permissionConfig.levels?.map((level) => (
                        <Option key={level.value} value={level.value}>
                          {level.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={["permissions", module.value, "actions"]}
                    label="Actions"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select actions"
                      allowClear
                    >
                      {permissionConfig.actions?.map((action) => (
                        <Option key={action.value} value={action.value}>
                          {action.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsPermissionModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Permissions
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Client Account Modal */}
      <Modal
        title="Create Client Account"
        open={isClientAccountModalVisible}
        onCancel={() => setIsClientAccountModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Create Portal Access"
          description="This will create a login account for the client to access their portal and view their data."
          type="info"
          showIcon
          className="mb-4"
        />

        <Form
          form={clientAccountForm}
          layout="vertical"
          onFinish={handleCreateClientAccount}
          autoComplete="off"
        >
          <Form.Item
            name="clientId"
            label="Select Client"
            rules={[{ required: true, message: "Please select a client" }]}
          >
            <Select placeholder="Choose client">
              {clients.map((client) => (
                <Option key={client._id} value={client._id}>
                  {client.businessName} - {client.contactPerson?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

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

          <Form.Item name="name" label="Full Name">
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsClientAccountModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Details Drawer */}
      <Drawer
        title="User Details"
        placement="right"
        size="large"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {viewingUser && (
          <div className="space-y-6">
            <div className="text-center">
              <Avatar size={64} icon={<UserOutlined />} />
              <Title level={3} className="mt-4 mb-2">
                {viewingUser.name}
              </Title>
              <Space wrap>
                <Tag
                  icon={getRoleIcon(viewingUser.role)}
                  color={getRoleColor(viewingUser.role)}
                >
                  {viewingUser.role?.toUpperCase()}
                </Tag>
                <Tag
                  color={viewingUser.userType === "staff" ? "blue" : "green"}
                >
                  {viewingUser.userType?.toUpperCase()}
                </Tag>
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
                {viewingUser.phone && (
                  <div>
                    <PhoneOutlined /> <strong>Phone:</strong>{" "}
                    {viewingUser.phone}
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
              <Title level={4}>Permissions</Title>
              <div className="space-y-2">
                {viewingUser.permissions?.map((permission) => (
                  <Card key={permission.module} size="small">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <strong>{permission.module}</strong>
                      </Col>
                      <Col>
                        <Tag color={getPermissionLevelColor(permission.level)}>
                          {permission.level?.toUpperCase()}
                        </Tag>
                      </Col>
                    </Row>
                    {permission.actions?.length > 0 && (
                      <div className="mt-2">
                        <Text type="secondary">Actions: </Text>
                        <Space wrap>
                          {permission.actions.map((action) => (
                            <Tag key={action} size="small">
                              {action}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {viewingUser.clientId && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Linked Client</Title>
                  <Card size="small">
                    <div>
                      <strong>Business:</strong>{" "}
                      {viewingUser.clientId.businessName}
                    </div>
                    <div>
                      <strong>Contact:</strong>{" "}
                      {viewingUser.clientId.contactPerson?.name}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagement;
