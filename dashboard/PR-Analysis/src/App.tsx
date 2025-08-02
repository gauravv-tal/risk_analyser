import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import {
  BarChartOutlined,
  // Hidden for now - keeping imports for future use
  DashboardOutlined,
  SettingOutlined,
  BugOutlined,
  ExclamationCircleOutlined,
  MonitorOutlined,
} from "@ant-design/icons";
import PRAnalysis from "./components/PRAnalysis";
import EnhancedDashboard from "./components/EnhancedDashboard";
import PullRequestsPage from "./components/PullRequestsPage";
import SystemHealthPage from "./components/SystemHealthPage";
import RiskAssessmentPage from "./components/RiskAssessmentPage";
import CICDPage from "./components/CICDPage";
import "./App.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "/pull-requests",
      icon: <BugOutlined />,
      label: <Link to="/pull-requests">Pull Requests</Link>,
    },
    {
      key: "/pr-analysis",
      icon: <BarChartOutlined />,
      label: <Link to="/pr-analysis">Analysis</Link>,
    },
    {
      key: "/ci-cd",
      icon: <SettingOutlined />,
      label: <Link to="/ci-cd">CI/CD</Link>,
    },
    {
      key: "/risk-assessment",
      icon: <ExclamationCircleOutlined />,
      label: <Link to="/risk-assessment">Risk Assessment</Link>,
    },
    {
      key: "/system-health",
      icon: <MonitorOutlined />,
      label: <Link to="/system-health">System Health</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: "#001529",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          zIndex: 100,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Title level={4} style={{ color: "white", margin: 0 }}>
              {collapsed ? "RA" : "Risk Analyser"}
            </Title>
          </Link>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[
            location.pathname === "/" ? "/dashboard" : location.pathname,
          ]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            height: "64px",
          }}
        >
          {/* Header title removed to avoid duplication with page-specific headers */}
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 6,
          }}
        >
          <Routes>
            {/* Make Dashboard the default page */}
            <Route path="/" element={<EnhancedDashboard />} />
            <Route path="/dashboard" element={<EnhancedDashboard />} />
            <Route path="/pr-analysis" element={<PRAnalysis />} />
            <Route path="/pull-requests" element={<PullRequestsPage />} />
            <Route path="/ci-cd" element={<CICDPage />} />
            <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
            <Route path="/system-health" element={<SystemHealthPage />} />
            <Route
              path="/settings"
              element={<div>Settings coming soon...</div>}
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
