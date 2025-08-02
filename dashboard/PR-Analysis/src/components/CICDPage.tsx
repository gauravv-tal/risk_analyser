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
  Table,
  Tag,
  Space,
  Timeline,
  Alert,
  Tabs,
} from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  ReloadOutlined,
  RocketOutlined,
  CodeOutlined,
  BuildOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock CI/CD data
const pipelineData = {
  currentBuilds: [
    {
      id: "build-2024-001",
      branch: "feature/quantum-module",
      status: "running",
      progress: 65,
      stage: "Testing",
      startTime: "10:30 AM",
      estimatedCompletion: "2 mins",
    },
    {
      id: "build-2024-002",
      branch: "feature/activity-logging",
      status: "queued",
      progress: 0,
      stage: "Waiting",
      startTime: "10:35 AM",
      estimatedCompletion: "5 mins",
    },
  ],
  recentBuilds: [
    {
      id: "build-2024-003",
      branch: "main",
      status: "success",
      duration: "4m 32s",
      timestamp: "9:45 AM",
      tests: { passed: 45, failed: 0, total: 45 },
      coverage: 87,
    },
    {
      id: "build-2024-004",
      branch: "feature/calorie-service-updates",
      status: "failed",
      duration: "2m 15s",
      timestamp: "9:20 AM",
      tests: { passed: 42, failed: 3, total: 45 },
      coverage: 82,
      failureReason: "Unit tests failed",
    },
    {
      id: "build-2024-005",
      branch: "hotfix/security-patch",
      status: "success",
      duration: "3m 48s",
      timestamp: "8:55 AM",
      tests: { passed: 45, failed: 0, total: 45 },
      coverage: 89,
    },
  ],
  deployments: [
    {
      environment: "Production",
      status: "deployed",
      version: "v2.1.4",
      deployedAt: "Yesterday 6:30 PM",
      health: "healthy",
    },
    {
      environment: "Staging",
      status: "deployed",
      version: "v2.1.5-rc.1",
      deployedAt: "Today 8:15 AM",
      health: "healthy",
    },
    {
      environment: "Development",
      status: "deploying",
      version: "v2.1.5-rc.2",
      deployedAt: "Now",
      health: "pending",
    },
  ],
  metrics: {
    successRate: 94.2,
    averageBuildTime: "3m 45s",
    deploymentsToday: 3,
    totalPipelines: 156,
  },
};

const CICDPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "deployed":
      case "healthy":
        return "#52c41a";
      case "running":
      case "deploying":
        return "#1890ff";
      case "failed":
      case "error":
        return "#ff4d4f";
      case "queued":
      case "pending":
        return "#faad14";
      default:
        return "#8c8c8c";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "deployed":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "running":
      case "deploying":
        return <PlayCircleOutlined style={{ color: "#1890ff" }} />;
      case "failed":
      case "error":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "queued":
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const buildColumns = [
    {
      title: "Build ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      render: (text: string) => (
        <Space>
          <BranchesOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusIcon(status)}
          <span style={{ marginLeft: 4 }}>{status.toUpperCase()}</span>
        </Tag>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Tests",
      key: "tests",
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: "12px" }}>
            {record.tests.passed}/{record.tests.total} passed
          </Text>
          <Progress
            percent={Math.round(
              (record.tests.passed / record.tests.total) * 100
            )}
            size="small"
            status={record.tests.failed > 0 ? "exception" : "success"}
          />
        </Space>
      ),
    },
    {
      title: "Coverage",
      dataIndex: "coverage",
      key: "coverage",
      render: (coverage: number) => (
        <Progress
          percent={coverage}
          size="small"
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <BuildOutlined /> CI/CD Pipeline Dashboard
        </Title>
        <Text type="secondary">
          Monitor continuous integration and deployment pipelines
        </Text>
      </div>

      {/* Pipeline Status Alert */}
      <Alert
        message="Pipeline Status: All Systems Running"
        description="3 active pipelines, 2 deployments in progress. Last successful deployment: v2.1.4 to Production"
        type="info"
        showIcon
        icon={<RocketOutlined />}
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

      {/* Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={pipelineData.metrics.successRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Build Time"
              value={pipelineData.metrics.averageBuildTime}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Deployments Today"
              value={pipelineData.metrics.deploymentsToday}
              valueStyle={{ color: "#cf1322" }}
              prefix={<DeploymentUnitOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Pipelines"
              value={pipelineData.metrics.totalPipelines}
              valueStyle={{ color: "#722ed1" }}
              prefix={<BranchesOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Active Builds" key="1">
          <Row gutter={[16, 16]}>
            {pipelineData.currentBuilds.map((build) => (
              <Col xs={24} lg={12} key={build.id}>
                <Card
                  title={
                    <Space>
                      {getStatusIcon(build.status)}
                      <Text strong>{build.id}</Text>
                      <Tag color={getStatusColor(build.status)}>
                        {build.status.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text>
                      <BranchesOutlined /> Branch:{" "}
                      <Text code>{build.branch}</Text>
                    </Text>
                    <Text>
                      <CodeOutlined /> Stage: <Text strong>{build.stage}</Text>
                    </Text>
                    <Text>
                      <ClockCircleOutlined /> Started: {build.startTime}
                    </Text>
                    <Text>
                      ETA:{" "}
                      <Text type="secondary">{build.estimatedCompletion}</Text>
                    </Text>
                    <Progress
                      percent={build.progress}
                      status={build.status === "running" ? "active" : "normal"}
                    />
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="Build History" key="2">
          <Table
            dataSource={pipelineData.recentBuilds}
            columns={buildColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab="Deployments" key="3">
          <Row gutter={[16, 16]}>
            {pipelineData.deployments.map((deployment, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  title={
                    <Space>
                      <CloudServerOutlined />
                      <Text strong>{deployment.environment}</Text>
                      <Badge
                        status={
                          deployment.health === "healthy"
                            ? "success"
                            : deployment.health === "pending"
                            ? "processing"
                            : "error"
                        }
                        text={deployment.health}
                      />
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text type="secondary">Version:</Text>
                      <br />
                      <Text code strong>
                        {deployment.version}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">Status:</Text>
                      <br />
                      <Tag color={getStatusColor(deployment.status)}>
                        {getStatusIcon(deployment.status)}
                        <span style={{ marginLeft: 4 }}>
                          {deployment.status.toUpperCase()}
                        </span>
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary">Deployed:</Text>
                      <br />
                      <Text>{deployment.deployedAt}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="Pipeline Timeline" key="4">
          <Card title="Recent Pipeline Activity">
            <Timeline>
              <Timeline.Item
                dot={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                color="green"
              >
                <Text strong>v2.1.4 deployed to Production</Text>
                <br />
                <Text type="secondary">
                  Yesterday 6:30 PM - Duration: 4m 32s
                </Text>
              </Timeline.Item>
              <Timeline.Item
                dot={<PlayCircleOutlined style={{ color: "#1890ff" }} />}
                color="blue"
              >
                <Text strong>Build started for feature/quantum-module</Text>
                <br />
                <Text type="secondary">Today 10:30 AM - Currently running</Text>
              </Timeline.Item>
              <Timeline.Item
                dot={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                color="red"
              >
                <Text strong>
                  Build failed for feature/calorie-service-updates
                </Text>
                <br />
                <Text type="secondary">Today 9:20 AM - Unit tests failed</Text>
              </Timeline.Item>
              <Timeline.Item
                dot={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                color="green"
              >
                <Text strong>Security patch deployed to all environments</Text>
                <br />
                <Text type="secondary">Today 8:55 AM - Duration: 3m 48s</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CICDPage;
