import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  Avatar,
  Button,
  Progress,
  Tooltip,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { fetchTasks } from "../../store/slices/tasksSlice";

const { Title, Text } = Typography;

const RecentTasks = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({ page: 1, limit: 5 }));
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#52c41a";
      case "in-progress":
        return "#1890ff";
      case "overdue":
        return "#ff4d4f";
      default:
        return "#faad14";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined />;
      case "in-progress":
        return <SyncOutlined spin />;
      case "overdue":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#ff4d4f";
      case "high":
        return "#fa8c16";
      case "medium":
        return "#1890ff";
      default:
        return "#52c41a";
    }
  };

  const getProgress = (status) => {
    switch (status) {
      case "completed":
        return 100;
      case "in-progress":
        return 60;
      case "overdue":
        return 25;
      default:
        return 0;
    }
  };

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Recent Tasks
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
      <List
        loading={loading}
        dataSource={tasks?.slice(0, 5) || []}
        renderItem={(task, index) => (
          <List.Item
            style={{
              padding: "16px 0",
              borderBottom:
                index === (tasks?.slice(0, 5) || []).length - 1
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
                    <Avatar
                      size="small"
                      style={{
                        backgroundColor: getStatusColor(task.status),
                        color: "white",
                      }}
                      icon={getStatusIcon(task.status)}
                    />
                    <Text strong style={{ fontSize: 14 }}>
                      {task.title || `Task ${index + 1}`}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {task.description || "Task description not available"}
                  </Text>
                </div>
                <Space direction="vertical" align="end" size="small">
                  <Tag
                    color={getStatusColor(task.status)}
                    style={{
                      borderRadius: 12,
                      fontSize: 10,
                      padding: "2px 8px",
                      border: "none",
                    }}
                  >
                    {task.status || "pending"}
                  </Tag>
                  {task.priority && (
                    <Tag
                      color={getPriorityColor(task.priority)}
                      style={{
                        borderRadius: 12,
                        fontSize: 10,
                        padding: "2px 8px",
                        border: "none",
                      }}
                    >
                      {task.priority}
                    </Tag>
                  )}
                </Space>
              </div>

              <div style={{ marginBottom: 8 }}>
                <Progress
                  percent={getProgress(task.status)}
                  strokeColor={getStatusColor(task.status)}
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
                  <Tooltip title="Assigned to">
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      👤 {task.assignedTo?.name || "Unassigned"}
                    </Text>
                  </Tooltip>
                  {task.dueDate && (
                    <Tooltip title="Due date">
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </Tooltip>
                  )}
                </Space>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleDateString()
                    : "Today"}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <FileTextOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <div>
                <Text type="secondary">No recent tasks</Text>
                <br />
                <Button type="link" size="small">
                  Create your first task
                </Button>
              </div>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default RecentTasks;
