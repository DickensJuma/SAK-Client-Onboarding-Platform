import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Avatar,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Badge,
  Tooltip,
  Space,
} from "antd";
import {
  BellOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../services/api";

const { Text, Title } = Typography;
const { TextArea } = Input;

const SmartReminders = ({ onboardingId = null }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);

        // Always fetch smart reminders from onboarding first
        const smartResponse = await api.get("/onboarding/smart-reminders");
        const smartReminders = smartResponse.data || [];

        // If we have a specific onboarding ID, we can fetch specific reminders
        // Otherwise, fetch general reminders
        let generalReminders = [];
        if (onboardingId) {
          try {
            const generalResponse = await api.get(
              `/onboarding/${onboardingId}/reminders`
            );
            generalReminders = generalResponse.data || [];
          } catch (error) {
            console.error(
              "Error fetching specific onboarding reminders:",
              error
            );
          }
        } else {
          try {
            const generalResponse = await api.get("/reminders");
            generalReminders = generalResponse.data || [];
          } catch (error) {
            console.error("Error fetching general reminders:", error);
          }
        }

        // Combine smart reminders with general reminders
        const allReminders = [...smartReminders, ...generalReminders];
        setReminders(allReminders);
      } catch (error) {
        console.error("Error fetching reminders:", error);
        // Fallback to mock reminders for development
        setReminders(generateMockReminders());
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [onboardingId]);

  // Refresh function for manual reload
  const refreshReminders = async () => {
    setLoading(true);
    try {
      // Always fetch smart reminders from onboarding first
      const smartResponse = await api.get("/onboarding/smart-reminders");
      const smartReminders = smartResponse.data || [];

      // Fetch general or specific reminders
      let generalReminders = [];
      if (onboardingId) {
        try {
          const generalResponse = await api.get(
            `/onboarding/${onboardingId}/reminders`
          );
          generalReminders = generalResponse.data || [];
        } catch (error) {
          console.error("Error fetching specific onboarding reminders:", error);
        }
      } else {
        try {
          const generalResponse = await api.get("/reminders");
          generalReminders = generalResponse.data || [];
        } catch (error) {
          console.error("Error fetching general reminders:", error);
        }
      }

      // Combine smart reminders with general reminders
      const allReminders = [...smartReminders, ...generalReminders];
      setReminders(allReminders);
    } catch (error) {
      console.error("Error refreshing reminders:", error);
      setReminders(generateMockReminders());
    } finally {
      setLoading(false);
    }
  };

  const generateMockReminders = () => [
    {
      _id: "1",
      title: "Follow up with TechCorp Solutions",
      description: "Proposal submitted 3 days ago, time for follow-up call",
      type: "follow-up",
      priority: "high",
      dueDate: dayjs().add(1, "day").toISOString(),
      onboardingId: "1",
      companyName: "TechCorp Solutions",
      stage: "followUp",
      isCompleted: false,
      isSmartGenerated: true,
    },
    {
      _id: "2",
      title: "Schedule needs assessment meeting",
      description: "Initial contact completed, ready for detailed assessment",
      type: "meeting",
      priority: "medium",
      dueDate: dayjs().add(2, "days").toISOString(),
      onboardingId: "2",
      companyName: "Elite Beauty Center",
      stage: "needsAssessment",
      isCompleted: false,
      isSmartGenerated: true,
    },
    {
      _id: "3",
      title: "Contract signing deadline approaching",
      description: "Contract must be signed by end of week",
      type: "deadline",
      priority: "urgent",
      dueDate: dayjs().add(3, "days").toISOString(),
      onboardingId: "3",
      companyName: "City Hotel Group",
      stage: "followUp",
      isCompleted: false,
      isSmartGenerated: false,
    },
  ];

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: "green", icon: <ClockCircleOutlined /> },
      medium: { color: "blue", icon: <CalendarOutlined /> },
      high: { color: "orange", icon: <ExclamationTriangleOutlined /> },
      urgent: { color: "red", icon: <ExclamationTriangleOutlined /> },
    };
    return configs[priority] || configs.medium;
  };

  const getTypeConfig = (type) => {
    const configs = {
      "follow-up": { label: "Follow-up", color: "blue" },
      meeting: { label: "Meeting", color: "green" },
      deadline: { label: "Deadline", color: "red" },
      review: { label: "Review", color: "purple" },
      custom: { label: "Custom", color: "default" },
    };
    return configs[type] || configs.custom;
  };

  const isOverdue = (dueDate) => {
    return dayjs(dueDate).isBefore(dayjs(), "day");
  };

  const getDueText = (dueDate) => {
    const due = dayjs(dueDate);
    const now = dayjs();
    const diffDays = due.diff(now, "days");

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await api.patch(`/reminders/${reminderId}/complete`);
      setReminders((prev) =>
        prev.map((r) =>
          r._id === reminderId ? { ...r, isCompleted: true } : r
        )
      );
      message.success("Reminder marked as completed");
    } catch (error) {
      console.error("Error completing reminder:", error);
      message.error("Failed to complete reminder");
    }
  };

  const handleCreateReminder = async (values) => {
    try {
      const reminderData = {
        ...values,
        dueDate: values.dueDate.toISOString(),
        onboardingId: onboardingId,
        isSmartGenerated: false,
      };

      const response = await api.post("/reminders", reminderData);
      setReminders((prev) => [response.data, ...prev]);
      setIsModalVisible(false);
      form.resetFields();
      message.success("Reminder created successfully");
    } catch (error) {
      console.error("Error creating reminder:", error);
      message.error("Failed to create reminder");
    }
  };

  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const overdueCount = pendingReminders.filter((r) =>
    isOverdue(r.dueDate)
  ).length;
  const todayCount = pendingReminders.filter((r) =>
    dayjs(r.dueDate).isSame(dayjs(), "day")
  ).length;

  return (
    <div>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BellOutlined />
              <span>Smart Reminders</span>
              <Badge
                count={overdueCount}
                style={{ backgroundColor: "#ff4d4f" }}
              />
              <Badge
                count={todayCount}
                style={{ backgroundColor: "#fa8c16" }}
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => setIsModalVisible(true)}
              style={{ marginRight: 8 }}
            >
              Add Reminder
            </Button>
            <Button size="small" onClick={refreshReminders}>
              Refresh
            </Button>
          </div>
        }
        size="small"
      >
        <List
          loading={loading}
          dataSource={pendingReminders.slice(0, 10)}
          renderItem={(reminder) => {
            const priorityConfig = getPriorityConfig(reminder.priority);
            const typeConfig = getTypeConfig(reminder.type);
            const overdue = isOverdue(reminder.dueDate);

            return (
              <List.Item
                actions={[
                  <Button
                    key="complete"
                    type="text"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleCompleteReminder(reminder._id)}
                  >
                    Complete
                  </Button>,
                ]}
                style={{
                  backgroundColor: overdue ? "#fff2f0" : undefined,
                  border: overdue ? "1px solid #ffccc7" : undefined,
                  borderRadius: 4,
                  marginBottom: 8,
                  padding: "8px 12px",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={priorityConfig.icon}
                      style={{
                        backgroundColor: priorityConfig.color,
                        color: "white",
                      }}
                    />
                  }
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Text strong>{reminder.title}</Text>
                      <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                      <Tag color={priorityConfig.color}>
                        {reminder.priority}
                      </Tag>
                      {reminder.isSmartGenerated && (
                        <Tooltip title="Auto-generated smart reminder">
                          <Tag color="cyan">Smart</Tag>
                        </Tooltip>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div>{reminder.description}</div>
                      {reminder.companyName && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {reminder.companyName} • {reminder.stage}
                        </Text>
                      )}
                      <div style={{ marginTop: 4 }}>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: overdue ? "#ff4d4f" : "#666",
                            fontWeight: overdue ? "bold" : "normal",
                          }}
                        >
                          {getDueText(reminder.dueDate)}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />

        {pendingReminders.length > 10 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button type="link">
              View all reminders ({pendingReminders.length})
            </Button>
          </div>
        )}
      </Card>

      {/* Create Reminder Modal */}
      <Modal
        title="Create New Reminder"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Create Reminder"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateReminder}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter reminder title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select a type" }]}
          >
            <Select placeholder="Select reminder type">
              <Select.Option value="follow-up">Follow-up</Select.Option>
              <Select.Option value="meeting">Meeting</Select.Option>
              <Select.Option value="deadline">Deadline</Select.Option>
              <Select.Option value="review">Review</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select a priority" }]}
          >
            <Select placeholder="Select priority">
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="urgent">Urgent</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: "Please select a due date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmartReminders;
