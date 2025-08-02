import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Select,
  Space,
  Badge,
  Alert,
  Avatar,
  Typography,
  Switch,
} from "antd";
import {
  BugOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  UserOutlined,
  SafetyOutlined,
  RobotOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

// Enhanced Mock Data - Updated with real calorie-tracker PRs
const mockDashboardData = {
  overview: {
    totalPRs: 3,
    activePRs: 3,
    completedAnalysis: 0,
    riskScore: 67, // Average of 9.2, 6.7, 4.1
    systemHealth: 94.2,
    apiUsage: 78,
    accuracyRate: 94.2,
    analysisSpeed: 2.3,
    modelsActive: 3,
  },
  recentPRs: [
    {
      id: "#PR-3",
      title:
        "Add Quantum module with service and controller for quantum calorie processing, including AI vision analysis and neural network integration. Update app module to include QuantumModule.",
      author: "yasinbhimani",
      status: "critical",
      riskScore: 92, // 9.2 scaled to match UI expectations
      created: "Aug 2, 2025",
      repository: "calorie-tracker",
      files: 15,
      additions: 1185,
      deletions: 0,
      avatar: "https://github.com/yasinbhimani.png",
    },
    {
      id: "#PR-2",
      title:
        "[WIP] Merge activity log capability and track calories burn by day & week",
      author: "gauravv-tal",
      status: "medium-risk",
      riskScore: 67, // 6.7 scaled to match UI expectations
      created: "Aug 2, 2025",
      repository: "calorie-tracker",
      files: 8,
      additions: 423,
      deletions: 15,
      avatar: "https://github.com/gauravv-tal.png",
    },
    {
      id: "#PR-1",
      title: "[WIP][DO NOT MERGE] Update calorie.service.ts",
      author: "gauravv-tal",
      status: "low-risk",
      riskScore: 41, // 4.1 scaled to match UI expectations
      created: "Aug 1, 2025",
      repository: "calorie-tracker",
      files: 1,
      additions: 67,
      deletions: 23,
      avatar: "https://github.com/gauravv-tal.png",
    },
  ],
  riskAssessments: [
    {
      component: "Quantum Processing Module",
      risk: "critical",
      score: 9.2,
      status: "active",
      lastUpdated: "Aug 2, 2025",
      recommendations: 8,
    },
    {
      component: "Activity Tracking Service",
      risk: "medium",
      score: 6.7,
      status: "monitoring",
      lastUpdated: "Aug 2, 2025",
      recommendations: 3,
    },
    {
      component: "Calorie Service Updates",
      risk: "low",
      score: 4.1,
      status: "review",
      lastUpdated: "6 hours ago",
      recommendations: 1,
    },
  ],
  aiInsights: [
    {
      type: "pattern-detected",
      title: "Complex AI/ML Integration Risk",
      description:
        "The quantum processing module introduces 1,185 lines of untested AI/ML code. Similar ML integrations have required 3x longer testing cycles.",
      severity: "high",
      confidence: 94,
      recommendation:
        "Implement comprehensive unit tests for quantum algorithms and AI vision components",
    },
    {
      type: "performance-warning",
      title: "Calorie Processing Performance Impact",
      description:
        "Quantum calorie processing may impact response times. Neural network inference could add 200-500ms latency.",
      severity: "medium",
      confidence: 78,
      recommendation:
        "Add performance benchmarks and caching for AI model predictions",
    },
    {
      type: "positive-trend",
      title: "Activity Tracking Enhancement",
      description:
        "WIP activity logging feature follows established patterns and shows good code organization for calorie burn tracking.",
      severity: "info",
      confidence: 85,
      recommendation:
        "Complete WIP implementation and add integration tests for daily/weekly analytics",
    },
  ],
  systemMetrics: {
    githubAPI: {
      status: "active",
      usage: 78,
      remaining: 4247,
      resetTime: "45m",
    },
    workflows: { active: 3, queued: 0, failed: 0, successRate: 100 },
    repository: { size: "156MB", openIssues: 0, branches: 4 },
    performance: { avgResponseTime: 245, uptime: 99.8, errors: 3 },
  },
};

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleAnalyzePR = (record: any) => {
    // Construct the PR URL from the record data
    const prUrl = `https://github.com/SayaliTal/${
      record.repository
    }/pull/${record.id.replace("#PR-", "")}`;

    // Navigate to the Analysis page with the PR URL pre-filled
    navigate("/pr-analysis", {
      state: {
        prUrl: prUrl,
        autoAnalyze: true,
      },
    });
  };

  // Risk level color mapping
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "#ff4d4f";
      case "high":
      case "high-risk":
        return "#ff7a45";
      case "medium":
      case "medium-risk":
        return "#ffa940";
      case "low":
      case "low-risk":
        return "#52c41a";
      default:
        return "#d9d9d9";
    }
  };

  const getRiskTag = (risk: string, score?: number) => (
    <Tag color={getRiskColor(risk)} style={{ fontWeight: "bold" }}>
      {risk.toUpperCase()} {score && `(${score})`}
    </Tag>
  );

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    suffix?: string;
    prefix?: React.ReactNode;
    trend?: "up" | "down";
    trendValue?: string;
    color?: string;
    icon?: React.ReactNode;
  }> = ({ title, value, suffix, prefix, trend, trendValue, color, icon }) => (
    <Card
      hoverable
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
            {title}
          </Text>
          <div
            style={{ display: "flex", alignItems: "center", marginTop: "8px" }}
          >
            {prefix}
            <Text
              style={{
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
                margin: "0 4px",
              }}
            >
              {value}
            </Text>
            {suffix && (
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>{suffix}</Text>
            )}
          </div>
          {trend && trendValue && (
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {trend === "up" ? (
                <ArrowUpOutlined
                  style={{ color: "#52c41a", marginRight: "4px" }}
                />
              ) : (
                <ArrowDownOutlined
                  style={{ color: "#ff4d4f", marginRight: "4px" }}
                />
              )}
              <Text
                style={{
                  color: trend === "up" ? "#52c41a" : "#ff4d4f",
                  fontSize: "12px",
                }}
              >
                {trendValue}
              </Text>
            </div>
          )}
        </div>
        {icon && <div style={{ fontSize: "32px", opacity: 0.8 }}>{icon}</div>}
      </div>
    </Card>
  );

  const PRTable = () => {
    const columns = [
      {
        title: "PR",
        dataIndex: "id",
        key: "id",
        render: (text: string, record: any) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={record.avatar}
              size={32}
              style={{ marginRight: "12px" }}
            >
              <UserOutlined />
            </Avatar>
            <div>
              <Text strong style={{ color: "#1890ff" }}>
                {text}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.title}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: "Author",
        dataIndex: "author",
        key: "author",
        render: (author: string) => (
          <Text style={{ fontWeight: "500" }}>{author}</Text>
        ),
      },
      {
        title: "Risk Level",
        dataIndex: "status",
        key: "status",
        render: (status: string, record: any) => (
          <div>
            {getRiskTag(status, record.riskScore)}
            <br />
            <Progress
              percent={record.riskScore}
              size="small"
              strokeColor={getRiskColor(status)}
              showInfo={false}
              style={{ marginTop: "4px" }}
            />
          </div>
        ),
      },
      {
        title: "Changes",
        key: "changes",
        render: (record: any) => (
          <div>
            <Text style={{ color: "#52c41a" }}>+{record.additions}</Text>
            {" / "}
            <Text style={{ color: "#ff4d4f" }}>-{record.deletions}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.files} files
            </Text>
          </div>
        ),
      },
      {
        title: "Created",
        dataIndex: "created",
        key: "created",
        render: (created: string) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{ marginRight: "4px", color: "#8c8c8c" }}
            />
            <Text type="secondary">{created}</Text>
          </div>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (record: any) => (
          <Space>
            <Button type="primary" size="small" icon={<EyeOutlined />}>
              View
            </Button>
            <Button
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => handleAnalyzePR(record)}
            >
              Analyze
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={mockDashboardData.recentPRs}
        pagination={false}
        size="middle"
        rowKey="id"
        scroll={{ x: 800 }}
      />
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title
            level={2}
            style={{ margin: 0, display: "flex", alignItems: "center" }}
          >
            <RobotOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
            AI-Powered Release Impact Dashboard
          </Title>
          <Text type="secondary">
            Real-time insights and risk analysis for your releases
          </Text>
        </div>
        <Space>
          <Text type="secondary">Real-time updates</Text>
          <Switch
            checked={realTimeUpdates}
            onChange={setRealTimeUpdates}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
          <Select
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            style={{ width: 120 }}
          >
            <Option value="1d">Last 24h</Option>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>
          <Button
            type="primary"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Alert Banner */}
      <Alert
        message="System Status: All systems operational"
        description="Last updated 2 minutes ago. No critical issues detected."
        type="success"
        showIcon
        style={{ marginBottom: "24px" }}
        action={
          <Button size="small" type="text">
            View Details
          </Button>
        }
      />

      {/* Key Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Pull Requests"
            value={mockDashboardData.overview.totalPRs}
            trend="up"
            trendValue="+12% this week"
            icon={<BugOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active Analyses"
            value={mockDashboardData.overview.activePRs}
            trend="up"
            trendValue="+3 since yesterday"
            icon={<BarChartOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Risk Score"
            value={mockDashboardData.overview.riskScore}
            suffix="%"
            trend="down"
            trendValue="-5% improvement"
            icon={<ExclamationCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="System Health"
            value={mockDashboardData.overview.systemHealth}
            suffix="%"
            trend="up"
            trendValue="99.8% uptime"
            icon={<SafetyOutlined />}
          />
        </Col>
      </Row>

      {/* AI Engine Status */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <RobotOutlined
                  style={{ marginRight: "8px", color: "#722ed1" }}
                />
                AI Analysis Engine
              </span>
            }
            extra={<Badge status="processing" text="Active" />}
            style={{ height: "100%" }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Text>Accuracy Rate</Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <Progress
                  percent={94.2}
                  strokeColor="#52c41a"
                  style={{ flex: 1, marginRight: "16px" }}
                />
                <Text strong>94.2%</Text>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text>Analysis Speed</Text>
              <div style={{ marginTop: "8px" }}>
                <Statistic
                  value={2.3}
                  suffix="s"
                  precision={1}
                  valueStyle={{ fontSize: "20px" }}
                />
                <Text type="secondary">Average per PR</Text>
              </div>
            </div>
            <div>
              <Text>Models Active</Text>
              <div style={{ marginTop: "8px" }}>
                <Badge count={3} style={{ backgroundColor: "#52c41a" }}>
                  <span style={{ marginRight: "8px" }}>
                    Risk Assessment, Coverage, Performance
                  </span>
                </Badge>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Pull Requests"
            extra={
              <Space>
                <Button icon={<FilterOutlined />} size="small">
                  Filter
                </Button>
                <Button icon={<ExportOutlined />} size="small">
                  Export
                </Button>
              </Space>
            }
            style={{ height: "100%" }}
          >
            <PRTable />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EnhancedDashboard;
