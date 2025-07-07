import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ShopOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import BusinessOnboardingChecklist from "../components/Onboarding/BusinessOnboardingChecklist";
import api from "../services/api";

const { Title, Text } = Typography;

const Onboarding = () => {
  const [onboardingRecords, setOnboardingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isChecklistModalVisible, setIsChecklistModalVisible] = useState(false);
  const [isStageUpdateModalVisible, setIsStageUpdateModalVisible] =
    useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    console.log("Onboarding component mounted, fetching records...");
    fetchOnboardingRecords();
  }, []);

  // Debug effect to track onboardingRecords changes
  useEffect(() => {
    console.log("onboardingRecords state updated:", onboardingRecords);
    console.log("onboardingRecords length:", onboardingRecords.length);
  }, [onboardingRecords]);

  const fetchOnboardingRecords = async () => {
    setLoading(true);
    try {
      // This would be your actual API endpoint for onboarding records
      const response = await api.get("/onboarding");
      console.log("Onboarding API response:", response.data);

      // Handle different response structures
      let records = [];
      if (Array.isArray(response.data)) {
        records = response.data;
      } else if (
        response.data &&
        Array.isArray(response.data.onboardingRecords)
      ) {
        records = response.data.onboardingRecords;
      } else if (response.data && Array.isArray(response.data.onboarding)) {
        records = response.data.onboarding;
      } else if (response.data && Array.isArray(response.data.data)) {
        records = response.data.data;
      } else {
        console.warn("Unexpected API response structure:", response.data);
        records = [];
      }

      // Process records to ensure they have the right structure for the table
      const processedRecords = records.map((record) => ({
        _id: record._id,
        companyName: record.businessInfo?.companyName || record.companyName,
        businessType: record.businessInfo?.businessType || record.businessType,
        contactPersonTitle:
          record.businessInfo?.contactPersonTitle || record.contactPersonTitle,
        phoneNumber: record.businessInfo?.phoneNumber || record.phoneNumber,
        emailAddress: record.businessInfo?.emailAddress || record.emailAddress,
        progress: record.progress || 0,
        status: record.status || "pending",
        createdAt: record.createdAt,
        lastUpdated: record.updatedAt || record.lastUpdated,
        // Keep the original record for viewing details
        originalData: record,
      }));

      console.log("Processed onboarding records:", processedRecords);
      setOnboardingRecords(processedRecords);
    } catch (error) {
      console.error("Error fetching onboarding records:", error);
      console.log("Using mock data due to API error");

      // Mock data for demo
      const mockData = [
        {
          _id: "1",
          companyName: "TechCorp Solutions",
          businessType: "corporate",
          contactPersonTitle: "John Doe - HR Manager",
          phoneNumber: "+254712345678",
          emailAddress: "john@techcorp.com",
          progress: 75,
          status: "in-progress",
          createdAt: dayjs().subtract(5, "days").toISOString(),
          lastUpdated: dayjs().subtract(1, "day").toISOString(),
        },
        {
          _id: "2",
          companyName: "Elite Beauty Center",
          businessType: "salon",
          contactPersonTitle: "Sarah Johnson - Owner",
          phoneNumber: "+254723456789",
          emailAddress: "sarah@elitebeauty.com",
          progress: 100,
          status: "completed",
          createdAt: dayjs().subtract(10, "days").toISOString(),
          lastUpdated: dayjs().subtract(2, "days").toISOString(),
        },
        {
          _id: "3",
          companyName: "City Hotel Group",
          businessType: "hospitality",
          contactPersonTitle: "Michael Brown - General Manager",
          phoneNumber: "+254734567890",
          emailAddress: "michael@cityhotel.com",
          progress: 25,
          status: "pending",
          createdAt: dayjs().subtract(3, "days").toISOString(),
          lastUpdated: dayjs().subtract(3, "days").toISOString(),
        },
      ];
      setOnboardingRecords(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOnboarding = () => {
    setEditingRecord(null);
    setIsChecklistModalVisible(true);
  };

  const handleEditOnboarding = (record) => {
    setEditingRecord(record);
    setIsChecklistModalVisible(true);
  };

  const handleStageUpdate = (record) => {
    setSelectedRecord(record);
    setIsStageUpdateModalVisible(true);
  };

  const handleStageSelect = (stage) => {
    setSelectedStage(stage);
    setIsStageUpdateModalVisible(false);
    setEditingRecord({
      ...selectedRecord,
      editMode: "stage",
      selectedStage: stage,
    });
    setIsChecklistModalVisible(true);
  };

  const handleViewOnboarding = (record) => {
    setViewingRecord(record);
    setIsModalVisible(true);
  };

  const handleOnboardingComplete = async (data) => {
    try {
      console.log("Onboarding data received:", data);

      if (editingRecord?.editMode === "stage") {
        // Stage-specific update: merge only the updated stage data
        const stageField = editingRecord.selectedStage;
        const stageData = data[stageField];

        console.log(`Updating stage ${stageField} with data:`, stageData);

        const response = await api.patch(
          `/onboarding/${editingRecord._id}/stage`,
          {
            stage: stageField,
            data: stageData,
          }
        );

        console.log("Stage update response:", response.data);
        message.success(`${getStageTitle(stageField)} updated successfully!`);
      } else {
        // Full update or new creation
        const payload = {
          ...data,
          clientId: data.businessInfo?.clientId || null,
          companyName: data.businessInfo?.companyName,
          businessType: data.businessInfo?.businessType,
          contactPersonTitle: data.businessInfo?.contactPersonTitle,
          phoneNumber: data.businessInfo?.phoneNumber,
          emailAddress: data.businessInfo?.emailAddress,
          progress: data.progress || 100,
          status: data.progress === 100 ? "completed" : "in-progress",
          createdAt: editingRecord
            ? editingRecord.createdAt
            : dayjs().toISOString(),
          lastUpdated: dayjs().toISOString(),
        };

        console.log("Payload to be sent:", payload);

        if (editingRecord && !editingRecord.editMode) {
          // Update existing record
          console.log("Updating existing record:", editingRecord._id);
          const response = await api.put(
            `/onboarding/${editingRecord._id}`,
            payload
          );
          console.log("Update response:", response.data);
          message.success("Onboarding checklist updated successfully!");
        } else {
          // Create new record
          console.log("Creating new record");
          const response = await api.post("/onboarding", payload);
          console.log("Create response:", response.data);
          message.success("New onboarding checklist created successfully!");
        }
      }

      setIsChecklistModalVisible(false);
      setEditingRecord(null);
      if (selectedStage) setSelectedStage(null);

      // Refresh the list after successful save
      console.log("Refreshing onboarding records...");
      await fetchOnboardingRecords();
    } catch (error) {
      console.error("Error saving onboarding:", error);
      console.error("Error details:", error.response?.data);
      message.error(
        "Failed to save onboarding checklist: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      "in-progress": "blue",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      "in-progress": <ClockCircleOutlined />,
      completed: <CheckCircleOutlined />,
      cancelled: <ClockCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const calculateStats = () => {
    // Ensure onboardingRecords is an array before using filter
    const records = Array.isArray(onboardingRecords) ? onboardingRecords : [];
    console.log("Calculating stats for records:", records);

    const total = records.length;
    const completed = records.filter((r) => r.status === "completed").length;
    const inProgress = records.filter((r) => r.status === "in-progress").length;
    const pending = records.filter((r) => r.status === "pending").length;

    const stats = { total, completed, inProgress, pending };
    console.log("Calculated stats:", stats);

    return stats;
  };

  const stats = calculateStats();

  const getStageTitle = (stage) => {
    const stageTitles = {
      businessInfo: "Business Information",
      preOnboarding: "Pre-Onboarding",
      needsAssessment: "Needs Assessment",
      serviceProposal: "Service Proposal",
      followUp: "Follow-up & Contract",
      feedback: "Feedback & Review",
    };
    return stageTitles[stage] || "Unknown Stage";
  };

  const columns = [
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-sm">
            {record.businessType}
          </Text>
        </div>
      ),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPersonTitle",
      key: "contactPersonTitle",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" className="text-sm">
            {record.phoneNumber}
          </Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.emailAddress}
          </Text>
        </div>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={progress}
            size="small"
            strokeColor={progress === 100 ? "#52c41a" : "#1890ff"}
          />
          <Text className="text-sm">{progress}% Complete</Text>
        </div>
      ),
      sorter: (a, b) => a.progress - b.progress,
    },
    {
      title: "Status",
      dataIndex: "status",
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
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
      sorter: (a, b) =>
        dayjs(a.lastUpdated).unix() - dayjs(b.lastUpdated).unix(),
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
              onClick={() => handleViewOnboarding(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Full Checklist">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditOnboarding(record)}
            />
          </Tooltip>
          <Tooltip title="Update Specific Stage">
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStageUpdate(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <UserOutlined /> Business Client Onboarding
        </Title>
        <Text type="secondary">
          Manage comprehensive onboarding checklists for business clients
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Onboarding"
              value={stats.total}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div style={{ marginBottom: "16px", textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateOnboarding}
            style={{
              backgroundColor: "#c28992",
              borderColor: "#c28992",
            }}
          >
            New Onboarding Checklist
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={(() => {
            const dataSource = Array.isArray(onboardingRecords)
              ? onboardingRecords
              : [];
            console.log("Table dataSource:", dataSource);
            return dataSource;
          })()}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: Array.isArray(onboardingRecords)
              ? onboardingRecords.length
              : 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} onboarding records`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Onboarding Checklist Modal */}
      <Modal
        title={
          editingRecord?.editMode === "stage"
            ? `Update ${getStageTitle(editingRecord.selectedStage)} - ${
                editingRecord.companyName
              }`
            : editingRecord
            ? "Edit Onboarding Checklist"
            : "New Onboarding Checklist"
        }
        open={isChecklistModalVisible}
        onCancel={() => {
          setIsChecklistModalVisible(false);
          setEditingRecord(null);
          if (selectedStage) setSelectedStage(null);
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: "1200px" }}
      >
        <BusinessOnboardingChecklist
          onComplete={handleOnboardingComplete}
          initialData={editingRecord}
          editMode={editingRecord?.editMode}
          selectedStage={editingRecord?.selectedStage}
        />
      </Modal>

      {/* Stage Update Selection Modal */}
      <Modal
        title="Select Stage to Update"
        open={isStageUpdateModalVisible}
        onCancel={() => {
          setIsStageUpdateModalVisible(false);
          setSelectedRecord(null);
          setSelectedStage(null);
        }}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <div>
            <Text strong>
              Updating onboarding for: {selectedRecord.companyName}
            </Text>
            <div style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    hoverable
                    onClick={() => handleStageSelect("businessInfo")}
                    style={{ textAlign: "center" }}
                  >
                    <ShopOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                    <div style={{ marginTop: 8 }}>Business Information</div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    hoverable
                    onClick={() => handleStageSelect("preOnboarding")}
                    style={{ textAlign: "center" }}
                  >
                    <UserOutlined
                      style={{ fontSize: "24px", color: "#52c41a" }}
                    />
                    <div style={{ marginTop: 8 }}>Pre-Onboarding</div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    hoverable
                    onClick={() => handleStageSelect("needsAssessment")}
                    style={{ textAlign: "center" }}
                  >
                    <QuestionCircleOutlined
                      style={{ fontSize: "24px", color: "#fa8c16" }}
                    />
                    <div style={{ marginTop: 8 }}>Needs Assessment</div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    hoverable
                    onClick={() => handleStageSelect("serviceProposal")}
                    style={{ textAlign: "center" }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: "24px", color: "#722ed1" }}
                    />
                    <div style={{ marginTop: 8 }}>Service Proposal</div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    hoverable
                    onClick={() => handleStageSelect("followUp")}
                    style={{ textAlign: "center" }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: "24px", color: "#13c2c2" }}
                    />
                    <div style={{ marginTop: 8 }}>Follow-up & Contract</div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    hoverable
                    onClick={() => handleStageSelect("feedback")}
                    style={{ textAlign: "center" }}
                  >
                    <StarOutlined
                      style={{ fontSize: "24px", color: "#eb2f96" }}
                    />
                    <div style={{ marginTop: 8 }}>Feedback & Review</div>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        title="Onboarding Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingRecord && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Company: </Text>
                <Text>{viewingRecord.companyName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Business Type: </Text>
                <Text>{viewingRecord.businessType}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Contact: </Text>
                <Text>{viewingRecord.contactPersonTitle}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Phone: </Text>
                <Text>{viewingRecord.phoneNumber}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Email: </Text>
                <Text>{viewingRecord.emailAddress}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Progress: </Text>
                <Progress percent={viewingRecord.progress} size="small" />
              </Col>
              <Col span={12}>
                <Text strong>Status: </Text>
                <Tag color={getStatusColor(viewingRecord.status)}>
                  {viewingRecord.status?.replace("-", " ").toUpperCase()}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Created: </Text>
                <Text>
                  {dayjs(viewingRecord.createdAt).format("MMM DD, YYYY")}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Last Updated: </Text>
                <Text>
                  {dayjs(viewingRecord.lastUpdated).format("MMM DD, YYYY")}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Onboarding;
