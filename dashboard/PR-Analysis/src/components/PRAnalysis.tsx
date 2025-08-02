import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Progress,
  Tag,
  Typography,
  Timeline,
  Button,
  message,
  // Tabs, // Hidden for now (only showing unit tests)
  // Badge, // Hidden for now (only showing unit tests)
  Space,
  Collapse,
  Skeleton,
  Pagination,
  Select,
} from "antd";
import {
  ExclamationCircleOutlined,
  CodeOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ApiOutlined,
  UserOutlined,
  LinkOutlined,
  SearchOutlined,
  GlobalOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  mockPullRequests,
  mockComplexityMetrics,
  mockImpactedModules,
  mockTestRecommendations,
  mockHistoricalData,
} from "../data/mockData";
import { PullRequest } from "../types";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

const PRAnalysis: React.FC = () => {
  const [prUrl, setPrUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzedPR, setAnalyzedPR] = useState<PullRequest | null>(null);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string>("");

  // Test recommendations state
  const [testSearchTerm, setTestSearchTerm] = useState("");
  // const [activeTestTab, setActiveTestTab] = useState("unit"); // Hidden for now (only showing unit tests)

  // Pagination and sorting state for test recommendations
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortBy, setSortBy] = useState("priority"); // priority, confidence, estimatedTime
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc

  const getRiskColor = (score: number) => {
    if (score >= 8) return "#ff4d4f";
    if (score >= 6) return "#faad14";
    return "#52c41a";
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return "High Risk";
    if (score >= 6) return "Medium Risk";
    return "Low Risk";
  };

  const getModuleIcon = (name: string) => {
    if (name.includes("Billing")) return <CodeOutlined />;
    if (name.includes("Payment")) return <ApiOutlined />;
    if (name.includes("Customer")) return <UserOutlined />;
    return <ToolOutlined />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ff4d4f";
      case "medium":
        return "#faad14";
      case "low":
        return "#52c41a";
      default:
        return "#1890ff";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "unit":
        return <ExclamationCircleOutlined />;
      case "integration":
        return <ApiOutlined />;
      case "e2e":
        return <GlobalOutlined />;
      default:
        return <CodeOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "unit":
        return "#1890ff";
      case "integration":
        return "#722ed1";
      case "e2e":
        return "#52c41a";
      default:
        return "#1890ff";
    }
  };

  const validatePRUrl = (url: string) => {
    if (!url.trim()) {
      setIsValidUrl(false);
      setUrlError("");
      return false;
    }

    // Enhanced validation for GitHub and GitLab PR URLs
    const githubPRPattern =
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+\/?(\?.*)?$/;
    const gitlabPRPattern =
      /^https:\/\/gitlab\.com\/[\w.-]+\/[\w.-]+(\/.*)?\/merge_requests\/\d+\/?(\?.*)?$/;

    const isValidGithub = githubPRPattern.test(url.trim());
    const isValidGitlab = gitlabPRPattern.test(url.trim());
    const isValid = isValidGithub || isValidGitlab;

    setIsValidUrl(isValid);

    if (!isValid && url.trim()) {
      if (url.includes("github.com")) {
        setUrlError(
          "Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123"
        );
      } else if (url.includes("gitlab.com")) {
        setUrlError(
          "Invalid GitLab MR URL format. Expected: https://gitlab.com/owner/repo/merge_requests/123"
        );
      } else {
        setUrlError("Please enter a valid GitHub or GitLab PR/MR URL");
      }
    } else {
      setUrlError("");
    }

    return isValid;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPrUrl(url);
    validatePRUrl(url);
  };

  const handlePRAnalysis = async (url: string) => {
    if (!isValidUrl) {
      message.error("Please enter a valid PR URL");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/analyze-pr', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prUrl: url })
      // });
      // const data = await response.json();

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // For now, use mock data but show that analysis happened
      setAnalyzedPR(mockPullRequests[0]);
      message.success("PR analysis completed successfully!");
    } catch (error) {
      message.error("Failed to analyze PR. Please try again.");
      console.error("PR Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Test recommendations filtering, sorting, and pagination - showing only unit tests for now
  const filteredAndSortedTestRecommendations = React.useMemo(() => {
    // Filter by search term and type
    let filtered = mockTestRecommendations.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
        item.testCategories?.some((category) =>
          category.toLowerCase().includes(testSearchTerm.toLowerCase())
        );
      // Only show unit tests for now (hiding integration and e2e)
      const matchesTab = item.type === "unit";
      return matchesSearch && matchesTab;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case "confidence":
          aValue = a.confidence || 0;
          bValue = b.confidence || 0;
          break;
        case "estimatedTime":
          aValue = a.estimatedEffort?.hours || parseInt(a.estimatedTime) || 0;
          bValue = b.estimatedEffort?.hours || parseInt(b.estimatedTime) || 0;
          break;
        case "coverage":
          aValue = a.coverage?.gap || 0;
          bValue = b.coverage?.gap || 0;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [testSearchTerm, sortBy, sortOrder]);

  // Paginated test recommendations
  const paginatedTestRecommendations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedTestRecommendations.slice(startIndex, endIndex);
  }, [filteredAndSortedTestRecommendations, currentPage, pageSize]);

  const getCountByType = (type: string) => {
    if (type === "all") return mockTestRecommendations.length;
    return mockTestRecommendations.filter((item) => item.type === type).length;
  };

  // Skeleton loading component
  const renderLoadingSkeleton = () => (
    <>
      <Row gutter={[24, 24]}>
        {/* Overall Risk Assessment Skeleton */}
        <Col span={16}>
          <Card title={<Skeleton.Input style={{ width: 200 }} size="small" />}>
            <Row align="middle">
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Skeleton.Avatar size={120} />
                  <br />
                  <br />
                  <Skeleton.Button size="small" />
                </div>
              </Col>
              <Col span={16}>
                <Skeleton paragraph={{ rows: 2 }} />
                <Skeleton.Button
                  style={{ width: "100%", marginTop: 16 }}
                  size="small"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Complexity Metrics Skeleton */}
        <Col span={8}>
          <Card title={<Skeleton.Input style={{ width: 150 }} size="small" />}>
            <div style={{ marginBottom: 20 }}>
              <Skeleton.Input size="small" />
              <br />
              <br />
              <Skeleton.Input style={{ width: 60 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <Skeleton.Input size="small" />
              <br />
              <br />
              <Skeleton.Input style={{ width: 40 }} />
            </div>
            <div>
              <Skeleton.Input size="small" />
              <br />
              <br />
              <Skeleton.Input style={{ width: 80 }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Impacted Modules Skeleton */}
        <Col span={24}>
          <Card title={<Skeleton.Input style={{ width: 180 }} size="small" />}>
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Col
                  xs={24} // 1 per row on mobile
                  sm={12} // 2 per row on small screens
                  md={12} // 2 per row on medium screens
                  lg={8} // 3 per row on large screens
                  xl={6} // 4 per row on extra large screens
                  xxl={6} // 4 per row on xxl screens
                  key={i}
                >
                  <Card size="small" style={{ height: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Skeleton.Avatar size="small" />
                      <Skeleton.Input
                        style={{ width: 120, marginLeft: 8 }}
                        size="small"
                      />
                      <Skeleton.Button
                        size="small"
                        style={{ marginLeft: "auto" }}
                      />
                    </div>
                    <Skeleton paragraph={{ rows: 3 }} />
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <Skeleton.Input style={{ width: "80%" }} size="small" />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Test Recommendations Skeleton */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card>
            <Skeleton.Input style={{ width: 300, marginBottom: 16 }} />
            <Skeleton paragraph={{ rows: 1 }} />

            {/* Search Skeleton */}
            <Card style={{ marginBottom: 24 }}>
              <Skeleton.Input style={{ width: "100%" }} size="large" />
            </Card>

            {/* Test Type Cards Skeleton */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {[1, 2, 3].map((i) => (
                <Col xs={24} sm={8} key={i}>
                  <Card hoverable style={{ textAlign: "center" }}>
                    <Skeleton.Avatar size={48} style={{ marginBottom: 8 }} />
                    <Skeleton.Input style={{ width: 100 }} size="small" />
                    <br />
                    <br />
                    <Skeleton.Input style={{ width: 30 }} />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Tabs Skeleton */}
            <div style={{ marginBottom: 24 }}>
              <Skeleton.Button style={{ marginRight: 16 }} />
              <Skeleton.Button style={{ marginRight: 16 }} />
              <Skeleton.Button style={{ marginRight: 16 }} />
              <Skeleton.Button />
            </div>

            {/* Test Recommendation Cards Skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Skeleton.Avatar size="small" />
                    <Skeleton.Input
                      style={{ width: 200, marginLeft: 8 }}
                      size="small"
                    />
                  </div>
                  <div>
                    <Skeleton.Button size="small" style={{ marginRight: 8 }} />
                    <Skeleton.Button size="small" style={{ marginRight: 8 }} />
                    <Skeleton.Input style={{ width: 80 }} size="small" />
                  </div>
                </div>
                <Skeleton paragraph={{ rows: 2 }} />
                <Skeleton.Button style={{ marginTop: 8 }} />
              </Card>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Historical Risk Analysis Skeleton */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title={<Skeleton.Input style={{ width: 200 }} size="small" />}>
            <div style={{ padding: "0 20px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", marginBottom: 20 }}>
                  <Skeleton.Avatar size="small" style={{ marginRight: 16 }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton.Input
                      style={{ width: 100, marginBottom: 8 }}
                      size="small"
                    />
                    <Skeleton paragraph={{ rows: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      <Row style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Title level={2} style={{ marginBottom: 8, fontSize: "28px" }}>
            PR Risk Analysis
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Enter a GitHub or GitLab pull request URL to analyze its risk and
            get AI-powered recommendations
          </Text>
        </Col>
      </Row>

      {/* PR URL Input */}
      <Card className="pr-input-container" style={{ marginBottom: 24 }}>
        <label className="pr-input-label">
          <LinkOutlined style={{ marginRight: 8 }} />
          Pull Request URL
        </label>
        <Search
          className="pr-input-field"
          placeholder="https://github.com/owner/repo/pull/123 or https://gitlab.com/owner/repo/-/merge_requests/123"
          enterButton={
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loading}
              disabled={!isValidUrl || loading}
            >
              Analyze PR
            </Button>
          }
          size="large"
          value={prUrl}
          onChange={handleUrlChange}
          onSearch={handlePRAnalysis}
          status={urlError ? "error" : undefined}
        />
        {urlError && (
          <Text
            type="danger"
            style={{ fontSize: "14px", marginTop: 4, display: "block" }}
          >
            {urlError}
          </Text>
        )}
        {isValidUrl && prUrl && !urlError && (
          <Text
            type="success"
            style={{ fontSize: "14px", marginTop: 4, display: "block" }}
          >
            ✓ Valid PR URL detected
          </Text>
        )}
        <Text
          type="secondary"
          style={{ fontSize: "14px", marginTop: 8, display: "block" }}
        >
          Supported platforms: GitHub, GitLab
        </Text>
      </Card>

      {/* Show loading skeleton while analyzing */}
      {loading && (
        <div>
          <Card
            style={{ marginBottom: 24, textAlign: "center", padding: "20px" }}
          >
            <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
              🔍 Analyzing Pull Request...
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Please wait while we analyze the risk and generate test
              recommendations
            </Text>
          </Card>
          {renderLoadingSkeleton()}
        </div>
      )}

      {/* Show analysis results only if PR is analyzed and not loading */}
      {analyzedPR && !loading && (
        <>
          <Row gutter={[24, 24]}>
            {/* Overall Risk Assessment */}
            <Col span={16}>
              <Card
                title={
                  <span style={{ fontSize: "18px" }}>
                    Overall Risk Assessment
                  </span>
                }
              >
                <Row align="middle">
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <Title
                        level={1}
                        className="large-risk-score"
                        style={{
                          color: getRiskColor(analyzedPR.riskScore),
                          margin: 0,
                        }}
                      >
                        {analyzedPR.riskScore}/10
                      </Title>
                      <Tag
                        color={getRiskColor(analyzedPR.riskScore)}
                        style={{
                          fontSize: 16,
                          padding: "4px 12px",
                          marginTop: 8,
                        }}
                      >
                        {getRiskLevel(analyzedPR.riskScore)}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={16}>
                    <Text style={{ fontSize: "16px" }}>
                      {analyzedPR.description ||
                        "This PR affects core billing logic and may impact payment processing"}
                    </Text>
                    <Progress
                      percent={(analyzedPR.riskScore / 10) * 100}
                      strokeColor={getRiskColor(analyzedPR.riskScore)}
                      showInfo={false}
                      style={{ marginTop: 16 }}
                      strokeWidth={8}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Complexity Metrics */}
            <Col span={8}>
              <Card
                title={
                  <span style={{ fontSize: "18px" }}>Complexity Metrics</span>
                }
              >
                <div style={{ marginBottom: 20 }}>
                  <Text strong style={{ fontSize: "16px" }}>
                    Cyclomatic Complexity
                  </Text>
                  <br />
                  <Text className="complexity-metric">
                    {mockComplexityMetrics.cyclomaticComplexity}
                  </Text>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Text strong style={{ fontSize: "16px" }}>
                    Cognitive Complexity
                  </Text>
                  <br />
                  <Text className="complexity-metric">
                    {mockComplexityMetrics.cognitiveComplexity}
                  </Text>
                </div>
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    Maintainability Index
                  </Text>
                  <br />
                  <Text className="complexity-metric">
                    {mockComplexityMetrics.maintainabilityIndex}/100
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            {/* Impacted Modules */}
            <Col span={24}>
              <Card
                title={
                  <span style={{ fontSize: "18px" }}>Impacted Modules</span>
                }
              >
                <Row gutter={[16, 16]}>
                  {mockImpactedModules.map((module, index) => (
                    <Col
                      xs={24} // 1 per row on mobile
                      sm={12} // 2 per row on small screens
                      md={12} // 2 per row on medium screens
                      lg={8} // 3 per row on large screens
                      xl={6} // 4 per row on extra large screens
                      xxl={6} // 4 per row on xxl screens
                      key={index}
                    >
                      <Card
                        size="small"
                        className="module-card"
                        style={{
                          height: "100%", // Make all cards same height
                          borderLeft: `4px solid ${
                            module.riskLevel === "high"
                              ? "#ff4d4f"
                              : module.riskLevel === "medium"
                              ? "#faad14"
                              : "#52c41a"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          {getModuleIcon(module.name)}
                          <Text
                            strong
                            style={{ marginLeft: 8, fontSize: "16px" }}
                          >
                            {module.name}
                          </Text>
                          <Tag
                            color={
                              module.riskLevel === "high"
                                ? "red"
                                : module.riskLevel === "medium"
                                ? "orange"
                                : "green"
                            }
                            style={{ marginLeft: "auto", fontSize: "14px" }}
                          >
                            {module.riskLevel}
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          {module.description}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          <strong>Dependencies:</strong>{" "}
                          {module.dependencies.join(", ")}
                        </Text>

                        {/* Show additional metrics if available */}
                        {module.metrics && (
                          <div
                            className="module-metrics"
                            style={{
                              marginTop: 8,
                              paddingTop: 8,
                              borderTop: "1px solid #f0f0f0",
                            }}
                          >
                            <Text type="secondary">
                              <strong>Lines:</strong>{" "}
                              {module.metrics.linesChanged} |{" "}
                              <strong>Functions:</strong>{" "}
                              {module.metrics.functionsModified} |{" "}
                              <strong>Coverage:</strong>{" "}
                              {module.metrics.testCoverageImpact > 0 ? "+" : ""}
                              {module.metrics.testCoverageImpact}%
                            </Text>
                          </div>
                        )}

                        {/* Show confidence score if available */}
                        {module.confidence && (
                          <div
                            className="module-confidence"
                            style={{ marginTop: 4 }}
                          >
                            <Text type="secondary">
                              <strong>Confidence:</strong>{" "}
                              {Math.round(module.confidence * 100)}%
                            </Text>
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Comprehensive Test Recommendations Section */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card>
                <Title level={3} style={{ marginBottom: 8, fontSize: "24px" }}>
                  AI-Generated Test Recommendations
                </Title>
                <Paragraph
                  type="secondary"
                  style={{ marginBottom: 24, fontSize: "16px" }}
                >
                  Based on your PR changes, here are intelligent test
                  recommendations to ensure code quality and prevent
                  regressions.
                </Paragraph>

                {/* Test Search */}
                <Card style={{ marginBottom: 24 }}>
                  <Search
                    placeholder="Search test recommendations..."
                    prefix={<SearchOutlined />}
                    size="large"
                    value={testSearchTerm}
                    onChange={(e) => setTestSearchTerm(e.target.value)}
                    style={{ marginBottom: 16 }}
                  />
                </Card>

                {/* Test Recommendations Controls */}
                <Card
                  className="test-recommendation-controls"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                      <div>
                        <Text strong style={{ marginRight: 8 }}>
                          Sort by:
                        </Text>
                        <Select
                          value={sortBy}
                          onChange={setSortBy}
                          style={{ width: 120 }}
                          size="small"
                        >
                          <Select.Option value="priority">
                            Priority
                          </Select.Option>
                          <Select.Option value="confidence">
                            Confidence
                          </Select.Option>
                          <Select.Option value="estimatedTime">
                            Time
                          </Select.Option>
                          <Select.Option value="coverage">
                            Coverage Gap
                          </Select.Option>
                        </Select>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <div>
                        <Text strong style={{ marginRight: 8 }}>
                          Order:
                        </Text>
                        <Select
                          value={sortOrder}
                          onChange={setSortOrder}
                          style={{ width: 100 }}
                          size="small"
                        >
                          <Select.Option value="desc">
                            High to Low
                          </Select.Option>
                          <Select.Option value="asc">Low to High</Select.Option>
                        </Select>
                      </div>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                      <div style={{ textAlign: "right" }}>
                        <Text type="secondary">
                          Showing {paginatedTestRecommendations.length} of{" "}
                          {filteredAndSortedTestRecommendations.length}{" "}
                          recommendations
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Test Type Summary Cards - Only Unit Tests for now */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} lg={8}>
                    <Card
                      style={{
                        textAlign: "center",
                        borderColor: "#1890ff",
                        backgroundColor: "#f6ffed",
                      }}
                    >
                      <ExclamationCircleOutlined
                        style={{
                          fontSize: 32,
                          color: "#1890ff",
                          marginBottom: 8,
                        }}
                      />
                      <Title level={4} style={{ margin: 0 }}>
                        Unit Tests
                      </Title>
                      <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                        {getCountByType("unit")}
                      </Title>
                    </Card>
                  </Col>
                  {/* Hidden for now - Integration and E2E tests */}
                  {/* 
                  <Col xs={24} sm={8}>
                    <Card
                      hoverable
                      style={{
                        textAlign: "center",
                        borderColor:
                          activeTestTab === "integration"
                            ? "#722ed1"
                            : undefined,
                        backgroundColor:
                          activeTestTab === "integration"
                            ? "#f9f0ff"
                            : undefined,
                      }}
                      onClick={() =>
                        setActiveTestTab(
                          activeTestTab === "integration"
                            ? "all"
                            : "integration"
                        )
                      }
                    >
                      <ApiOutlined
                        style={{
                          fontSize: 32,
                          color: "#722ed1",
                          marginBottom: 8,
                        }}
                      />
                      <Title level={4} style={{ margin: 0 }}>
                        Integration Tests
                      </Title>
                      <Title level={2} style={{ margin: 0, color: "#722ed1" }}>
                        {getCountByType("integration")}
                      </Title>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card
                      hoverable
                      style={{
                        textAlign: "center",
                        borderColor:
                          activeTestTab === "e2e" ? "#52c41a" : undefined,
                        backgroundColor:
                          activeTestTab === "e2e" ? "#f6ffed" : undefined,
                      }}
                      onClick={() =>
                        setActiveTestTab(
                          activeTestTab === "e2e" ? "all" : "e2e"
                        )
                      }
                    >
                      <GlobalOutlined
                        style={{
                          fontSize: 32,
                          color: "#52c41a",
                          marginBottom: 8,
                        }}
                      />
                      <Title level={4} style={{ margin: 0 }}>
                        E2E Tests
                      </Title>
                      <Title level={2} style={{ margin: 0, color: "#52c41a" }}>
                        {getCountByType("e2e")}
                      </Title>
                    </Card>
                  </Col>
                  */}
                </Row>

                {/* Filter Tabs - Hidden for now (only showing unit tests) */}
                {/* 
                <Tabs
                  activeKey={activeTestTab}
                  onChange={setActiveTestTab}
                  style={{ marginBottom: 24 }}
                  items={[
                    {
                      key: "all",
                      label: (
                        <Badge count={getCountByType("all")} offset={[10, 0]}>
                          ALL ({getCountByType("all")})
                        </Badge>
                      ),
                    },
                    {
                      key: "unit",
                      label: (
                        <Badge count={getCountByType("unit")} offset={[10, 0]}>
                          UNIT ({getCountByType("unit")})
                        </Badge>
                      ),
                    },
                    {
                      key: "integration",
                      label: (
                        <Badge
                          count={getCountByType("integration")}
                          offset={[10, 0]}
                        >
                          INTEGRATION ({getCountByType("integration")})
                        </Badge>
                      ),
                    },
                    {
                      key: "e2e",
                      label: (
                        <Badge count={getCountByType("e2e")} offset={[10, 0]}>
                          E2E ({getCountByType("e2e")})
                        </Badge>
                      ),
                    },
                  ]}
                />
                */}

                {/* Detailed Test Recommendations */}
                <div className="test-recommendations-container">
                  {paginatedTestRecommendations.map((item) => (
                    <Card
                      key={item.id}
                      style={{ marginBottom: 16 }}
                      className={`test-recommendation-card test-recommendation-item test-recommendation-priority-${item.priority}`}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {getTypeIcon(item.type)}
                            <Text
                              strong
                              style={{ marginLeft: 8, fontSize: "16px" }}
                            >
                              {item.title}
                            </Text>
                          </div>
                          <Space>
                            <Tag
                              color={getTypeColor(item.type)}
                              style={{ fontSize: "14px" }}
                            >
                              {item.type}
                            </Tag>
                            <Tag
                              color={getPriorityColor(item.priority)}
                              style={{ fontSize: "14px" }}
                            >
                              {item.priority}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {item.estimatedTime}
                            </Text>
                          </Space>
                        </div>
                      }
                    >
                      <Paragraph style={{ marginBottom: 16, fontSize: "16px" }}>
                        {item.description}
                      </Paragraph>

                      {/* Enhanced Test Information */}
                      <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                        {item.confidence && (
                          <Col xs={24} sm={12} md={8}>
                            <div className="test-summary-badge">
                              <CheckCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                              <span>
                                Confidence: {Math.round(item.confidence * 100)}%
                              </span>
                            </div>
                          </Col>
                        )}
                        {item.coverage && (
                          <Col xs={24} sm={12} md={8}>
                            <div className="test-summary-badge">
                              <WarningOutlined style={{ color: "#faad14" }} />
                              <span>Coverage Gap: {item.coverage.gap}%</span>
                            </div>
                          </Col>
                        )}
                        {item.estimatedEffort && (
                          <Col xs={24} sm={12} md={8}>
                            <div className="test-summary-badge">
                              <ClockCircleOutlined
                                style={{ color: "#1890ff" }}
                              />
                              <span>
                                Effort: {item.estimatedEffort.hours}h (
                                {item.estimatedEffort.complexity})
                              </span>
                            </div>
                          </Col>
                        )}
                      </Row>

                      {/* Test Categories */}
                      {item.testCategories &&
                        item.testCategories.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <Text
                              strong
                              style={{ marginRight: 8, fontSize: "14px" }}
                            >
                              Categories:
                            </Text>
                            {item.testCategories.map((category, index) => (
                              <Tag
                                key={index}
                                color="blue"
                                style={{ marginBottom: 4 }}
                              >
                                {category
                                  .replace(/-/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Tag>
                            ))}
                          </div>
                        )}

                      {/* Rationale */}
                      {item.rationale && (
                        <div
                          style={{
                            marginBottom: 16,
                            padding: "8px 12px",
                            backgroundColor: "#f6f8fa",
                            borderRadius: "4px",
                            borderLeft: "3px solid #1890ff",
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{ fontSize: "14px", fontStyle: "italic" }}
                          >
                            <strong>AI Rationale:</strong> {item.rationale}
                          </Text>
                        </div>
                      )}

                      <Collapse ghost>
                        <Panel
                          header={
                            <Button
                              type="link"
                              style={{ padding: 0, fontSize: 16 }}
                            >
                              View Test Code <DownOutlined />
                            </Button>
                          }
                          key="1"
                        >
                          <Card
                            size="small"
                            className="test-code-block"
                            style={{
                              backgroundColor: "#f6f8fa",
                              border: "1px solid #e1e4e8",
                            }}
                          >
                            <div style={{ marginBottom: 8 }}>
                              <Tag color="blue">{item.testCode.language}</Tag>
                              <Tag color="green">{item.testCode.framework}</Tag>
                            </div>
                            <pre
                              style={{
                                margin: 0,
                                fontSize: 14,
                                fontFamily:
                                  'Monaco, Menlo, "Ubuntu Mono", monospace',
                                overflow: "auto",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {item.testCode.code}
                            </pre>
                          </Card>
                        </Panel>
                      </Collapse>
                    </Card>
                  ))}
                </div>

                {filteredAndSortedTestRecommendations.length === 0 && (
                  <Card style={{ textAlign: "center", padding: 40 }}>
                    <Text type="secondary" style={{ fontSize: "16px" }}>
                      No test recommendations found matching your criteria.
                    </Text>
                  </Card>
                )}

                {/* Bottom Pagination */}
                {filteredAndSortedTestRecommendations.length > pageSize && (
                  <Card style={{ marginTop: 16, textAlign: "center" }}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredAndSortedTestRecommendations.length}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={true}
                      showQuickJumper={
                        filteredAndSortedTestRecommendations.length > 50
                      }
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} recommendations`
                      }
                      onShowSizeChange={(current, size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      pageSizeOptions={["5", "10", "20", "50"]}
                    />
                  </Card>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            {/* Historical Risk Analysis */}
            <Col span={24}>
              <Card
                title={
                  <span style={{ fontSize: "18px" }}>
                    Historical Risk Analysis
                  </span>
                }
              >
                <Timeline>
                  {mockHistoricalData.map((data, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        data.riskScore >= 8
                          ? "red"
                          : data.riskScore >= 6
                          ? "orange"
                          : "green"
                      }
                      dot={
                        data.riskScore >= 8 ? (
                          <WarningOutlined
                            style={{ color: "red", fontSize: "16px" }}
                          />
                        ) : (
                          <CheckCircleOutlined
                            style={{ color: "green", fontSize: "16px" }}
                          />
                        )
                      }
                    >
                      <div>
                        <Text strong style={{ fontSize: "15px" }}>
                          {data.date}
                        </Text>
                        <br />
                        <Text style={{ fontSize: "15px" }}>
                          Risk Score: {data.riskScore}/10
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          {data.pullRequestCount} PRs, {data.hotfixCount}{" "}
                          hotfixes
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          {data.description}
                        </Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Message when no PR is analyzed yet */}
      {!analyzedPR && !loading && (
        <Card style={{ textAlign: "center", padding: "60px 20px" }}>
          <LinkOutlined
            style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
          />
          <Title level={3} type="secondary">
            Enter a PR URL to Start Analysis
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Paste a GitHub or GitLab pull request URL above to get comprehensive
            risk analysis, complexity metrics, and AI-powered test
            recommendations.
          </Text>
        </Card>
      )}
    </div>
  );
};

export default PRAnalysis;
