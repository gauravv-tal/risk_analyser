import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
  FileOutlined,
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  mockPullRequests,
  mockComplexityMetrics,
  mockImpactedModules,
  mockHistoricalData,
} from "../data/mockData";
import { PullRequest, TestRecommendation, ImpactedModule } from "../types";
import { prAnalysisApi, transformers } from "../services/api";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

// Mock files changes data
const mockFilesChanged = [
  {
    id: 1,
    fileName: "src/App.tsx",
    filePath: "src/App.tsx",
    status: "modified",
    additions: 24,
    deletions: 18,
    changes: [
      {
        type: "addition",
        lineNumber: 45,
        content:
          "import { QuantumProcessor } from './quantum/QuantumProcessor';",
        context: "after line 44",
      },
      {
        type: "addition",
        lineNumber: 46,
        content: "import { AIVisionAnalyzer } from './ai/AIVisionAnalyzer';",
        context: "after line 45",
      },
      {
        type: "deletion",
        lineNumber: 67,
        content: "// TODO: Remove legacy processing logic",
        context: "removed old comment",
      },
      {
        type: "modification",
        lineNumber: 89,
        oldContent: "const processCalories = (data) => {",
        newContent: "const processCalories = async (data) => {",
        context: "made function async",
      },
      {
        type: "addition",
        lineNumber: 90,
        content:
          "  const quantumResult = await QuantumProcessor.analyze(data);",
        context: "added quantum processing",
      },
      {
        type: "addition",
        lineNumber: 91,
        content:
          "  const aiAnalysis = await AIVisionAnalyzer.processImage(data.image);",
        context: "added AI vision analysis",
      },
    ],
  },
  {
    id: 2,
    fileName: "src/quantum/QuantumModule.ts",
    filePath: "src/quantum/QuantumModule.ts",
    status: "added",
    additions: 156,
    deletions: 0,
    changes: [
      {
        type: "addition",
        lineNumber: 1,
        content: "import { Injectable } from '@nestjs/common';",
        context: "new file - imports",
      },
      {
        type: "addition",
        lineNumber: 2,
        content: "import { QuantumService } from './quantum.service';",
        context: "new file - imports",
      },
      {
        type: "addition",
        lineNumber: 15,
        content: "@Injectable()",
        context: "class decorator",
      },
      {
        type: "addition",
        lineNumber: 16,
        content: "export class QuantumProcessor {",
        context: "class definition",
      },
      {
        type: "addition",
        lineNumber: 25,
        content:
          "  async analyzeCalorieData(input: CalorieData): Promise<QuantumResult> {",
        context: "main processing method",
      },
    ],
  },
  {
    id: 3,
    fileName: "src/services/calorie.service.ts",
    filePath: "src/services/calorie.service.ts",
    status: "modified",
    additions: 8,
    deletions: 12,
    changes: [
      {
        type: "deletion",
        lineNumber: 34,
        content: "// Legacy calculation method",
        context: "removed old comment",
      },
      {
        type: "deletion",
        lineNumber: 35,
        content: "const basicCalories = weight * 0.8;",
        context: "removed basic calculation",
      },
      {
        type: "addition",
        lineNumber: 35,
        content:
          "const advancedCalories = await this.quantumProcessor.calculate(weight, activity);",
        context: "added quantum calculation",
      },
      {
        type: "modification",
        lineNumber: 45,
        oldContent: "return { calories: basicCalories };",
        newContent: "return { calories: advancedCalories, confidence: 0.95 };",
        context: "updated return value",
      },
    ],
  },
];

