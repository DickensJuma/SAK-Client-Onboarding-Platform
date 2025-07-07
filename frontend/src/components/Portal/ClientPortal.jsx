import React, { useState, useEffect } from "react";
import {
  Card,
  Steps,
  Progress,
  Typography,
  Row,
  Col,
  Timeline,
  Tag,
  Button,
  Divider,
  Avatar,
  Tooltip,
  Alert,
  Space,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const ClientPortal = ({ onboardingId }) => {
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        setLoading(true);
        // Mock data for demo - in production, fetch from API
        const mockData = {
          _id: onboardingId || "1",
          businessInfo: {
            companyName: "TechCorp Solutions",
            businessType: "Corporate Office",
            contactPersonTitle: "John Doe - HR Manager",
            phoneNumber: "+254712345678",
            emailAddress: "john@techcorp.com",
          },
          progress: 75,
          status: "in-progress",
          estimatedCompletionDate: dayjs().add(10, "days").toISOString(),
          createdAt: dayjs().subtract(15, "days").toISOString(),
          assignedTo: {
            name: "Diana Sales",
            email: "diana@sakplatform.com",
            phone: "+254700123456",
          },
          stageProgress: {
            businessInfo: 100,
            preOnboarding: 100,
            needsAssessment: 80,
            serviceProposal: 60,
            followUp: 20,
            feedback: 0,
          },
          nextAction: {
            stage: "serviceProposal",
            action: "Review and approve service proposal",
            description:
              "We've prepared a customized service proposal based on your requirements. Please review and let us know your feedback.",
            dueDate: dayjs().add(3, "days").toISOString(),
          },
          timeline: [
            {
              date: dayjs().subtract(15, "days").toISOString(),
              title: "Onboarding Started",
              description:
                "Welcome to SAK Platform! Your onboarding journey has begun.",
              status: "completed",
              icon: <ShopOutlined />,
            },
            {
              date: dayjs().subtract(12, "days").toISOString(),
              title: "Initial Contact Completed",
              description:
                "Our team has gathered your basic business information.",
              status: "completed",
              icon: <UserOutlined />,
            },
            {
              date: dayjs().subtract(8, "days").toISOString(),
              title: "Needs Assessment Meeting",
              description:
                "Detailed discussion about your grooming service requirements.",
              status: "completed",
              icon: <QuestionCircleOutlined />,
            },
            {
              date: dayjs().add(1, "day").toISOString(),
              title: "Service Proposal Review",
              description: "Please review our customized service proposal.",
              status: "pending",
              icon: <FileTextOutlined />,
            },
            {
              date: dayjs().add(7, "days").toISOString(),
              title: "Contract Finalization",
              description: "Final contract signing and service setup.",
              status: "upcoming",
              icon: <CheckCircleOutlined />,
            },
          ],
        };

        setOnboardingData(mockData);

        // Calculate current stage based on progress
        const completedStages = Object.values(mockData.stageProgress).filter(
          (p) => p === 100
        ).length;
        setCurrentStage(completedStages);
      } catch (error) {
        console.error("Error fetching onboarding data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [onboardingId]);

  const getStageConfig = (stage) => {
    const configs = {
      businessInfo: {
        title: "Business Information",
        icon: <ShopOutlined />,
        description: "Basic company details and contact information",
      },
      preOnboarding: {
        title: "Initial Setup",
        icon: <UserOutlined />,
        description: "Account setup and initial contact coordination",
      },
      needsAssessment: {
        title: "Needs Assessment",
        icon: <QuestionCircleOutlined />,
        description:
          "Understanding your specific grooming service requirements",
      },
      serviceProposal: {
        title: "Service Proposal",
        icon: <FileTextOutlined />,
        description: "Customized service package and pricing proposal",
      },
      followUp: {
        title: "Contract & Setup",
        icon: <CheckCircleOutlined />,
        description: "Contract finalization and service implementation",
      },
      feedback: {
        title: "Welcome & Feedback",
        icon: <StarOutlined />,
        description: "Service launch and initial feedback collection",
      },
    };
    return configs[stage];
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "#52c41a",
      pending: "#1890ff",
      upcoming: "#d9d9d9",
      "in-progress": "#fa8c16",
    };
    return colors[status] || "#d9d9d9";
  };

  const renderWelcomeSection = () => (
    <Card
      style={{
        marginBottom: 24,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <Row align="middle">
        <Col flex={1}>
          <Title level={2} style={{ color: "white", marginBottom: 8 }}>
            Welcome to SAK Platform!
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "16px",
              marginBottom: 16,
            }}
          >
            We're excited to help {onboardingData?.businessInfo?.companyName}{" "}
            set up premium grooming services for your team.
          </Paragraph>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                Overall Progress
              </Text>
              <div style={{ marginTop: 4 }}>
                <Progress
                  percent={onboardingData?.progress || 0}
                  strokeColor="white"
                  trailColor="rgba(255,255,255,0.3)"
                  format={(percent) => `${percent}%`}
                />
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <Avatar
            size={80}
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <ShopOutlined style={{ fontSize: "40px" }} />
          </Avatar>
        </Col>
      </Row>
    </Card>
  );

  const renderProgressSteps = () => (
    <Card title="Onboarding Progress" style={{ marginBottom: 24 }}>
      <Steps current={currentStage} direction="vertical" size="small">
        {Object.entries(onboardingData?.stageProgress || {}).map(
          ([stage, progress], index) => {
            const config = getStageConfig(stage);
            const isCompleted = progress === 100;
            const isCurrent = index === currentStage;

            return (
              <Step
                key={stage}
                title={config?.title}
                description={
                  <div>
                    <div>{config?.description}</div>
                    {!isCompleted && (
                      <Progress
                        percent={progress}
                        size="small"
                        strokeColor={isCurrent ? "#1890ff" : "#d9d9d9"}
                        style={{ marginTop: 8, maxWidth: 200 }}
                      />
                    )}
                  </div>
                }
                status={isCompleted ? "finish" : isCurrent ? "process" : "wait"}
                icon={config?.icon}
              />
            );
          }
        )}
      </Steps>
    </Card>
  );

  const renderNextAction = () => {
    const { nextAction } = onboardingData || {};
    if (!nextAction || nextAction.stage === "completed") return null;

    return (
      <Alert
        message="Action Required"
        description={
          <div>
            <Title level={5} style={{ marginTop: 8 }}>
              {nextAction.action}
            </Title>
            <Paragraph>{nextAction.description}</Paragraph>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
              }}
            >
              <CalendarOutlined />
              <Text>
                Due: {dayjs(nextAction.dueDate).format("MMM DD, YYYY")}
              </Text>
              <Badge
                count={`${dayjs(nextAction.dueDate).diff(
                  dayjs(),
                  "days"
                )} days`}
                style={{ backgroundColor: "#fa8c16" }}
              />
            </div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        action={
          <Button type="primary" size="small">
            Take Action
          </Button>
        }
      />
    );
  };

  const renderTimeline = () => (
    <Card title="Journey Timeline" style={{ marginBottom: 24 }}>
      <Timeline>
        {onboardingData?.timeline?.map((event, index) => (
          <Timeline.Item
            key={index}
            color={getStatusColor(event.status)}
            dot={event.icon}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {event.title}
                </Title>
                <Tag color={getStatusColor(event.status)}>{event.status}</Tag>
              </div>
              <Text type="secondary">
                {dayjs(event.date).format("MMM DD, YYYY")}
              </Text>
              <Paragraph style={{ marginTop: 8 }}>
                {event.description}
              </Paragraph>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );

  const renderContactInfo = () => (
    <Card
      title={
        <>
          <TeamOutlined /> Your SAK Team
        </>
      }
      style={{ marginBottom: 24 }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size={48} style={{ backgroundColor: "#1890ff" }}>
              {onboardingData?.assignedTo?.name?.charAt(0)}
            </Avatar>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {onboardingData?.assignedTo?.name}
              </Title>
              <Text type="secondary">Your Onboarding Specialist</Text>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <Space>
            <MailOutlined />
            <Text>{onboardingData?.assignedTo?.email}</Text>
          </Space>
        </Col>
        <Col span={12}>
          <Space>
            <PhoneOutlined />
            <Text>{onboardingData?.assignedTo?.phone}</Text>
          </Space>
        </Col>
      </Row>
      <Divider />
      <div style={{ textAlign: "center" }}>
        <Space>
          <Button type="primary" icon={<MailOutlined />}>
            Send Message
          </Button>
          <Button icon={<CalendarOutlined />}>Schedule Call</Button>
        </Space>
      </div>
    </Card>
  );

  const renderQuickStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={8}>
        <Card size="small">
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}
            >
              {onboardingData?.progress || 0}%
            </div>
            <Text type="secondary">Completed</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card size="small">
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}
            >
              {dayjs(onboardingData?.estimatedCompletionDate).diff(
                dayjs(),
                "days"
              )}
            </div>
            <Text type="secondary">Days Remaining</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card size="small">
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#fa8c16" }}
            >
              {dayjs().diff(dayjs(onboardingData?.createdAt), "days")}
            </div>
            <Text type="secondary">Days Since Start</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return <Card loading={true} style={{ minHeight: 400 }} />;
  }

  if (!onboardingData) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Title level={4}>Onboarding Not Found</Title>
          <Text>Please check your onboarding ID or contact support.</Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      {renderWelcomeSection()}
      {renderNextAction()}
      {renderQuickStats()}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          {renderProgressSteps()}
          {renderTimeline()}
        </Col>
        <Col xs={24} lg={10}>
          {renderContactInfo()}

          {/* Help & Support */}
          <Card title="Need Help?" style={{ marginBottom: 24 }}>
            <Paragraph>
              Have questions about your onboarding? We're here to help!
            </Paragraph>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block icon={<QuestionCircleOutlined />}>
                View FAQ
              </Button>
              <Button block icon={<MailOutlined />}>
                Contact Support
              </Button>
              <Button block icon={<PhoneOutlined />}>
                Schedule Call
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientPortal;
