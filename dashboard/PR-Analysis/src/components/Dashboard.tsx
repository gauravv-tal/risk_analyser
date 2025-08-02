import React from "react";
import { Card, Row, Col, Statistic, Progress } from "antd";
import {
  PullRequestOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { mockDashboardStats } from "../data/mockData";

const Dashboard: React.FC = () => {
  const stats = mockDashboardStats;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard Overview</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pull Requests"
              value={stats.totalPRs}
              prefix={<PullRequestOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="High Risk PRs"
              value={stats.highRiskPRs}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Risk Score"
              value={stats.averageRiskScore}
              precision={1}
              suffix="/ 10"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Test Coverage"
              value={stats.testCoverage}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Progress
              percent={stats.testCoverage}
              showInfo={false}
              strokeColor="#52c41a"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Quick Actions" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              hoverable
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => (window.location.href = "/pr-analysis")}
            >
              <BarChartOutlined style={{ fontSize: 48, color: "#1890ff" }} />
              <h3>Analyze Pull Request</h3>
              <p>
                Get comprehensive risk analysis and AI-powered test
                recommendations
              </p>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable style={{ textAlign: "center" }}>
              <SettingOutlined style={{ fontSize: 48, color: "#faad14" }} />
              <h3>Settings</h3>
              <p>Configure risk thresholds and analysis preferences</p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
