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
  Progress,
  Tooltip,
  Avatar,
  Badge,
  Drawer,
  Upload,
  Image,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  UploadOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import DocumentManager from "../components/Documents/DocumentManager";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionGate } from "../components/Auth/PermissionGate";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [clientDocuments, setClientDocuments] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form] = Form.useForm();
  const { isClient } = usePermissions();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clients");
      console.log("Fetched clients:", response.data);
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      "in-progress": "blue",
      completed: "green",
      "on-hold": "red",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      "in-progress": <SyncOutlined spin />,
      completed: <CheckCircleOutlined />,
      "on-hold": <PauseCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getBusinessTypeIcon = (type) => {
    const icons = {
      salon: "💇‍♀️",
      barbershop: "💈",
      spa: "🧘‍♀️",
      other: "🏪",
    };
    return icons[type] || "🏪";
  };

  const calculateOnboardingProgress = (checklist) => {
    if (!checklist) return 0;
    const items = Object.values(checklist);
    const completed = items.filter((item) => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsModalVisible(true);
    setLogoPreview(client.logo?.url || null);
    form.setFieldsValue({
      businessName: client.businessName,
      businessType: client.businessType,
      contactPerson: client.contactPerson,
      address: client.address,
      onboardingStatus: client.onboardingStatus,
    });
  };

  const handleView = (client) => {
    setViewingClient(client);
    setIsDrawerVisible(true);
    fetchClientDocuments(client._id);
  };

  const fetchClientDocuments = async (clientId) => {
    try {
      const response = await api.get(`/clients/${clientId}/documents`);
      setClientDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching client documents:", error);
      setClientDocuments([]);
    }
  };

  const handleDocumentsChange = () => {
    if (viewingClient) {
      fetchClientDocuments(viewingClient._id);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Handle nested objects properly
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === "object" && values[key] !== null) {
          Object.keys(values[key]).forEach((subKey) => {
            formData.append(`${key}[${subKey}]`, values[key][subKey]);
          });
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Add logo file if selected
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (editingClient) {
        await api.put(`/clients/${editingClient._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Client updated successfully");
      } else {
        await api.post("/clients", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Client created successfully");
      }

      setIsModalVisible(false);
      setEditingClient(null);
      setLogoFile(null);
      setLogoPreview(null);
      form.resetFields();
      fetchClients();
    } catch (error) {
      console.error("Error saving client:", error);
      message.error("Failed to save client");
    }
  };

  const handleDelete = async (clientId) => {
    Modal.confirm({
      title: "Delete Client",
      content: "Are you sure you want to delete this client?",
      onOk: async () => {
        try {
          await api.delete(`/clients/${clientId}`);
          fetchClients();
        } catch (error) {
          console.error("Error deleting client:", error);
        }
      },
    });
  };

  const handleLogoUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    return false; // Prevent default upload
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingClient(null);
    setLogoFile(null);
    setLogoPreview(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Business",
      dataIndex: "businessName",
      key: "businessName",
      render: (text, record) => (
        <Space>
          <Avatar
            size="small"
            src={record.logo?.url}
            icon={
              !record.logo?.url
                ? getBusinessTypeIcon(record.businessType)
                : null
            }
          />
          <div>
            <div className="font-medium">{text}</div>
            <Text type="secondary" className="text-sm">
              {record.businessType?.charAt(0).toUpperCase() +
                record.businessType?.slice(1)}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.businessName.localeCompare(b.businessName),
    },
    {
      title: "Contact Person",
      dataIndex: ["contactPerson", "name"],
      key: "contactPerson",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Space className="text-sm text-gray-500">
            <PhoneOutlined />
            {record.contactPerson?.phone}
          </Space>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "onboardingStatus",
      key: "status",
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status?.replace("-", " ").toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "In Progress", value: "in-progress" },
        { text: "Completed", value: "completed" },
        { text: "On Hold", value: "on-hold" },
      ],
      onFilter: (value, record) => record.onboardingStatus === value,
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => {
        const progress = calculateOnboardingProgress(
          record.onboardingChecklist
        );
        return (
          <Tooltip title={`${progress}% completed`}>
            <Progress percent={progress} size="small" />
          </Tooltip>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) =>
        record.address?.city ? (
          <Space>
            <EnvironmentOutlined />
            {record.address.city}, {record.address.state}
          </Space>
        ) : (
          <Text type="secondary">Not specified</Text>
        ),
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
          <PermissionGate module="clients" action="update">
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          </PermissionGate>
          <PermissionGate module="clients" action="delete">
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record._id)}
              />
            </Tooltip>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  const filteredClients = (Array.isArray(clients) ? clients : []).filter(
    (client) => {
      const matchesSearch =
        client.businessName.toLowerCase().includes(searchText.toLowerCase()) ||
        client.contactPerson?.name
          .toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || client.onboardingStatus === statusFilter;
      const matchesType =
        businessTypeFilter === "all" ||
        client.businessType === businessTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }
  );

  return (
    <div className="clients-page">
      <div className="page-header">
        <Title level={2}>
          <ShopOutlined /> {isClient() ? "My Business" : "Clients Management"}
        </Title>
        <Text type="secondary">
          {isClient()
            ? "View and manage your business information and documents"
            : "Manage your business clients and track their onboarding progress"}
        </Text>
      </div>

      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search clients..."
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
              <Option value="on-hold">On Hold</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Type"
              value={businessTypeFilter}
              onChange={setBusinessTypeFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Types</Option>
              <Option value="salon">Salon</Option>
              <Option value="barbershop">Barbershop</Option>
              <Option value="spa">Spa</Option>
              <Option value="other">Other</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} className="text-right">
            <PermissionGate module="clients" action="create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingClient(null);
                  setLogoFile(null);
                  setLogoPreview(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Add Client
              </Button>
            </PermissionGate>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredClients.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} clients`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Client Modal */}
      <Modal
        title={editingClient ? "Edit Client" : "Add New Client"}
        open={isModalVisible}
        onCancel={handleModalClose}
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
                name="businessName"
                label="Business Name"
                rules={[
                  { required: true, message: "Please enter business name" },
                ]}
              >
                <Input prefix={<ShopOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="businessType"
                label="Business Type"
                rules={[
                  { required: true, message: "Please select business type" },
                ]}
              >
                <Select placeholder="Select type">
                  <Option value="salon">Salon</Option>
                  <Option value="barbershop">Barbershop</Option>
                  <Option value="spa">Spa</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Business Logo">
            <div className="logo-upload-section">
              {logoPreview && (
                <div className="logo-preview mb-4">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={100}
                    height={100}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
              )}
              <Upload
                beforeUpload={handleLogoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </Button>
              </Upload>
              <div className="text-gray-500 text-sm mt-2">
                Upload a logo for the business (JPEG, PNG only, max 2MB)
              </div>
            </div>
          </Form.Item>

          <Divider orientation="left">Contact Information</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={["contactPerson", "name"]}
                label="Contact Person"
                rules={[
                  {
                    required: true,
                    message: "Please enter contact person name",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["contactPerson", "position"]} label="Position">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={["contactPerson", "phone"]}
                label="Phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["contactPerson", "email"]}
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

          <Divider orientation="left">Address</Divider>

          <Form.Item name={["address", "street"]} label="Street Address">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={["address", "city"]} label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["address", "state"]} label="State">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["address", "zipCode"]} label="ZIP Code">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="onboardingStatus" label="Onboarding Status">
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="on-hold">On Hold</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingClient ? "Update" : "Create"} Client
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Client Details Drawer */}
      <Drawer
        title="Client Details"
        placement="right"
        size="large"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {viewingClient && (
          <div className="space-y-6">
            <div className="text-center">
              <Avatar
                size={64}
                src={viewingClient.logo}
                icon={
                  !viewingClient.logo
                    ? getBusinessTypeIcon(viewingClient.businessType)
                    : null
                }
              />
              <Title level={3} className="mt-4 mb-2">
                {viewingClient.businessName}
              </Title>
              <Tag
                icon={getStatusIcon(viewingClient.onboardingStatus)}
                color={getStatusColor(viewingClient.onboardingStatus)}
                className="mb-4"
              >
                {viewingClient.onboardingStatus
                  ?.replace("-", " ")
                  .toUpperCase()}
              </Tag>
            </div>

            <Divider />

            <div>
              <Title level={4}>Contact Information</Title>
              <Space direction="vertical" className="w-full">
                <div>
                  <UserOutlined /> <strong>Name:</strong>{" "}
                  {viewingClient.contactPerson?.name}
                </div>
                <div>
                  <PhoneOutlined /> <strong>Phone:</strong>{" "}
                  {viewingClient.contactPerson?.phone}
                </div>
                <div>
                  <MailOutlined /> <strong>Email:</strong>{" "}
                  {viewingClient.contactPerson?.email}
                </div>
                {viewingClient.contactPerson?.position && (
                  <div>
                    <strong>Position:</strong>{" "}
                    {viewingClient.contactPerson.position}
                  </div>
                )}
              </Space>
            </div>

            {viewingClient.address && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Address</Title>
                  <div className="text-gray-600">
                    <EnvironmentOutlined /> {viewingClient.address.street}
                    <br />
                    {viewingClient.address.city}, {viewingClient.address.state}{" "}
                    {viewingClient.address.zipCode}
                    <br />
                    {viewingClient.address.country}
                  </div>
                </div>
              </>
            )}

            <Divider />

            <div>
              <Title level={4}>Onboarding Progress</Title>
              <Progress
                percent={calculateOnboardingProgress(
                  viewingClient.onboardingChecklist
                )}
                status="active"
                className="mb-4"
              />

              {viewingClient.onboardingChecklist && (
                <div className="space-y-2">
                  {Object.entries(viewingClient.onboardingChecklist).map(
                    ([key, item]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <Badge
                          status={item.completed ? "success" : "processing"}
                          text={item.completed ? "Completed" : "Pending"}
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <Divider />

            <div>
              <Title level={4}>Documents</Title>
              <DocumentManager
                entityType="clients"
                entityId={viewingClient._id}
                documents={clientDocuments}
                onDocumentsChange={handleDocumentsChange}
                canUpload={true}
                canReview={true}
                canShare={true}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Clients;
