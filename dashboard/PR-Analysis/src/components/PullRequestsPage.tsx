import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Avatar,
  Typography,
  Dropdown,
  Menu,
  Badge,
  Progress,
  Statistic,
  Alert,
  Tabs,
} from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  MergeOutlined,
  CloseOutlined,
  ReloadOutlined,
  ExportOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BranchesOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GithubOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Enhanced Pull Requests data with more details
const pullRequestsData = [
  {
    id: "3",
    key: "3",
    title:
      "Add Quantum module with service and controller for quantum calorie processing, including AI vision analysis and neural network integration. Update app module to include QuantumModule.",
    author: {
      name: "yasinbhimani",
      avatar: "https://github.com/yasinbhimani.png",
    },
    status: "open",
    priority: "critical",
    riskScore: 92,
    repository: "calorie-tracker",
    branch: "feature/quantum-module",
    created: "2025-08-02",
    updated: "2025-08-02",
    files: 15,
    additions: 1185,
    deletions: 0,
    commits: 8,
    reviews: {
      required: 2,
      approved: 0,
      requested: 1,
    },
    checks: {
      total: 6,
      passed: 3,
      failed: 2,
      pending: 1,
    },
    labels: ["enhancement", "ai-ml", "high-risk", "quantum"],
    assignees: ["yasinbhimani"],
    reviewers: ["Strange-Quark-007"],
    description:
      "Complex quantum processing module with AI vision analysis and neural network integration for advanced calorie processing capabilities. This PR introduces significant changes to the core architecture.",
    conflicted: false,
    mergeable: true,
    draft: false,
  },
  {
    id: "2",
    key: "2",
    title:
      "[WIP] Merge activity log capability and track calories burn by day & week",
    author: {
      name: "gauravv-tal",
      avatar: "https://github.com/gauravv-tal.png",
    },
    status: "open",
    priority: "medium",
    riskScore: 67,
    repository: "calorie-tracker",
    branch: "feature/activity-logging",
    created: "2025-08-02",
    updated: "2025-08-02",
    files: 8,
    additions: 423,
    deletions: 15,
    commits: 5,
    reviews: {
      required: 1,
      approved: 0,
      requested: 0,
    },
    checks: {
      total: 4,
      passed: 4,
      failed: 0,
      pending: 0,
    },
    labels: ["wip", "feature", "analytics"],
    assignees: ["gauravv-tal"],
    reviewers: [],
    description:
      "Work in progress PR to add activity logging and calorie burn tracking with daily and weekly analytics. Includes database schema changes for activity storage.",
    conflicted: false,
    mergeable: true,
    draft: true,
  },
  {
    id: "1",
    key: "1",
    title: "[WIP][DO NOT MERGE] Update calorie.service.ts",
    author: {
      name: "gauravv-tal",
      avatar: "https://github.com/gauravv-tal.png",
    },
    status: "open",
    priority: "low",
    riskScore: 41,
    repository: "calorie-tracker",
    branch: "feature/calorie-service-updates",
    created: "2025-08-01",
    updated: "2025-08-01",
    files: 1,
    additions: 67,
    deletions: 23,
    commits: 2,
    reviews: {
      required: 1,
      approved: 0,
      requested: 0,
    },
    checks: {
      total: 3,
      passed: 2,
      failed: 1,
      pending: 0,
    },
    labels: ["wip", "do-not-merge", "service-update"],
    assignees: ["gauravv-tal"],
    reviewers: [],
    description:
      "Work in progress changes to calorie service - marked as DO NOT MERGE for review purposes only. Testing service refactoring approaches.",
    conflicted: false,
    mergeable: false,
    draft: true,
  },
];