const PRAnalysis: React.FC = () => {
  const location = useLocation();
  const [prUrl, setPrUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzedPR, setAnalyzedPR] = useState<PullRequest | null>(null);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string>("");

  // Test recommendations state
  const [testSearchTerm, setTestSearchTerm] = useState("");
  const [apiTestRecommendations, setApiTestRecommendations] = useState<
    TestRecommendation[]
  >([]);
  const [loadingTestRecommendations, setLoadingTestRecommendations] =
    useState<boolean>(false);
  // const [activeTestTab, setActiveTestTab] = useState("unit"); // Hidden for now (only showing unit tests)

  // API impacted modules state (derived from API response file names)
  const [apiImpactedModules, setApiImpactedModules] = useState<
    ImpactedModule[]
  >([]);

  // PR Summary state
  const [prSummary, setPrSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

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

  // Get risk factors based on file type and name
  const getRiskFactorsForFile = useCallback((fileName: string): string[] => {
    const factors = [];
    const name = fileName.toLowerCase();

    if (name.includes("service"))
      factors.push("Business logic changes", "Service layer impact");
    if (name.includes("controller"))
      factors.push("API endpoint changes", "Request/response handling");
    if (name.includes("database") || name.includes("db"))
      factors.push("Data persistence changes");
    if (name.includes("security") || name.includes("auth"))
      factors.push("Security implications");
    if (name.includes("payment") || name.includes("billing"))
      factors.push("Financial logic changes");
    if (name.includes("user") || name.includes("account"))
      factors.push("User experience impact");
    if (name.includes("config") || name.includes("setting"))
      factors.push("Configuration changes");

    return factors.length > 0 ? factors : ["Code structure changes"];
  }, []);

  // Create module information from file name
  const createModuleFromFileName = useCallback(
    (fileName: string): ImpactedModule => {
      const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
      // const extension = fileName.split(".").pop()?.toLowerCase() || ""; // For future use

      // Determine risk level based on file name patterns
      let riskLevel: "high" | "medium" | "low" = "medium";
      if (
        fileName.toLowerCase().includes("test") ||
        fileName.toLowerCase().includes("spec")
      ) {
        riskLevel = "low";
      } else if (
        fileName.toLowerCase().includes("service") ||
        fileName.toLowerCase().includes("controller")
      ) {
        riskLevel = "high";
      } else if (
        fileName.toLowerCase().includes("util") ||
        fileName.toLowerCase().includes("helper")
      ) {
        riskLevel = "low";
      }

      return {
        id: fileName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase(),
        name: nameWithoutExtension.replace(/([A-Z])/g, " $1").trim(),
        riskLevel,
        confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        description: `Module for ${nameWithoutExtension} functionality`,
        affectedFiles: [fileName],
        dependencies: [],
        metrics: {
          linesChanged: Math.floor(Math.random() * 100) + 10,
          functionsModified: Math.floor(Math.random() * 5) + 1,
          testCoverageImpact: Math.floor(Math.random() * 20) - 10,
        },
        riskFactors: getRiskFactorsForFile(fileName),
      };
    },
    [getRiskFactorsForFile]
  );

  // Transform API response data into impacted modules based on file names
  const transformApiDataToImpactedModules = useCallback(
    (apiData: any): ImpactedModule[] => {
      if (!apiData || !apiData.testRecommendations) return [];

      // Extract unique file names from test recommendations (after transformation)
      const fileMap = new Map<string, any>();

      apiData.testRecommendations.forEach((test: any) => {
        test.relatedFiles?.forEach((fileName: string) => {
          if (!fileMap.has(fileName)) {
            // Create module based on file name
            const moduleInfo = createModuleFromFileName(fileName);
            fileMap.set(fileName, moduleInfo);
          }
        });
      });

      return Array.from(fileMap.values());
    },
    [createModuleFromFileName]
  );

  // Transform raw API response into impacted modules (before UI transformation)
  const transformRawApiDataToImpactedModules = useCallback(
    (rawApiData: any): ImpactedModule[] => {
      if (!rawApiData || !rawApiData.data) return [];

      // Extract file names from raw API data (id field contains file names)
      const fileMap = new Map<string, any>();

      rawApiData.data.forEach((item: any) => {
        const fileName = item.id;
        if (fileName && !fileMap.has(fileName)) {
          const moduleInfo = createModuleFromFileName(fileName);
          fileMap.set(fileName, moduleInfo);
        }
      });

      return Array.from(fileMap.values());
    },
    [createModuleFromFileName]
  );

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

  const handlePRAnalysis = useCallback(
    async (url: string) => {
      if (!isValidUrl) {
        message.error("Please enter a valid PR URL");
        return;
      }

      // Extract PR_ID from URL
      const prId = transformers.extractPrId(url);
      if (!prId) {
        message.error("Could not extract PR ID from URL");
        return;
      }

      setLoading(true);
      setLoadingTestRecommendations(true);
      setLoadingSummary(true);

      try {
        // Call both APIs in parallel for better performance
        const [testRecommendationsData, summaryData] = await Promise.allSettled(
          [
            prAnalysisApi.retrieveTestRecommendations(prId),
            prAnalysisApi.retrievePRSummary(prId),
          ]
        );

        // Handle test recommendations response
        const testRecommendationsResult =
          testRecommendationsData.status === "fulfilled"
            ? testRecommendationsData.value
            : null;

        // Handle summary response
        if (summaryData.status === "fulfilled") {
          setPrSummary(summaryData.value);
          console.log("✅ Summary data loaded successfully");
        } else {
          console.error("Summary API failed:", summaryData.reason);
          setPrSummary(null);

          // Handle specific summary API errors
          if (summaryData.reason?.response?.data) {
            const errorData = summaryData.reason.response.data;
            if (errorData.status === "error") {
              if (errorData.message.includes("PR ID cannot be empty")) {
                message.error("Invalid PR ID format");
              } else if (errorData.message.includes("Summary data not found")) {
                message.warning(`No summary data available for PR-${prId}`);
              } else {
                message.warning(`Summary API: ${errorData.message}`);
              }
            }
          } else {
            message.warning(`Could not load summary data for PR-${prId}`);
          }
        }

        // Handle test recommendations data
        if (
          testRecommendationsResult &&
          testRecommendationsResult.testRecommendations &&
          testRecommendationsResult.testRecommendations.length > 0
        ) {
          setApiTestRecommendations(
            testRecommendationsResult.testRecommendations
          );

          // Transform API data into impacted modules based on file names
          let impactedModules: ImpactedModule[] = [];
          if (testRecommendationsResult.rawApiData) {
            // Use raw API data to extract file names
            impactedModules = transformRawApiDataToImpactedModules(
              testRecommendationsResult.rawApiData
            );
          } else {
            // Fallback to transformed data
            impactedModules = transformApiDataToImpactedModules(
              testRecommendationsResult
            );
          }
          setApiImpactedModules(impactedModules);

          message.success(
            `Retrieved ${testRecommendationsResult.testRecommendations.length} test recommendations for PR-${prId}!`
          );
        } else {
          // API returned success but no test recommendations
          setApiTestRecommendations([]);
          setApiImpactedModules([]);
          message.info(`No test recommendations found for PR-${prId}`);
        }

        // Set analyzed PR data (using mock data for now for other sections)
        setAnalyzedPR(mockPullRequests[0]);
      } catch (error: any) {
        console.error("PR Analysis Error:", error);

        // Clear any existing data
        setApiTestRecommendations([]);
        setApiImpactedModules([]);
        setPrSummary(null);
        setAnalyzedPR(mockPullRequests[0]);

        // Handle specific error responses
        if (error?.response?.data) {
          const errorData = error.response.data;
          if (errorData.status === "error") {
            if (errorData.message.includes("No data found for PR_ID")) {
              message.error(
                `PR not found: PR-${prId} does not exist in the system`
              );
            } else if (errorData.message.includes("No files found for PR_ID")) {
              message.error(`No files available for analysis in PR-${prId}`);
            } else {
              message.error(`API Error: ${errorData.message}`);
            }
          } else {
            message.error(
              `Failed to retrieve test recommendations for PR-${prId}`
            );
          }
        } else if (error?.message) {
          message.error(error.message);
        } else {
          message.error(`Failed to retrieve test recommendations for ${prId}`);
        }
      } finally {
        setLoading(false);
        setLoadingTestRecommendations(false);
        setLoadingSummary(false);
      }
    },
    [
      isValidUrl,
      transformApiDataToImpactedModules,
      transformRawApiDataToImpactedModules,
    ]
  );

  // Handle URL population when navigating from Dashboard (but don't auto-analyze)
  useEffect(() => {
    const state = location.state as { prUrl?: string; autoAnalyze?: boolean };
    if (state?.prUrl) {
      const prUrlFromState = state.prUrl;
      setPrUrl(prUrlFromState);
      // Validate the URL but don't trigger analysis automatically
      validatePRUrl(prUrlFromState);
      // Clear the location state to prevent re-processing
      window.history.replaceState({}, document.title);
    }
  }, [location.state]); // Removed handlePRAnalysis dependency to prevent infinite loop

  // Test recommendations filtering, sorting, and pagination - showing only unit tests for now
  const filteredAndSortedTestRecommendations = React.useMemo(() => {
    // Only use API data - no fallback to mock data
    const testData = apiTestRecommendations;

    // If no API data, return empty array
    if (!testData || testData.length === 0) {
      return [];
    }

    // Filter by search term and type
    let filtered = testData.filter((item) => {
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
  }, [testSearchTerm, sortBy, sortOrder, apiTestRecommendations]);

  // Paginated test recommendations
  const paginatedTestRecommendations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedTestRecommendations.slice(startIndex, endIndex);
  }, [filteredAndSortedTestRecommendations, currentPage, pageSize]);

  const getCountByType = (type: string) => {
    // Only use API data - no fallback to mock data
    const testData = apiTestRecommendations;
    if (!testData || testData.length === 0) return 0;
    if (type === "all") return testData.length;
    return testData.filter((item) => item.type === type).length;
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
          {/* PR Summary Section */}
          {prSummary && prSummary.data && (
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card
                  title={
                    <span style={{ fontSize: "18px" }}>
                      📊 PR Summary
                      {loadingSummary && (
                        <span
                          style={{
                            marginLeft: 12,
                            fontSize: "14px",
                            color: "#1890ff",
                          }}
                        >
                          Loading...
                        </span>
                      )}
                    </span>
                  }
                  style={{
                    background:
                      "linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)",
                    border: "1px solid #e8f4fd",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#1890ff",
                          }}
                        >
                          {prSummary.data.totalFiles || 0}
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          Files Changed
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#52c41a",
                          }}
                        >
                          {prSummary.data.linesChanged || 0}
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          Lines Changed
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color:
                              prSummary.data.riskScore > 70
                                ? "#ff4d4f"
                                : prSummary.data.riskScore > 40
                                ? "#faad14"
                                : "#52c41a",
                          }}
                        >
                          {prSummary.data.riskScore || 0}%
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          Risk Score
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#722ed1",
                          }}
                        >
                          {prSummary.data.testCoverage || 0}%
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          Test Coverage
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {prSummary.data.overallAssessment && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        backgroundColor: "#f0f2f5",
                        borderRadius: "6px",
                        borderLeft: "4px solid #1890ff",
                      }}
                    >
                      <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
                        <strong>Assessment:</strong>{" "}
                        {prSummary.data.overallAssessment}
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          )}

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
                  {(apiImpactedModules.length > 0
                    ? apiImpactedModules
                    : mockImpactedModules
                  ).map((module, index) => (
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

          {/* Files Changed Section */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card>
                <Title level={3} style={{ marginBottom: 8, fontSize: "24px" }}>
                  📁 Files Changed
                </Title>
                <Paragraph
                  type="secondary"
                  style={{ marginBottom: 24, fontSize: "16px" }}
                >
                  {mockFilesChanged.length} files modified in this pull request
                  with detailed diff view.
                </Paragraph>

                <Collapse
                  defaultActiveKey={["1"]}
                  expandIconPosition="end"
                  style={{ background: "transparent" }}
                >
                  {mockFilesChanged.map((file) => (
                    <Panel
                      key={file.id}
                      header={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {file.status === "added" ? (
                              <FileOutlined style={{ color: "#52c41a" }} />
                            ) : file.status === "deleted" ? (
                              <FileOutlined style={{ color: "#ff4d4f" }} />
                            ) : (
                              <EditOutlined style={{ color: "#faad14" }} />
                            )}
                            <Text strong style={{ fontSize: "16px" }}>
                              {file.fileName}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            {file.status === "added" && (
                              <Tag color="green">NEW FILE</Tag>
                            )}
                            {file.status === "deleted" && (
                              <Tag color="red">DELETED</Tag>
                            )}
                            {file.status === "modified" && (
                              <Tag color="orange">MODIFIED</Tag>
                            )}
                            {file.additions > 0 && (
                              <Space>
                                <PlusOutlined
                                  style={{ color: "#52c41a", fontSize: "12px" }}
                                />
                                <Text
                                  style={{ color: "#52c41a", fontSize: "14px" }}
                                >
                                  +{file.additions}
                                </Text>
                              </Space>
                            )}
                            {file.deletions > 0 && (
                              <Space>
                                <MinusOutlined
                                  style={{ color: "#ff4d4f", fontSize: "12px" }}
                                />
                                <Text
                                  style={{ color: "#ff4d4f", fontSize: "14px" }}
                                >
                                  -{file.deletions}
                                </Text>
                              </Space>
                            )}
                          </div>
                        </div>
                      }
                      style={{
                        marginBottom: "16px",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          background: "#ffffff",
                          borderRadius: "6px",
                          padding: "16px",
                        }}
                      >
                        <Text
                          type="secondary"
                          style={{ marginBottom: "12px", display: "block" }}
                        >
                          {file.filePath}
                        </Text>

                        {/* Code Changes */}
                        <div
                          style={{
                            background: "#f6f8fa",
                            border: "1px solid #e1e4e8",
                            borderRadius: "6px",
                            overflow: "hidden",
                          }}
                        >
                          {file.changes.map((change, index) => (
                            <div key={index}>
                              {change.type === "addition" && (
                                <div
                                  style={{
                                    background: "#f0fff4",
                                    borderLeft: "4px solid #52c41a",
                                    padding: "8px 12px",
                                    fontFamily: "Monaco, Consolas, monospace",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#666",
                                      width: "40px",
                                      display: "inline-block",
                                      textAlign: "right",
                                      marginRight: "16px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    +{change.lineNumber}
                                  </Text>
                                  <PlusOutlined
                                    style={{
                                      color: "#52c41a",
                                      fontSize: "12px",
                                      marginRight: "8px",
                                    }}
                                  />
                                  <Text style={{ color: "#22863a" }}>
                                    {change.content}
                                  </Text>
                                </div>
                              )}

                              {change.type === "deletion" && (
                                <div
                                  style={{
                                    background: "#fff5f5",
                                    borderLeft: "4px solid #ff4d4f",
                                    padding: "8px 12px",
                                    fontFamily: "Monaco, Consolas, monospace",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#666",
                                      width: "40px",
                                      display: "inline-block",
                                      textAlign: "right",
                                      marginRight: "16px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    -{change.lineNumber}
                                  </Text>
                                  <MinusOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      fontSize: "12px",
                                      marginRight: "8px",
                                    }}
                                  />
                                  <Text
                                    style={{
                                      color: "#cb2431",
                                      textDecoration: "line-through",
                                    }}
                                  >
                                    {change.content}
                                  </Text>
                                </div>
                              )}

                              {change.type === "modification" && (
                                <>
                                  <div
                                    style={{
                                      background: "#fff5f5",
                                      borderLeft: "4px solid #ff4d4f",
                                      padding: "8px 12px",
                                      fontFamily: "Monaco, Consolas, monospace",
                                      fontSize: "13px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "#666",
                                        width: "40px",
                                        display: "inline-block",
                                        textAlign: "right",
                                        marginRight: "16px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      -{change.lineNumber}
                                    </Text>
                                    <MinusOutlined
                                      style={{
                                        color: "#ff4d4f",
                                        fontSize: "12px",
                                        marginRight: "8px",
                                      }}
                                    />
                                    <Text
                                      style={{
                                        color: "#cb2431",
                                        textDecoration: "line-through",
                                      }}
                                    >
                                      {change.oldContent}
                                    </Text>
                                  </div>
                                  <div
                                    style={{
                                      background: "#f0fff4",
                                      borderLeft: "4px solid #52c41a",
                                      padding: "8px 12px",
                                      fontFamily: "Monaco, Consolas, monospace",
                                      fontSize: "13px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "#666",
                                        width: "40px",
                                        display: "inline-block",
                                        textAlign: "right",
                                        marginRight: "16px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      +{change.lineNumber}
                                    </Text>
                                    <PlusOutlined
                                      style={{
                                        color: "#52c41a",
                                        fontSize: "12px",
                                        marginRight: "8px",
                                      }}
                                    />
                                    <Text style={{ color: "#22863a" }}>
                                      {change.newContent}
                                    </Text>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* File Stats */}
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "8px 12px",
                            background: "#f8f9fa",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          <Space
                            split={<span style={{ color: "#d9d9d9" }}>|</span>}
                          >
                            <Text type="secondary">
                              <strong>{file.changes.length}</strong> changes
                            </Text>
                            {file.additions > 0 && (
                              <Text style={{ color: "#52c41a" }}>
                                <strong>+{file.additions}</strong> additions
                              </Text>
                            )}
                            {file.deletions > 0 && (
                              <Text style={{ color: "#ff4d4f" }}>
                                <strong>-{file.deletions}</strong> deletions
                              </Text>
                            )}
                          </Space>
                        </div>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </Card>
            </Col>
          </Row>

          {/* Comprehensive Test Recommendations Section */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card>
                <Title level={3} style={{ marginBottom: 8, fontSize: "24px" }}>
                  AI-Generated Test Recommendations
                  {loadingTestRecommendations && (
                    <span
                      style={{
                        marginLeft: 12,
                        fontSize: "14px",
                        color: "#1890ff",
                      }}
                    >
                      Loading from API...
                    </span>
                  )}
                </Title>
                <Paragraph
                  type="secondary"
                  style={{ marginBottom: 24, fontSize: "16px" }}
                >
                  {loadingTestRecommendations ? (
                    <>
                      <span>🔄 Calling /api/v1/retrieve endpoint...</span>
                    </>
                  ) : (
                    <>
                      Based on your PR changes, here are intelligent test
                      recommendations to ensure code quality and prevent
                      regressions.
                      {apiTestRecommendations.length > 0 && (
                        <span style={{ color: "#52c41a", marginLeft: 8 }}>
                          ✅ API call completed (using mock data while backend
                          deploys)
                        </span>
                      )}
                    </>
                  )}
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
                    {!analyzedPR ? (
                      <div>
                        <Text type="secondary" style={{ fontSize: "16px" }}>
                          Enter a PR URL and click "Analyze PR" to get
                          AI-generated test recommendations.
                        </Text>
                      </div>
                    ) : loadingTestRecommendations ? (
                      <div>
                        <Text type="secondary" style={{ fontSize: "16px" }}>
                          🔄 Loading test recommendations from API...
                        </Text>
                      </div>
                    ) : (
                      <div>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "16px",
                            marginBottom: 8,
                            display: "block",
                          }}
                        >
                          No test recommendations available from API
                        </Text>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          {testSearchTerm
                            ? `No results match your search criteria: "${testSearchTerm}"`
                            : "The API returned no test recommendations for this PR"}
                        </Text>
                      </div>
                    )}
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
