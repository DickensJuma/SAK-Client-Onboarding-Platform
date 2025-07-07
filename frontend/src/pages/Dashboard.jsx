import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Avatar,
  Button,
  Progress,
  Badge,
  Timeline,
  Divider,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  FileTextOutlined,
  BankOutlined,
} from "@ant-design/icons";
import StatsCard from "../components/Dashboard/StatsCard.jsx";
import RecentTasks from "../components/Dashboard/RecentTasks.jsx";
import ClientsOverview from "../components/Dashboard/ClientsOverview.jsx";
import OnboardingPipeline from "../components/Dashboard/OnboardingPipeline.jsx";
import SmartReminders from "../components/Dashboard/SmartReminders.jsx";

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      name: "Total Clients",
      value: 142,
      change: "+12%",
      changeType: "increase",
      icon: <TeamOutlined />,
      color: "#1890ff",
    },
    {
      name: "Active Tasks",
      value: 28,
      change: "+4",
      changeType: "increase",
      icon: <FileTextOutlined />,
      color: "#52c41a",
    },
    {
      name: "Completed This Week",
      value: 45,
      change: "+8",
      changeType: "increase",
      icon: <CheckCircleOutlined />,
      color: "#722ed1",
    },
    {
      name: "Revenue (Monthly)",
      value: "KES 1,242,600",
      change: "+2.5%",
      changeType: "increase",
      icon: <DollarOutlined />,
      color: "#fa8c16",
    },
  ];

  const recentActivities = [
    {
      type: "success",
      content: 'New client "Salon Elegance" onboarded successfully',
      timestamp: "2 hours ago",
    },
    {
      type: "processing",
      content: "Staff training session scheduled for next week",
      timestamp: "4 hours ago",
    },
    {
      type: "warning",
      content: "Monthly report due in 3 days",
      timestamp: "1 day ago",
    },
    {
      type: "success",
      content: "15 tasks completed this week",
      timestamp: "2 days ago",
    },
  ];

  const upcomingEvents = [
    { title: "Client Meeting", time: "10:00 AM", type: "meeting" },
    { title: "Staff Review", time: "2:00 PM", type: "review" },
    { title: "Monthly Report", time: "4:00 PM", type: "report" },
  ];

  return (
    <div style={{ padding: "0 24px 24px 24px", background: "transparent" }}>
      {/* Header Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: 16,
              color: "white",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Space direction="vertical" size="small">
                  <Title level={2} style={{ color: "white", margin: 0 }}>
                    Welcome back, {user?.name}! 👋
                  </Title>
                  <Text
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}
                  >
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                    Here's what's happening with your business today.
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="center">
                  <Avatar
                    size={80}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: 32,
                      border: "3px solid rgba(255,255,255,0.3)",
                    }}
                    icon={<UserOutlined />}
                  >
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Badge
                    count="Online"
                    style={{
                      backgroundColor: "#52c41a",
                      color: "white",
                      fontSize: 10,
                    }}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.name}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                border: "none",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)`,
                  padding: "24px",
                }}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        background: stat.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 20,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color:
                            stat.changeType === "increase"
                              ? "#52c41a"
                              : "#ff4d4f",
                        }}
                      >
                        {stat.changeType === "increase" ? (
                          <ArrowUpOutlined />
                        ) : (
                          <ArrowDownOutlined />
                        )}
                        <Text strong style={{ color: "inherit" }}>
                          {stat.change}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        vs last period
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {stat.name}
                    </Text>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: "bold",
                        color: "#262626",
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Performance Overview */}
            <Card
              title={
                <Space>
                  <TrophyOutlined style={{ color: "#fa8c16" }} />
                  <span>Performance Overview</span>
                </Space>
              }
              extra={<Button type="link">View Details</Button>}
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: "center" }}>
                    <Progress
                      type="circle"
                      percent={85}
                      strokeColor="#52c41a"
                      size={100}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text strong>Client Satisfaction</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: "center" }}>
                    <Progress
                      type="circle"
                      percent={92}
                      strokeColor="#1890ff"
                      size={100}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text strong>Task Completion</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: "center" }}>
                    <Progress
                      type="circle"
                      percent={78}
                      strokeColor="#722ed1"
                      size={100}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text strong>Revenue Growth</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Onboarding Pipeline */}
            <OnboardingPipeline />

            {/* Recent Tasks and Clients */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <RecentTasks />
              </Col>
              <Col xs={24} lg={12}>
                <ClientsOverview />
              </Col>
            </Row>
          </Space>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Smart Reminders */}
            <SmartReminders />

            {/* Today's Schedule */}
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: "#1890ff" }} />
                  <span>Today's Schedule</span>
                </Space>
              }
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px 16px",
                      background: "#fafafa",
                      borderRadius: 8,
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>{event.title}</Text>
                        <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {event.time}
                        </div>
                      </div>
                      <Badge
                        color={
                          event.type === "meeting"
                            ? "#1890ff"
                            : event.type === "review"
                            ? "#52c41a"
                            : "#fa8c16"
                        }
                      />
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            {/* Recent Activity */}
            <Card
              title={
                <Space>
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <span>Recent Activity</span>
                </Space>
              }
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <Timeline
                items={recentActivities.map((activity) => ({
                  color:
                    activity.type === "success"
                      ? "green"
                      : activity.type === "warning"
                      ? "orange"
                      : "blue",
                  children: (
                    <div>
                      <Text>{activity.content}</Text>
                      <div
                        style={{ color: "#8c8c8c", fontSize: 12, marginTop: 4 }}
                      >
                        {activity.timestamp}
                      </div>
                    </div>
                  ),
                }))}
              />
            </Card>

            {/* Quick Actions */}
            <Card
              title="Quick Actions"
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<TeamOutlined />}
                >
                  Add New Client
                </Button>
                <Button block size="large" icon={<FileTextOutlined />}>
                  Create Task
                </Button>
                <Button block size="large" icon={<BankOutlined />}>
                  Generate Report
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