const PullRequestsPage: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "#ff4d4f";
    if (score >= 60) return "#faad14";
    if (score >= 40) return "#1890ff";
    return "#52c41a";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "blue";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <ExclamationCircleOutlined style={{ color: "#52c41a" }} />;
      case "merged":
        return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
      case "closed":
        return <CloseOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const columns = [
    {
      title: "PR",
      dataIndex: "id",
      width: 80,
      render: (id: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>#{id}</Text>
          {record.draft && <Tag color="orange">DRAFT</Tag>}
        </Space>
      ),
    },
    {
      title: "Title & Details",
      dataIndex: "title",
      render: (title: string, record: any) => (
        <div style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: 4 }}>
            <Text strong style={{ fontSize: 14 }}>
              {title.length > 80 ? `${title.substring(0, 80)}...` : title}
            </Text>
          </div>
          <Space size={8} wrap>
            <Tag color={getPriorityColor(record.priority)}>
              {record.priority.toUpperCase()}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <BranchesOutlined /> {record.branch}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <FileTextOutlined /> {record.files} files
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              +{record.additions} -{record.deletions}
            </Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            <Space size={4} wrap>
              {record.labels.map((label: string) => (
                <Tag key={label}>{label}</Tag>
              ))}
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Author",
      dataIndex: "author",
      width: 120,
      render: (author: any) => (
        <Space>
          <Avatar src={author.avatar} size="small" icon={<UserOutlined />} />
          <Text>{author.name}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (status: string) => (
        <Space>
          {getStatusIcon(status)}
          <Text style={{ textTransform: "capitalize" }}>{status}</Text>
        </Space>
      ),
    },
    {
      title: "Risk Score",
      dataIndex: "riskScore",
      width: 120,
      render: (score: number) => (
        <Space direction="vertical" size={0}>
          <Progress
            percent={score}
            size="small"
            strokeColor={getRiskColor(score)}
            showInfo={false}
          />
          <Text style={{ fontSize: 12, color: getRiskColor(score) }}>
            {score}/100
          </Text>
        </Space>
      ),
    },
    {
      title: "Reviews",
      dataIndex: "reviews",
      width: 100,
      render: (reviews: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            {reviews.approved}/{reviews.required} approved
          </Text>
          {reviews.requested > 0 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {reviews.requested} requested
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Checks",
      dataIndex: "checks",
      width: 100,
      render: (checks: any) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            {checks.passed > 0 && (
              <Badge
                count={checks.passed}
                style={{ backgroundColor: "#52c41a" }}
              />
            )}
            {checks.failed > 0 && (
              <Badge
                count={checks.failed}
                style={{ backgroundColor: "#ff4d4f" }}
              />
            )}
            {checks.pending > 0 && (
              <Badge
                count={checks.pending}
                style={{ backgroundColor: "#faad14" }}
              />
            )}
          </Space>
          <Text style={{ fontSize: 11 }}>
            {checks.passed + checks.failed + checks.pending}/{checks.total}{" "}
            checks
          </Text>
        </Space>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updated",
      width: 100,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <CalendarOutlined /> {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: "Actions",
      width: 100,
      render: (record: any) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />}>
                View Details
              </Menu.Item>
              <Menu.Item
                key="merge"
                icon={<MergeOutlined />}
                disabled={!record.mergeable}
              >
                Merge PR
              </Menu.Item>
              <Menu.Item key="close" icon={<CloseOutlined />}>
                Close PR
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="export" icon={<ExportOutlined />}>
                Export Data
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredData = pullRequestsData.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(searchText.toLowerCase()) ||
      pr.author.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || pr.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || pr.priority === priorityFilter;
    const matchesAuthor =
      authorFilter === "all" || pr.author.name === authorFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "open" && pr.status === "open") ||
      (activeTab === "draft" && pr.draft) ||
      (activeTab === "high-risk" && pr.riskScore >= 70);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAuthor &&
      matchesTab
    );
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // Stats for the summary cards
  const stats = {
    total: pullRequestsData.length,
    open: pullRequestsData.filter((pr) => pr.status === "open").length,
    draft: pullRequestsData.filter((pr) => pr.draft).length,
    highRisk: pullRequestsData.filter((pr) => pr.riskScore >= 70).length,
    avgRiskScore: Math.round(
      pullRequestsData.reduce((acc, pr) => acc + pr.riskScore, 0) /
        pullRequestsData.length
    ),
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <GithubOutlined /> Pull Requests Management
        </Title>
        <Text type="secondary">
          Manage and review pull requests across your repositories
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total PRs"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Open PRs"
              value={stats.open}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="High Risk PRs"
              value={stats.highRisk}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Risk Score"
              value={stats.avgRiskScore}
              suffix="/100"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: getRiskColor(stats.avgRiskScore) }}
            />
          </Card>
        </Col>
      </Row>

      {/* High Risk Alert */}
      {stats.highRisk > 0 && (
        <Alert
          message="High Risk Pull Requests Detected"
          description={`${stats.highRisk} pull request(s) have risk scores above 70. Review and prioritize these PRs for immediate attention.`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: "24px" }}
        />
      )}

      {/* Filters and Actions */}
      <Card style={{ marginBottom: "16px" }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Search
                placeholder="Search pull requests..."
                allowClear
                style={{ width: 300 }}
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">All Status</Option>
                <Option value="open">Open</Option>
                <Option value="merged">Merged</Option>
                <Option value="closed">Closed</Option>
              </Select>
              <Select
                placeholder="Priority"
                style={{ width: 120 }}
                value={priorityFilter}
                onChange={setPriorityFilter}
              >
                <Option value="all">All Priority</Option>
                <Option value="critical">Critical</Option>
                <Option value="high">High</Option>
                <Option value="medium">Medium</Option>
                <Option value="low">Low</Option>
              </Select>
              <Select
                placeholder="Author"
                style={{ width: 150 }}
                value={authorFilter}
                onChange={setAuthorFilter}
              >
                <Option value="all">All Authors</Option>
                <Option value="yasinbhimani">yasinbhimani</Option>
                <Option value="gauravv-tal">gauravv-tal</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />}>Refresh</Button>
              <Button icon={<ExportOutlined />}>Export</Button>
              {selectedRowKeys.length > 0 && (
                <Button type="primary" icon={<MergeOutlined />}>
                  Bulk Action ({selectedRowKeys.length})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: "16px" }}
        >
          <TabPane tab="All PRs" key="all" />
          <TabPane tab={`Open (${stats.open})`} key="open" />
          <TabPane tab={`Draft (${stats.draft})`} key="draft" />
          <TabPane tab={`High Risk (${stats.highRisk})`} key="high-risk" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} pull requests`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default PullRequestsPage;
