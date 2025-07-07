import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  DatePicker,
  Button,
  Space,
  Statistic,
  Table,
  Progress,
  Tag,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line } from "@ant-design/plots";
import dayjs from "dayjs";
import api from "../services/api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [reportData, setReportData] = useState(null);
  const [tasksData, setTasksData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: reportType,
      };

      // Simulated API calls - replace with actual endpoints
      const [tasksResponse, clientsResponse] = await Promise.all([
        api.get("/tasks", { params }),
        api.get("/clients", { params }),
      ]);

      // Handle the API response format { tasks, totalPages, currentPage, total }
      const tasks = tasksResponse.data.tasks || tasksResponse.data || [];
      const clients =
        clientsResponse.data.clients || clientsResponse.data || [];

      setTasksData(tasks);
      setClientsData(clients);

      // Generate report summary
      generateReportSummary(tasks, clients);
    } catch (error) {
      console.error("Error fetching report data:", error);
      // Use mock data for demo - call it directly instead of relying on dependency
      const mockTasks = [
        {
          _id: "1",
          title: "Client Onboarding",
          status: "completed",
          priority: "high",
          type: "onboarding",
          createdAt: new Date(),
        },
        {
          _id: "2",
          title: "Sales Follow-up",
          status: "in-progress",
          priority: "medium",
          type: "sales",
          createdAt: new Date(),
        },
        {
          _id: "3",
          title: "HR Interview",
          status: "pending",
          priority: "low",
          type: "hr",
          createdAt: new Date(),
        },
      ];

      const mockClients = [
        {
          _id: "1",
          businessName: "Salon A",
          businessType: "salon",
          onboardingStatus: "completed",
          createdAt: new Date(),
        },
        {
          _id: "2",
          businessName: "Barbershop B",
          businessType: "barbershop",
          onboardingStatus: "in-progress",
          createdAt: new Date(),
        },
      ];

      setTasksData(mockTasks);
      setClientsData(mockClients);
      generateReportSummary(mockTasks, mockClients);
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const generateReportSummary = (tasks, clients) => {
    const summary = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
      totalClients: clients.length,
      completedClients: clients.filter(
        (c) => c.onboardingStatus === "completed"
      ).length,
      pendingClients: clients.filter((c) => c.onboardingStatus === "pending")
        .length,
      inProgressClients: clients.filter(
        (c) => c.onboardingStatus === "in-progress"
      ).length,
    };

    // Generate chart data
    const tasksByStatus = [
      { status: "Completed", count: summary.completedTasks, color: "#52c41a" },
      {
        status: "In Progress",
        count: summary.inProgressTasks,
        color: "#1890ff",
      },
      { status: "Pending", count: summary.pendingTasks, color: "#fa8c16" },
    ];

    const tasksByType = tasks.reduce((acc, task) => {
      const type = task.type || "general";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const typeChartData = Object.entries(tasksByType).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));

    const clientsByType = clients.reduce((acc, client) => {
      const type = client.businessType || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const clientTypeChartData = Object.entries(clientsByType).map(
      ([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
      })
    );

    // Performance trend (mock data)
    const performanceTrend = Array.from({ length: 7 }, (_, i) => ({
      date: dayjs()
        .subtract(6 - i, "day")
        .format("MMM DD"),
      tasksCompleted: Math.floor(Math.random() * 10) + 5,
      clientsOnboarded: Math.floor(Math.random() * 3) + 1,
    }));

    setReportData({
      summary,
      tasksByStatus,
      tasksByType: typeChartData,
      clientsByType: clientTypeChartData,
      performanceTrend,
    });

    setPerformanceData(performanceTrend);
  };

  const getTaskCompletionRate = () => {
    if (!reportData) return 0;
    const { totalTasks, completedTasks } = reportData.summary;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getClientCompletionRate = () => {
    if (!reportData) return 0;
    const { totalClients, completedClients } = reportData.summary;
    return totalClients > 0
      ? Math.round((completedClients / totalClients) * 100)
      : 0;
  };

  const taskColumns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          completed: "green",
          "in-progress": "blue",
          pending: "orange",
          cancelled: "red",
        };
        return (
          <Tag color={colors[status]}>
            {status?.replace("-", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        const colors = {
          low: "green",
          medium: "blue",
          high: "orange",
          urgent: "red",
        };
        return <Tag color={colors[priority]}>{priority?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag>{type?.replace("-", " ").toUpperCase()}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
  ];

  const clientColumns = [
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
    },
    {
      title: "Type",
      dataIndex: "businessType",
      key: "businessType",
      render: (type) => <Tag>{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "onboardingStatus",
      key: "status",
      render: (status) => {
        const colors = {
          completed: "green",
          "in-progress": "blue",
          pending: "orange",
          "on-hold": "red",
        };
        return (
          <Tag color={colors[status]}>
            {status?.replace("-", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
  ];

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ margin: "8px 0" }}>
            <Statistic
              title="Total Tasks"
              value={reportData?.summary.totalTasks || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ margin: "8px 0" }}>
            <Statistic
              title="Completed Tasks"
              value={reportData?.summary.completedTasks || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
              suffix={`(${getTaskCompletionRate()}%)`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ margin: "8px 0" }}>
            <Statistic
              title="Total Clients"
              value={reportData?.summary.totalClients || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ margin: "8px 0" }}>
            <Statistic
              title="Onboarded Clients"
              value={reportData?.summary.completedClients || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
              suffix={`(${getClientCompletionRate()}%)`}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Indicators */}
      <Row gutter={[16, 16]} style={{ margin: "24px 0" }}>
        <Col xs={24} md={12}>
          <Card
            title="Task Completion Rate"
            extra={<FileTextOutlined />}
            style={{ margin: "8px 0" }}
          >
            <Progress
              percent={getTaskCompletionRate()}
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-medium">
                  {reportData?.summary.completedTasks || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>In Progress</span>
                <span className="font-medium">
                  {reportData?.summary.inProgressTasks || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-medium">
                  {reportData?.summary.pendingTasks || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Client Onboarding Rate"
            extra={<ShopOutlined />}
            style={{ margin: "8px 0" }}
          >
            <Progress
              percent={getClientCompletionRate()}
              status="active"
              strokeColor={{
                "0%": "#722ed1",
                "100%": "#52c41a",
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-medium">
                  {reportData?.summary.completedClients || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>In Progress</span>
                <span className="font-medium">
                  {reportData?.summary.inProgressClients || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-medium">
                  {reportData?.summary.pendingClients || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ margin: "24px 0" }}>
        <Col xs={24} lg={12}>
          <Card
            title="Tasks by Status"
            extra={<BarChartOutlined />}
            style={{ margin: "8px 0" }}
          >
            {reportData?.tasksByStatus ? (
              <Column
                data={reportData.tasksByStatus}
                xField="status"
                yField="count"
                colorField="color"
                height={300}
              />
            ) : (
              <Empty description="No task data available" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Tasks by Type"
            extra={<PieChartOutlined />}
            style={{ margin: "8px 0" }}
          >
            {reportData?.tasksByType ? (
              <Pie
                data={reportData.tasksByType}
                angleField="count"
                colorField="type"
                height={300}
                radius={0.8}
                label={{
                  type: "outer",
                  content: "{name} {percentage}",
                }}
              />
            ) : (
              <Empty description="No task type data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Performance Trend */}
      <Card
        title="Performance Trend"
        extra={<LineChartOutlined />}
        style={{ margin: "24px 0" }}
      >
        {performanceData.length > 0 ? (
          <Line
            data={performanceData.flatMap((item) => [
              {
                date: item.date,
                value: item.tasksCompleted,
                type: "Tasks Completed",
              },
              {
                date: item.date,
                value: item.clientsOnboarded,
                type: "Clients Onboarded",
              },
            ])}
            xField="date"
            yField="value"
            seriesField="type"
            height={300}
            smooth={true}
          />
        ) : (
          <Empty description="No performance data available" />
        )}
      </Card>
    </div>
  );

  const renderTasksReport = () => (
    <Card
      title="Tasks Report"
      extra={<FileTextOutlined />}
      style={{ margin: "24px 0" }}
    >
      <Table
        columns={taskColumns}
        dataSource={tasksData}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </Card>
  );

  const renderClientsReport = () => (
    <Card
      title="Clients Report"
      extra={<ShopOutlined />}
      style={{ margin: "24px 0" }}
    >
      <Table
        columns={clientColumns}
        dataSource={clientsData}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </Card>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case "tasks":
        return renderTasksReport();
      case "clients":
        return renderClientsReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="reports-page" style={{ padding: "24px" }}>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <BarChartOutlined /> Reports & Analytics
        </Title>
        <Text type="secondary">
          View detailed insights and analytics for your business operations
        </Text>
      </div>

      {/* Controls */}
      <Card className="mb-6" style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: "100%" }}
              placeholder="Select report type"
            >
              <Option value="overview">Overview</Option>
              <Option value="tasks">Tasks Report</Option>
              <Option value="clients">Clients Report</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: "100%" }}
              presets={[
                {
                  label: "Last 7 Days",
                  value: [dayjs().subtract(7, "day"), dayjs()],
                },
                {
                  label: "Last 30 Days",
                  value: [dayjs().subtract(30, "day"), dayjs()],
                },
                {
                  label: "This Month",
                  value: [dayjs().startOf("month"), dayjs().endOf("month")],
                },
                {
                  label: "Last Month",
                  value: [
                    dayjs().subtract(1, "month").startOf("month"),
                    dayjs().subtract(1, "month").endOf("month"),
                  ],
                },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={10} className="text-right">
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchReportData}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => {
                  // Implement export functionality
                  console.log("Export report");
                }}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Report Content */}
      <Spin spinning={loading}>{renderReportContent()}</Spin>
    </div>
  );
};

export default Reports;
