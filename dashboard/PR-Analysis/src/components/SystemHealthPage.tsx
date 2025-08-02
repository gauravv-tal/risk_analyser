import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Progress,
  Statistic,
  Badge,
  Typography,
  Button,
  Alert,
  Table,
  Tag,
  Space,
} from "antd";
import {
  CloudServerOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  GithubOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Mock system health data
const systemHealthData = {
  githubAPI: {
    status: "active",
    usage: 78,
    remaining: 4247,
    resetTime: "45m",
  },
  workflows: { active: 3, queued: 0, failed: 0, successRate: 100 },
  repository: { size: "156MB", openIssues: 0, branches: 4 },
  performance: { avgResponseTime: 245, uptime: 99.8, errors: 3 },
  services: [
    {
      name: "AI Analysis Engine",
      status: "healthy",
      uptime: 99.9,
      responseTime: 120,
      lastCheck: "2 mins ago",
    },
    {
      name: "PR Processing Service",
      status: "healthy",
      uptime: 99.5,
      responseTime: 200,
      lastCheck: "1 min ago",
    },
    {
      name: "Database",
      status: "healthy",
      uptime: 100,
      responseTime: 15,
      lastCheck: "30 secs ago",
    },
    {
      name: "File Storage",
      status: "warning",
      uptime: 98.2,
      responseTime: 300,
      lastCheck: "5 mins ago",
    },
  ],
};

const SystemHealthPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const getTimeSinceLastUpdate = () => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / (1000 * 60)
    );

    if (diffInMinutes === 0) {
      return "just now";
    } else if (diffInMinutes === 1) {
      return "1 minute ago";
    } else {
      return `${diffInMinutes} minutes ago`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "warning":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "error":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <CheckCircleOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const serviceColumns = [
    {
      title: "Service",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space>
          {getStatusIcon(record.status)}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "healthy"
              ? "green"
              : status === "warning"
              ? "orange"
              : "red"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Uptime",
      dataIndex: "uptime",
      key: "uptime",
      render: (uptime: number) => (
        <Text
          style={{
            color:
              uptime >= 99 ? "#52c41a" : uptime >= 95 ? "#faad14" : "#ff4d4f",
          }}
        >
          {uptime}%
        </Text>
      ),
    },
    {
      title: "Response Time",
      dataIndex: "responseTime",
      key: "responseTime",
      render: (time: number) => `${time}ms`,
    },
    {
      title: "Last Check",
      dataIndex: "lastCheck",
      key: "lastCheck",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <CloudServerOutlined /> System Health
        </Title>
        <Text type="secondary">
          Monitor system performance and service health
        </Text>
      </div>

      {/* System Status Alert */}
      <Alert
        message="All Systems Operational"
        description={`Last health check completed ${getTimeSinceLastUpdate()}. No critical issues detected.`}
        type="success"
        showIcon
        style={{ marginBottom: "24px" }}
        action={
          <Button
            size="small"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      />

      {/* API & Infrastructure Status */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <GithubOutlined style={{ marginRight: "8px" }} />
                GitHub API Status
              </span>
            }
            extra={<Badge status="processing" text="Active" />}
          >
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Rate Limit Usage</Text>
                <Badge status="processing" text="Active" />
              </div>
              <Progress
                percent={systemHealthData.githubAPI.usage}
                strokeColor="#52c41a"
                style={{ marginTop: "8px" }}
              />
              <Text type="secondary">
                {systemHealthData.githubAPI.remaining} requests remaining
              </Text>
            </div>
            <Text type="secondary">
              Reset in {systemHealthData.githubAPI.resetTime}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <ApiOutlined style={{ marginRight: "8px" }} />
                Workflow Metrics
              </span>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Active"
                  value={systemHealthData.workflows.active}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Queued"
                  value={systemHealthData.workflows.queued}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Failed"
                  value={systemHealthData.workflows.failed}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: "16px" }}>
              <Text>Success Rate</Text>
              <Progress
                percent={systemHealthData.workflows.successRate}
                strokeColor="#52c41a"
                style={{ marginTop: "8px" }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Repository & Performance Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Repository Stats">
            <Statistic
              title="Repository Size"
              value={systemHealthData.repository.size}
              style={{ marginBottom: "16px" }}
            />
            <Statistic
              title="Open Issues"
              value={systemHealthData.repository.openIssues}
              style={{ marginBottom: "16px" }}
            />
            <Statistic
              title="Active Branches"
              value={systemHealthData.repository.branches}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Performance Metrics">
            <Statistic
              title="Avg Response Time"
              value={systemHealthData.performance.avgResponseTime}
              suffix="ms"
              style={{ marginBottom: "16px" }}
            />
            <Statistic
              title="Uptime"
              value={systemHealthData.performance.uptime}
              suffix="%"
              style={{ marginBottom: "16px" }}
            />
            <Statistic
              title="Error Count"
              value={systemHealthData.performance.errors}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Service Health Table */}
      <Card title="Service Health Status">
        <Table
          columns={serviceColumns}
          dataSource={systemHealthData.services}
          pagination={false}
          rowKey="name"
        />
      </Card>
    </div>
  );
};

export default SystemHealthPage;
