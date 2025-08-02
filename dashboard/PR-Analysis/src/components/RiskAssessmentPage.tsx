import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  List,
  Avatar,
  Typography,
  Button,
  Progress,
  Tag,
  Statistic,
  Alert,
  Space,
  Select,
} from "antd";
import {
  ExclamationCircleOutlined,
  AlertOutlined,
  FireOutlined,
  SecurityScanOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Risk assessment data from calorie-tracker context
const riskAssessmentData = {
  riskComponents: [
    {
      component: "Quantum Processing Module",
      risk: "critical",
      score: 9.2,
      status: "active",
      lastUpdated: "Aug 2, 2025",
      recommendations: 8,
      description:
        "Complex AI/ML integration with neural networks poses high computational and testing risks",
      riskFactors: [
        "Untested AI algorithms",
        "High complexity",
        "No unit tests",
        "Neural network dependencies",
      ],
    },
    {
      component: "Activity Tracking Service",
      risk: "medium",
      score: 6.7,
      status: "monitoring",
      lastUpdated: "Aug 2, 2025",
      recommendations: 3,
      description:
        "Data persistence changes and analytics accuracy require careful monitoring",
      riskFactors: [
        "Database schema changes",
        "Analytics logic",
        "Data validation",
      ],
    },
    {
      component: "Calorie Service Updates",
      risk: "low",
      score: 4.1,
      status: "review",
      lastUpdated: "Aug 1, 2025",
      recommendations: 1,
      description:
        "Minor service updates marked as 'DO NOT MERGE' for review purposes",
      riskFactors: ["Code review pending", "Service layer changes"],
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
  overallStats: {
    totalComponents: 6,
    highRiskComponents: 1,
    mediumRiskComponents: 1,
    lowRiskComponents: 4,
    averageRiskScore: 6.7,
    totalRecommendations: 12,
    pendingActions: 8,
  },
};

const RiskAssessmentPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "#ff4d4f";
      case "high":
        return "#ff7875";
      case "medium":
        return "#faad14";
      case "low":
        return "#52c41a";
      default:
        return "#8c8c8c";
    }
  };

  const getRiskTag = (risk: string) => {
    const colors = {
      critical: "red",
      high: "orange",
      medium: "yellow",
      low: "green",
    };
    return (
      <Tag color={colors[risk as keyof typeof colors]}>
        {risk.toUpperCase()}
      </Tag>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "monitoring":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "review":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      default:
        return <CheckCircleOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <SecurityScanOutlined /> Risk Assessment
        </Title>
        <Text type="secondary">
          Comprehensive risk analysis and mitigation recommendations
        </Text>
      </div>

      {/* Risk Overview Alert */}
      <Alert
        message="High Risk Components Detected"
        description="1 critical risk component requires immediate attention. Review quantum processing module implementation."
        type="warning"
        showIcon
        style={{ marginBottom: "24px" }}
        action={
          <Button
            size="small"
            type="primary"
            onClick={handleRefresh}
            loading={refreshing}
          >
            Review Now
          </Button>
        }
      />

      {/* Risk Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Components"
              value={riskAssessmentData.overallStats.totalComponents}
              prefix={<BugOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="High Risk"
              value={riskAssessmentData.overallStats.highRiskComponents}
              prefix={<FireOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Risk Score"
              value={riskAssessmentData.overallStats.averageRiskScore}
              precision={1}
              suffix="/10"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending Actions"
              value={riskAssessmentData.overallStats.pendingActions}
              prefix={<AlertOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title="Risk Components"
            extra={
              <Space>
                <Select
                  value={selectedTimeframe}
                  onChange={setSelectedTimeframe}
                  style={{ width: 120 }}
                >
                  <Option value="1d">Last 24h</Option>
                  <Option value="7d">Last 7 days</Option>
                  <Option value="30d">Last 30 days</Option>
                </Select>
                <Button onClick={handleRefresh} loading={refreshing}>
                  Refresh
                </Button>
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <List
              dataSource={riskAssessmentData.riskComponents}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small">
                      View Details
                    </Button>,
                    <Button size="small">Mitigate</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: getRiskColor(item.risk) }}
                        icon={getStatusIcon(item.status)}
                      >
                        {item.score}
                      </Avatar>
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong>{item.component}</Text>
                        {getRiskTag(item.risk)}
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: "8px" }}
                        >
                          {item.description}
                        </Paragraph>
                        <div style={{ marginBottom: "8px" }}>
                          <Text strong>Risk Factors: </Text>
                          {item.riskFactors.map((factor, index) => (
                            <Tag key={index} color="red">
                              {factor}
                            </Tag>
                          ))}
                        </div>
                        <Space
                          split={<span style={{ color: "#d9d9d9" }}>|</span>}
                        >
                          <Text type="secondary">
                            Last updated: {item.lastUpdated}
                          </Text>
                          <Text type="secondary">
                            {item.recommendations} recommendations
                          </Text>
                          <Text type="secondary">Status: {item.status}</Text>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="AI Risk Insights" style={{ marginBottom: "24px" }}>
            <List
              dataSource={riskAssessmentData.aiInsights}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor:
                            item.severity === "high"
                              ? "#ff4d4f"
                              : item.severity === "medium"
                              ? "#faad14"
                              : "#52c41a",
                        }}
                      >
                        <AlertOutlined />
                      </Avatar>
                    }
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 3 }}
                          style={{ marginBottom: "8px" }}
                        >
                          {item.description}
                        </Paragraph>
                        <div style={{ marginBottom: "8px" }}>
                          <Text strong>Recommendation: </Text>
                          <Text type="secondary">{item.recommendation}</Text>
                        </div>
                        <Text type="secondary">
                          Confidence: {item.confidence}%
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Risk Score Distribution */}
          <Card title="Risk Distribution">
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Text>Critical (9-10)</Text>
                <Text strong style={{ color: "#ff4d4f" }}>
                  1
                </Text>
              </div>
              <Progress percent={17} strokeColor="#ff4d4f" showInfo={false} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Text>Medium (5-8)</Text>
                <Text strong style={{ color: "#faad14" }}>
                  1
                </Text>
              </div>
              <Progress percent={17} strokeColor="#faad14" showInfo={false} />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Text>Low (0-4)</Text>
                <Text strong style={{ color: "#52c41a" }}>
                  4
                </Text>
              </div>
              <Progress percent={66} strokeColor="#52c41a" showInfo={false} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RiskAssessmentPage;
