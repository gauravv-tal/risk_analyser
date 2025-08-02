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
  // DashboardOutlined,
  // SettingOutlined,
} from "@ant-design/icons";
import PRAnalysis from "./components/PRAnalysis";
// Hidden for now - keeping import for future use
// import Dashboard from "./components/Dashboard";
import "./App.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      key: "/pr-analysis",
      icon: <BarChartOutlined />,
      label: <Link to="/pr-analysis">PR Analysis</Link>,
    },
    // Hidden for now - keeping components intact for future use
    // {
    //   key: "/",
    //   icon: <DashboardOutlined />,
    //   label: <Link to="/">Dashboard</Link>,
    // },
    // {
    //   key: "/settings",
    //   icon: <SettingOutlined />,
    //   label: <Link to="/settings">Settings</Link>,
    // },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: "#001529",
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
          <Title level={4} style={{ color: "white", margin: 0 }}>
            {collapsed ? "RA" : "Risk Analyser"}
          </Title>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
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
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            AI-Powered Impact & Risk Dashboard
          </Title>
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
            {/* Make PR Analysis the default page */}
            <Route path="/" element={<PRAnalysis />} />
            <Route path="/pr-analysis" element={<PRAnalysis />} />
            {/* Hidden routes - keeping components for future use */}
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            {/* <Route path="/settings" element={<div>Settings coming soon...</div>} /> */}
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
