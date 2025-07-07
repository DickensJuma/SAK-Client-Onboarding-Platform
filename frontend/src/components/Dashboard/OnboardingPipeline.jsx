import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Progress,
  Tag,
  Typography,
  Badge,
  Button,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../services/api";

const { Text, Title } = Typography;

const OnboardingPipeline = () => {
  const [pipelineData, setPipelineData] = useState({
    pending: [],
    "in-progress": [],
    completed: [],
    overdue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/onboarding");
      const records = response.data.onboardingRecords || response.data || [];

      // Group records by status
      const grouped = records.reduce(
        (acc, record) => {
          const status = record.status || "pending";
          if (!acc[status]) acc[status] = [];
          acc[status].push(record);
          return acc;
        },
        {
          pending: [],
          "in-progress": [],
          completed: [],
          overdue: [],
        }
      );

      setPipelineData(grouped);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        title: "Pending",
        color: "#fa8c16",
        icon: <ClockCircleOutlined />,
        bgColor: "#fff7e6",
        borderColor: "#ffec3d",
      },
      "in-progress": {
        title: "In Progress",
        color: "#1890ff",
        icon: <UserOutlined />,
        bgColor: "#e6f7ff",
        borderColor: "#40a9ff",
      },
      completed: {
        title: "Completed",
        color: "#52c41a",
        icon: <CheckCircleOutlined />,
        bgColor: "#f6ffed",
        borderColor: "#95de64",
      },
      overdue: {
        title: "Overdue",
        color: "#ff4d4f",
        icon: <ExclamationCircleOutlined />,
        bgColor: "#fff2f0",
        borderColor: "#ff7875",
      },
    };
    return configs[status] || configs.pending;
  };

  const getUrgencyTag = (record) => {
    const daysRemaining = record.daysRemaining;
    if (daysRemaining === null || daysRemaining === undefined) return null;

    if (daysRemaining < 0) {
      return <Tag color="red">Overdue</Tag>;
    } else if (daysRemaining <= 3) {
      return <Tag color="red">Urgent</Tag>;
    } else if (daysRemaining <= 7) {
      return <Tag color="orange">High Priority</Tag>;
    } else if (daysRemaining <= 14) {
      return <Tag color="blue">Medium</Tag>;
    }
    return <Tag color="green">Low Priority</Tag>;
  };

  const renderOnboardingCard = (record) => {
    const businessInfo = record.businessInfo || record;
    const nextAction = record.nextAction || {
      action: "Continue onboarding",
      stage: "unknown",
    };

    return (
      <Card
        key={record._id}
        size="small"
        style={{
          marginBottom: 8,
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        hoverable
      >
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong ellipsis style={{ maxWidth: "60%" }}>
              {businessInfo.companyName}
            </Text>
            {getUrgencyTag(record)}
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {businessInfo.businessType} • {businessInfo.contactPersonTitle}
          </Text>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Progress
            percent={record.progress || 0}
            size="small"
            strokeColor={{
              "0%": "#c28992",
              "100%": "#87d068",
            }}
            format={(percent) => `${percent}%`}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: "12px", color: "#666" }}>
            Next: {nextAction.action}
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarOutlined style={{ fontSize: "12px", color: "#666" }} />
            <Text style={{ fontSize: "12px", color: "#666" }}>
              {dayjs(record.createdAt).format("MMM DD")}
            </Text>
          </div>
          {record.assignedTo && (
            <Tooltip title={record.assignedTo.name}>
              <Avatar size={20} icon={<UserOutlined />} />
            </Tooltip>
          )}
        </div>
      </Card>
    );
  };

  const renderPipelineColumn = (status, records) => {
    const config = getStatusConfig(status);

    return (
      <Col xs={24} sm={12} lg={6} key={status}>
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {config.icon}
              <span>{config.title}</span>
              <Badge
                count={records.length}
                style={{ backgroundColor: config.color }}
              />
            </div>
          }
          style={{
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            height: "600px",
            overflow: "hidden",
          }}
          bodyStyle={{
            padding: "8px",
            height: "520px",
            overflowY: "auto",
          }}
        >
          {records.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={`No ${config.title.toLowerCase()} onboardings`}
              style={{ marginTop: 100 }}
            />
          ) : (
            records.map(renderOnboardingCard)
          )}
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading pipeline...</div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3}>Onboarding Pipeline</Title>
        <Button type="primary" onClick={fetchPipelineData}>
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {Object.entries(pipelineData).map(([status, records]) =>
          renderPipelineColumn(status, records)
        )}
      </Row>

      {/* Summary Statistics */}
      <Card style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {Object.values(pipelineData).flat().length}
              </div>
              <Text type="secondary">Total Active</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#52c41a",
                }}
              >
                {pipelineData.completed.length}
              </div>
              <Text type="secondary">Completed</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#ff4d4f",
                }}
              >
                {pipelineData.overdue.length}
              </div>
              <Text type="secondary">Overdue</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#fa8c16",
                }}
              >
                {Math.round(
                  (pipelineData.completed.length /
                    Object.values(pipelineData).flat().length) *
                    100
                ) || 0}
                %
              </div>
              <Text type="secondary">Completion Rate</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OnboardingPipeline;
