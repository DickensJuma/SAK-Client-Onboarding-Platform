import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  List,
  Space,
  Spin,
  Button,
  Tooltip,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  PauseCircleOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchClients,
  selectRecentClients,
  selectClientsStats,
  selectClientsLoading,
} from "../../store/slices/clientsSlice";

const { Title, Text } = Typography;

const ClientsOverview = () => {
  const dispatch = useDispatch();
  const recentClients = useSelector(selectRecentClients);
  const stats = useSelector(selectClientsStats);
  const loading = useSelector(selectClientsLoading);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "#faad14",
      "in-progress": "#1890ff",
      completed: "#52c41a",
      "on-hold": "#ff4d4f",
    };
    return colors[status] || "#d9d9d9";
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

  const getCompletionRate = () => {
    return stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;
  };

  return (
    <Card
      title={
        <Space>
          <TeamOutlined style={{ color: "#52c41a" }} />
          <Title level={4} style={{ margin: 0 }}>
            Clients Overview
          </Title>
        </Space>
      }
      extra={
        <Button type="primary" ghost size="small" icon={<ArrowRightOutlined />}>
          View All
        </Button>
      }
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "none",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <Spin spinning={loading}>
        <div style={{ marginBottom: 24 }}>
          {/* Enhanced Stats Section */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 12px",
                  background:
                    "linear-gradient(135deg, #52c41a15 0%, #52c41a25 100%)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}
                >
                  {stats.total || 0}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total Clients
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 12px",
                  background:
                    "linear-gradient(135deg, #1890ff15 0%, #1890ff25 100%)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}
                >
                  {stats.active || 0}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Active
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 12px",
                  background:
                    "linear-gradient(135deg, #722ed115 0%, #722ed125 100%)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#722ed1" }}
                >
                  {getCompletionRate()}%
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Completion
                </Text>
              </div>
            </Col>
          </Row>

          {/* Completion Progress */}
          <div
            style={{
              padding: "16px",
              background: "#fafafa",
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text strong>Overall Progress</Text>
              <Space>
                <RiseOutlined style={{ color: "#52c41a" }} />
                <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
                  {getCompletionRate()}%
                </Text>
              </Space>
            </div>
            <Progress
              percent={getCompletionRate()}
              strokeColor={{
                "0%": "#722ed1",
                "100%": "#52c41a",
              }}
              size="small"
            />
          </div>
        </div>

        {/* Recent Clients List */}
        <div>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Recent Clients</Text>
            <Badge
              count={recentClients?.length || 0}
              style={{ backgroundColor: "#52c41a" }}
            />
          </div>

          <List
            dataSource={recentClients?.slice(0, 4) || []}
            renderItem={(client, index) => (
              <List.Item
                style={{
                  padding: "12px 0",
                  borderBottom:
                    index === (recentClients?.slice(0, 4) || []).length - 1
                      ? "none"
                      : "1px solid #f0f0f0",
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>
                          {getBusinessTypeIcon(client.businessType)}
                        </span>
                        <Text strong style={{ fontSize: 14 }}>
                          {client.businessName || `Client ${index + 1}`}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {client.contactPerson?.name || "Contact not available"}
                      </Text>
                    </div>
                    <Tag
                      color={getStatusColor(client.onboardingStatus)}
                      style={{
                        borderRadius: 12,
                        fontSize: 10,
                        padding: "2px 8px",
                        border: "none",
                      }}
                    >
                      {client.onboardingStatus || "pending"}
                    </Tag>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <Progress
                      percent={calculateOnboardingProgress(
                        client.onboardingChecklist
                      )}
                      strokeColor={getStatusColor(client.onboardingStatus)}
                      size="small"
                      showInfo={false}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space size="large">
                      <Tooltip title="Business type">
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          🏪 {client.businessType || "Unknown"}
                        </Text>
                      </Tooltip>
                      {client.address?.city && (
                        <Tooltip title="Location">
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            📍 {client.address.city}
                          </Text>
                        </Tooltip>
                      )}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 10 }}>
                      {client.createdAt
                        ? new Date(client.createdAt).toLocaleDateString()
                        : "Today"}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <TeamOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <div>
                    <Text type="secondary">No clients yet</Text>
                    <br />
                    <Button type="link" size="small">
                      Add your first client
                    </Button>
                  </div>
                </div>
              ),
            }}
          />
        </div>
      </Spin>
    </Card>
  );
};

export default ClientsOverview;
