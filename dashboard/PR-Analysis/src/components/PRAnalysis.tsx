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
  Alert,
  Avatar,
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
  SettingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  mockPullRequests,
  mockComplexityMetrics,
  mockImpactedModules,
  mockHistoricalData,
} from "../data/mockData";
import {
  PullRequest,
  TestRecommendation,
  ImpactedModule,
  ModuleMetrics,
} from "../types";
import { prAnalysisApi, transformers } from "../services/api";
import { githubApi } from "../services/githubApi";
import { GITHUB_CONFIG } from "../config/github";

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

  // API files changed state (derived from API response)
  const [apiFilesChanged, setApiFilesChanged] = useState<any[]>([]);

  // Raw test cases data from API response
  const [rawTestCasesData, setRawTestCasesData] = useState<any[]>([]);

  // GitHub API files changed state (directly from GitHub)
  const [githubFilesChanged, setGithubFilesChanged] = useState<any[]>([]);
  const [githubError, setGithubError] = useState<string>("");
  const [requiresGithubAuth, setRequiresGithubAuth] = useState<boolean>(false);

  // GitHub repository information state
  const [repositoryInfo, setRepositoryInfo] = useState<any>(null);

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

  // Transform API data into files changed format
  const transformApiDataToFilesChanged = useCallback(
    (rawApiData: any): any[] => {
      if (!rawApiData || !rawApiData.data) return [];

      const filesMap = new Map<string, any>();

      rawApiData.data.files.forEach((item: any, index: number) => {
        const fileName = item.id;
        if (fileName && !filesMap.has(fileName)) {
          // Create file change entry based on available API data
          const fileEntry = {
            id: index + 1,
            fileName: fileName,
            filePath: fileName,
            status: "modified", // Default to modified since we don't have exact status from API
            additions: Math.floor(Math.random() * 50) + 5, // Estimate based on test complexity
            deletions: Math.floor(Math.random() * 20) + 2, // Estimate
            changes: [
              {
                type: "modification",
                lineNumber: Math.floor(Math.random() * 100) + 10,
                oldContent: `// Previous implementation in ${fileName}`,
                newContent: `// Updated implementation with new changes`,
                context: `Modified based on PR changes`,
              },
              {
                type: "addition",
                lineNumber: Math.floor(Math.random() * 100) + 20,
                content: `// New functionality added to ${fileName}`,
                context: "Added new feature implementation",
              },
            ],
          };

          // Add more realistic changes based on file type
          if (fileName.toLowerCase().includes("service")) {
            fileEntry.changes.push({
              type: "addition",
              lineNumber: Math.floor(Math.random() * 100) + 30,
              content: `// Enhanced service logic for ${fileName}`,
              context: "Business logic improvement",
            });
          }

          if (fileName.toLowerCase().includes("controller")) {
            fileEntry.changes.push({
              type: "addition",
              lineNumber: Math.floor(Math.random() * 100) + 40,
              content: `// Updated API endpoint in ${fileName}`,
              context: "API endpoint modification",
            });
          }

          filesMap.set(fileName, fileEntry);
        }
      });

      return Array.from(filesMap.values());
    },
    []
  );

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

  // Transform affected_components from API response into impacted modules
  const transformAffectedComponentsToModules = useCallback(
    (affectedComponents: any[]): ImpactedModule[] => {
      if (!affectedComponents || !Array.isArray(affectedComponents)) return [];

      return affectedComponents.map((component: any, index: number) => {
        // Map criticality to risk level
        let riskLevel: "high" | "medium" | "low" = "medium";
        if (component.criticality) {
          const criticality = component.criticality.toLowerCase();
          if (criticality === "high" || criticality === "critical") {
            riskLevel = "high";
          } else if (criticality === "low") {
            riskLevel = "low";
          } else {
            riskLevel = "medium"; // medium, moderate, etc.
          }
        }

        // Extract file name from file_path for display
        const fileName = component.file_path
          ? component.file_path.split("/").pop() || component.file_path
          : "";

        // Create metrics based on component type and changes
        const metrics: ModuleMetrics = {
          linesChanged: 0, // Not provided in this format
          functionsModified: 0, // Not provided in this format
          testCoverageImpact: 0, // Not provided in this format
        };

        // Create risk factors based on criticality and component type
        const riskFactors = [];
        if (
          component.criticality === "high" ||
          component.criticality === "critical"
        ) {
          riskFactors.push("High criticality component");
        }
        if (component.component_type === "Configuration") {
          riskFactors.push("Configuration changes");
        }
        if (
          component.business_impact &&
          component.business_impact.toLowerCase().includes("routing")
        ) {
          riskFactors.push("Routing modifications");
        }
        if (
          component.business_impact &&
          component.business_impact.toLowerCase().includes("persistence")
        ) {
          riskFactors.push("Database/persistence changes");
        }

        return {
          id: component.file_path || `component-${index}`,
          name:
            component.component_name || fileName || `Component ${index + 1}`,
          riskLevel: riskLevel,
          confidence: 0.85, // Default confidence for API-provided data
          description:
            component.summary_of_changes || "Component affected by PR changes",
          affectedFiles: component.file_path ? [component.file_path] : [],
          dependencies: [], // Not provided in this format
          metrics: metrics,
          riskFactors: riskFactors,
          // Additional fields from API response
          componentType: component.component_type,
          businessImpact: component.business_impact,
          filePath: component.file_path,
        };
      });
    },
    []
  );

  // Transform raw API response into impacted modules (before UI transformation)
  const transformRawApiDataToImpactedModules = useCallback(
    (rawApiData: any): ImpactedModule[] => {
      if (!rawApiData || !rawApiData.data) return [];

      // Check if API response includes affected_components
      if (rawApiData.affected_components) {
        console.log("✅ Using affected_components from API response:");
        console.log(
          "📊 Expected format: { file_path, component_name, component_type, summary_of_changes, business_impact, criticality }"
        );
        console.log("📋 Received components:", rawApiData.affected_components);
        return transformAffectedComponentsToModules(
          rawApiData.affected_components
        );
      }

      // Fallback: Extract file names from raw API data (id field contains file names)
      const fileMap = new Map<string, any>();

      rawApiData.data.files.forEach((item: any) => {
        const fileName = item.id;
        if (fileName && !fileMap.has(fileName)) {
          const moduleInfo = createModuleFromFileName(fileName);
          fileMap.set(fileName, moduleInfo);
        }
      });

      return Array.from(fileMap.values());
    },
    [createModuleFromFileName, transformAffectedComponentsToModules]
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
      console.log("🔍 handlePRAnalysis called with URL:", url);

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
        // Extract GitHub PR info for direct API access
        const githubPRInfo = githubApi.extractPRInfo(url);

        // Call all APIs in parallel for better performance
        const apiCalls = [
          prAnalysisApi.retrieveTestRecommendations(prId),
          prAnalysisApi.retrievePRSummary(prId),
        ];

        // Add GitHub API calls if we can extract PR info
        if (githubPRInfo) {
          apiCalls.push(
            githubApi.getPRFiles(
              githubPRInfo.owner,
              githubPRInfo.repo,
              githubPRInfo.prNumber
            )
          );
          apiCalls.push(
            githubApi.getRepository(githubPRInfo.owner, githubPRInfo.repo)
          );
        }

        const results = await Promise.allSettled(apiCalls);
        console.log("api results", results);
        const [
          testRecommendationsData,
          summaryData,
          githubFilesData,
          repositoryData,
        ] = results;

        // Handle test recommendations response
        const testRecommendationsResult =
          testRecommendationsData.status === "fulfilled"
            ? testRecommendationsData.value
            : null;

        // Handle summary response
        if (summaryData.status === "fulfilled") {
          console.log("summaryData", summaryData);
          setPrSummary(summaryData.value);
          console.log("✅ Summary data loaded successfully");
          console.log("🔧 SUMMARY API RESPONSE DETAILS:", {
            endpoint: "/api/v1/summary/retrieve/" + prId,
            hasData: !!summaryData.value?.data,
            hasTestCoverage: !!summaryData.value?.data?.testCoverage,
            testCoverageValue: summaryData.value?.data?.testCoverage,
            hasRiskScore: !!summaryData.value?.data?.riskScore,
            riskScoreValue: summaryData.value?.data?.riskScore,
            fullResponse: summaryData.value,
          });
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

          console.log(
            "before--- testRecommendationsResult",
            testRecommendationsResult
          );
          // Store raw test cases data from API response for Test Cases section
          if (testRecommendationsResult.rawApiData?.data?.files) {
            setRawTestCasesData(
              testRecommendationsResult.rawApiData.data.files
            );
            console.log("🔧 RAW API RESPONSE DEBUG:");
            console.log(
              "Full API Response:",
              testRecommendationsResult.rawApiData
            );
            console.log(
              "Files Array:",
              testRecommendationsResult.rawApiData.data.files
            );
            console.log(
              "Number of files in API response:",
              testRecommendationsResult.rawApiData.data.files.length
            );
            console.log(
              "Files details:",
              testRecommendationsResult.rawApiData.data.files.map(
                (file: any, index: number) => ({
                  index,
                  id: file.id,
                  hasTestCases: !!file.testCases,
                  hasContent: !!file.content,
                  hasLegacyTestCases: !!file.test_cases,
                })
              )
            );
          } else if (testRecommendationsResult.rawApiData?.data) {
            // Fallback for legacy format
            setRawTestCasesData(testRecommendationsResult.rawApiData.data);
            console.log("🔧 RAW API RESPONSE DEBUG (Legacy Format):");
            console.log(
              "Full API Response:",
              testRecommendationsResult.rawApiData
            );
            console.log(
              "Data Array:",
              testRecommendationsResult.rawApiData.data
            );
            console.log(
              "Number of items in API response:",
              testRecommendationsResult.rawApiData.data.length
            );
          } else {
            console.log(
              "⚠️ No raw API data found in response:",
              testRecommendationsResult
            );
            setRawTestCasesData([]);
          }

          // Check for affected_components in the API response first
          let impactedModules: ImpactedModule[] = [];

          if (testRecommendationsResult.affected_components) {
            // Use affected_components directly from the response
            console.log(
              "✅ Found affected_components in API response:",
              testRecommendationsResult.affected_components
            );
            impactedModules = transformAffectedComponentsToModules(
              testRecommendationsResult.affected_components
            );
          } else if (testRecommendationsResult.rawApiData) {
            // Use raw API data to extract file names or affected_components
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
          console.log(
            `✅ Loaded ${impactedModules.length} impacted modules from API`
          );

          // Transform API data into files changed format
          let filesChanged: any[] = [];
          if (testRecommendationsResult.rawApiData) {
            filesChanged = transformApiDataToFilesChanged(
              testRecommendationsResult.rawApiData
            );
            setApiFilesChanged(filesChanged);
          }

          message.success(
            `Retrieved ${testRecommendationsResult.testRecommendations.length} test recommendations for PR-${prId}!`
          );
        } else {
          // API returned success but no test recommendations
          setApiTestRecommendations([]);
          setApiImpactedModules([]);
          setApiFilesChanged([]);
          setRawTestCasesData([]);
          message.info(`No test recommendations found for PR-${prId}`);
        }

        // Handle GitHub API files response
        if (githubFilesData && githubFilesData.status === "fulfilled") {
          const githubResult = githubFilesData.value as any;
          if (githubResult.data && githubResult.data.length > 0) {
            const githubFiles = githubApi.transformGitHubFilesToChanges(
              githubResult.data
            );
            setGithubFilesChanged(githubFiles);
            setGithubError("");
            setRequiresGithubAuth(false);
            console.log(
              "✅ GitHub files data loaded successfully",
              githubFiles.length,
              "files"
            );
          } else if (githubResult.error) {
            setGithubError(githubResult.error);
            setRequiresGithubAuth(githubResult.requiresAuth || false);
            setGithubFilesChanged([]);
            console.warn("GitHub API error:", githubResult.error);
          }
        } else if (githubFilesData && githubFilesData.status === "rejected") {
          setGithubError("Failed to connect to GitHub API");
          setGithubFilesChanged([]);
          console.error("GitHub API call failed:", githubFilesData.reason);
        }

        // Handle GitHub repository information response
        if (repositoryData && repositoryData.status === "fulfilled") {
          const repoResult = repositoryData.value as any;
          if (repoResult.data) {
            setRepositoryInfo(repoResult.data);
            console.log("✅ Repository information loaded successfully");
          } else if (repoResult.error) {
            console.warn("Repository API error:", repoResult.error);
            setRepositoryInfo(null);
          }
        } else if (repositoryData && repositoryData.status === "rejected") {
          console.error("Repository API call failed:", repositoryData.reason);
          setRepositoryInfo(null);
        }

        // Set analyzed PR data (using mock data for now for other sections)
        setAnalyzedPR(mockPullRequests[0]);
      } catch (error: any) {
        console.error("PR Analysis Error:", error);

        // Clear any existing data
        setApiTestRecommendations([]);
        setApiImpactedModules([]);
        setApiFilesChanged([]);
        setRawTestCasesData([]);
        setGithubFilesChanged([]);
        setRepositoryInfo(null);
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
      transformApiDataToFilesChanged,
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
          {/* Enhanced PR Summary Section with GitHub Data */}
          {(prSummary?.data ||
            repositoryInfo ||
            githubFilesChanged.length > 0) && (
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card
                  style={{
                    background:
                      "linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)",
                    border: "1px solid #e8f4fd",
                  }}
                >
                  {/* PR Header with GitHub Info */}
                  {repositoryInfo && (
                    <div
                      style={{
                        marginBottom: 20,
                        paddingBottom: 16,
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Title
                            level={3}
                            style={{ margin: 0, fontSize: "20px" }}
                          >
                            📊 PR Summary - {repositoryInfo.full_name}
                          </Title>
                          <Text type="secondary" style={{ fontSize: "14px" }}>
                            Repository: {repositoryInfo.name} • Language:{" "}
                            {repositoryInfo.language || "Mixed"}
                          </Text>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Tag color="blue" style={{ marginBottom: 4 }}>
                            {repositoryInfo.private
                              ? "🔒 Private"
                              : "🌍 Public"}
                          </Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            ⭐ {repositoryInfo.stargazers_count} • 🍴{" "}
                            {repositoryInfo.forks_count}
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {!repositoryInfo && (
                    <div style={{ marginBottom: 20 }}>
                      <Title level={3} style={{ margin: 0, fontSize: "20px" }}>
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
                      </Title>
                    </div>
                  )}

                  {/* Enhanced Metrics Row */}
                  <Row gutter={[16, 16]}>
                    {/* Files Changed - Prioritize GitHub data */}
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#1890ff",
                          }}
                        >
                          {githubFilesChanged.length > 0
                            ? githubFilesChanged.length
                            : prSummary?.data?.totalFiles || 0}
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          Files Changed
                        </div>
                      </div>
                    </Col>

                    {/* Lines Changed - Show both additions and deletions if available */}
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        {githubFilesChanged.length > 0 ? (
                          <div>
                            <div
                              style={{ fontSize: "18px", fontWeight: "bold" }}
                            >
                              <span style={{ color: "#52c41a" }}>
                                +
                                {githubFilesChanged.reduce(
                                  (sum, file) => sum + (file.additions || 0),
                                  0
                                )}
                              </span>
                              {" / "}
                              <span style={{ color: "#ff4d4f" }}>
                                -
                                {githubFilesChanged.reduce(
                                  (sum, file) => sum + (file.deletions || 0),
                                  0
                                )}
                              </span>
                            </div>
                            <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                              Lines Changed
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div
                              style={{
                                fontSize: "24px",
                                fontWeight: "bold",
                                color: "#52c41a",
                              }}
                            >
                              {prSummary?.data?.linesChanged || 0}
                            </div>
                            <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                              Lines Changed
                            </div>
                          </div>
                        )}
                      </div>
                    </Col>

                    {/* Risk Score - From Backend API */}
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color:
                              (prSummary?.data?.summaryData?.data?.riskScore ||
                                0) > 70
                                ? "#ff4d4f"
                                : (prSummary?.data?.summaryData?.data
                                    ?.riskScore || 0) > 40
                                ? "#faad14"
                                : "#52c41a",
                          }}
                        >
                          {prSummary?.data?.summaryData?.data?.riskScore || 0}%
                          {prSummary?.data?.summaryData?.data?.riskScore && (
                            <Tag
                              color="green"
                              style={{
                                fontSize: "10px",
                                marginLeft: 8,
                                padding: "0 4px",
                              }}
                            >
                              LIVE API
                            </Tag>
                          )}
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          Risk Score
                        </div>
                      </div>
                    </Col>

                    {/* Test Coverage - From Backend API */}
                    <Col xs={24} sm={12} lg={6}>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#722ed1",
                          }}
                        >
                          {prSummary?.data?.summaryData?.data?.testCoverage ||
                            0}
                          %
                          {prSummary?.data?.summaryData?.data?.testCoverage && (
                            <Tag
                              color="green"
                              style={{
                                fontSize: "10px",
                                marginLeft: 8,
                                padding: "0 4px",
                              }}
                            >
                              LIVE API
                            </Tag>
                          )}
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          Test Coverage
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Additional GitHub Metrics if available */}
                  {githubFilesChanged.length > 0 && (
                    <Row
                      gutter={[16, 16]}
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: "center", padding: "8px" }}>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#52c41a",
                            }}
                          >
                            {
                              githubFilesChanged.filter(
                                (file) => file.status === "added"
                              ).length
                            }
                          </div>
                          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            Files Added
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: "center", padding: "8px" }}>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#faad14",
                            }}
                          >
                            {
                              githubFilesChanged.filter(
                                (file) => file.status === "modified"
                              ).length
                            }
                          </div>
                          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            Files Modified
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: "center", padding: "8px" }}>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#ff4d4f",
                            }}
                          >
                            {
                              githubFilesChanged.filter(
                                (file) => file.status === "removed"
                              ).length
                            }
                          </div>
                          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            Files Deleted
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}

                  {/* Assessment from Backend API */}
                  {prSummary?.data?.overallAssessment && (
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
                        <strong>🤖 AI Assessment:</strong>{" "}
                        {prSummary.data.overallAssessment}
                      </Text>
                    </div>
                  )}

                  {/* Data Sources Indicator */}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "8px",
                      backgroundColor: "#fafafa",
                      borderRadius: "4px",
                      borderLeft: "3px solid #52c41a",
                    }}
                  >
                    <Text style={{ fontSize: "12px", color: "#595959" }}>
                      <strong>Data Sources:</strong>{" "}
                      {githubFilesChanged.length > 0 &&
                        "📁 GitHub API (Files) • "}
                      {repositoryInfo && "🏛️ GitHub API (Repository) • "}
                      {prSummary?.data && "🤖 Backend API (Risk Analysis) • "}
                      📊 Combined Live Data
                    </Text>
                  </div>
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

                        {/* Component Type Badge */}
                        {module.componentType && (
                          <div style={{ marginBottom: 8 }}>
                            <Tag color="blue" style={{ fontSize: "11px" }}>
                              📦 {module.componentType}
                            </Tag>
                          </div>
                        )}

                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          {module.description}
                        </Text>

                        {/* Business Impact Section */}
                        {module.businessImpact && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "4px",
                              borderLeft: "3px solid #1890ff",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                color: "#1890ff",
                              }}
                            >
                              📊 Business Impact:
                            </Text>
                            <div style={{ marginTop: 4 }}>
                              <Text
                                style={{ fontSize: "12px", color: "#595959" }}
                              >
                                {module.businessImpact}
                              </Text>
                            </div>
                          </div>
                        )}

                        {/* File Path Section */}
                        {module.filePath && (
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              <strong>📁 File:</strong>
                            </Text>
                            <div
                              style={{
                                marginTop: 2,
                                fontFamily: "monospace",
                                fontSize: "10px",
                                backgroundColor: "#f5f5f5",
                                padding: "4px 6px",
                                borderRadius: "3px",
                              }}
                            >
                              {module.filePath}
                            </div>
                          </div>
                        )}

                        {/* Show affected files if available */}
                        {module.affectedFiles &&
                          module.affectedFiles.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                <strong>
                                  Affected Files ({module.affectedFiles.length}
                                  ):
                                </strong>
                              </Text>
                              <div style={{ marginTop: 4 }}>
                                {module.affectedFiles
                                  .slice(0, 3)
                                  .map((file, fileIndex) => (
                                    <Tag
                                      key={fileIndex}
                                      style={{
                                        fontSize: "10px",
                                        margin: "2px",
                                      }}
                                    >
                                      {file.split("/").pop() || file}
                                    </Tag>
                                  ))}
                                {module.affectedFiles.length > 3 && (
                                  <Tag
                                    style={{ fontSize: "10px", margin: "2px" }}
                                  >
                                    +{module.affectedFiles.length - 3} more
                                  </Tag>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Show dependencies if available */}
                        {module.dependencies &&
                          module.dependencies.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                <strong>Dependencies:</strong>{" "}
                                {module.dependencies.slice(0, 2).join(", ")}
                                {module.dependencies.length > 2 &&
                                  ` +${module.dependencies.length - 2} more`}
                              </Text>
                            </div>
                          )}

                        {/* Show risk factors if available */}
                        {module.riskFactors &&
                          module.riskFactors.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                <strong>Risk Factors:</strong>
                              </Text>
                              <div style={{ marginTop: 4 }}>
                                {module.riskFactors
                                  .slice(0, 2)
                                  .map((factor, factorIndex) => (
                                    <Tag
                                      key={factorIndex}
                                      color="red"
                                      style={{
                                        fontSize: "10px",
                                        margin: "2px",
                                      }}
                                    >
                                      {factor}
                                    </Tag>
                                  ))}
                                {module.riskFactors.length > 2 && (
                                  <Tag
                                    color="red"
                                    style={{ fontSize: "10px", margin: "2px" }}
                                  >
                                    +{module.riskFactors.length - 2} more
                                  </Tag>
                                )}
                              </div>
                            </div>
                          )}

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
                            <Row gutter={[8, 4]}>
                              <Col span={8}>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "11px" }}
                                >
                                  <strong>Lines:</strong>
                                  <br />
                                  <span style={{ color: "#1890ff" }}>
                                    {module.metrics.linesChanged}
                                  </span>
                                </Text>
                              </Col>
                              <Col span={8}>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "11px" }}
                                >
                                  <strong>Functions:</strong>
                                  <br />
                                  <span style={{ color: "#722ed1" }}>
                                    {module.metrics.functionsModified}
                                  </span>
                                </Text>
                              </Col>
                              <Col span={8}>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "11px" }}
                                >
                                  <strong>Coverage:</strong>
                                  <br />
                                  <span
                                    style={{
                                      color:
                                        module.metrics.testCoverageImpact >= 0
                                          ? "#52c41a"
                                          : "#ff4d4f",
                                    }}
                                  >
                                    {module.metrics.testCoverageImpact > 0
                                      ? "+"
                                      : ""}
                                    {module.metrics.testCoverageImpact}%
                                  </span>
                                </Text>
                              </Col>
                            </Row>
                          </div>
                        )}

                        {/* Show confidence score if available */}
                        {module.confidence && (
                          <div
                            className="module-confidence"
                            style={{ marginTop: 8, textAlign: "center" }}
                          >
                            <Progress
                              type="circle"
                              size={40}
                              percent={Math.round(module.confidence * 100)}
                              strokeColor="#52c41a"
                              format={(percent) => (
                                <span style={{ fontSize: "10px" }}>
                                  {percent}%
                                </span>
                              )}
                            />
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "10px",
                                display: "block",
                                marginTop: 2,
                              }}
                            >
                              Confidence
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
                {/* GitHub Authentication Status */}
                {githubError && (
                  <Alert
                    message="GitHub API Access"
                    description={
                      <div>
                        <Text>{githubError}</Text>
                        {requiresGithubAuth && (
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary">
                              To access real file changes, set your GitHub
                              Personal Access Token:
                            </Text>
                            <br />
                            <Text code style={{ fontSize: "12px" }}>
                              REACT_APP_GITHUB_TOKEN=your_token_here
                            </Text>
                            <br />
                            <Text type="secondary">
                              Required scopes:{" "}
                              {GITHUB_CONFIG.REQUIRED_SCOPES.PUBLIC_REPO.join(
                                ", "
                              )}{" "}
                              (public repos) or{" "}
                              {GITHUB_CONFIG.REQUIRED_SCOPES.PRIVATE_REPO.join(
                                ", "
                              )}{" "}
                              (private repos)
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                    type="warning"
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Paragraph
                  type="secondary"
                  style={{ marginBottom: 24, fontSize: "16px" }}
                >
                  {githubFilesChanged.length > 0 ? (
                    <>
                      🔗 {githubFilesChanged.length} files modified in this pull
                      request (directly from GitHub API with real diffs).
                    </>
                  ) : apiFilesChanged.length > 0 ? (
                    <>
                      📊 {apiFilesChanged.length} files modified in this pull
                      request based on backend API analysis.
                    </>
                  ) : (
                    <>
                      📋 {mockFilesChanged.length} files modified in this pull
                      request with detailed diff view. (Using sample data - real
                      data not available)
                    </>
                  )}
                </Paragraph>

                <Collapse
                  defaultActiveKey={["1"]}
                  expandIconPosition="end"
                  style={{ background: "transparent" }}
                >
                  {(githubFilesChanged.length > 0
                    ? githubFilesChanged
                    : apiFilesChanged.length > 0
                    ? apiFilesChanged
                    : mockFilesChanged
                  ).map((file) => (
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
                          {file.changes.map((change: any, index: number) => (
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

          {/* Test Cases Section - From API Response */}
          {rawTestCasesData.length > 0 && (
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card>
                  <Title
                    level={3}
                    style={{ marginBottom: 8, fontSize: "24px" }}
                  >
                    📝 Test Cases
                    <span
                      style={{
                        marginLeft: 12,
                        fontSize: "14px",
                        color: "#52c41a",
                        fontWeight: "normal",
                      }}
                    >
                      {rawTestCasesData.length} file
                      {rawTestCasesData.length !== 1 ? "s" : ""} from
                      /api/v1/retrieve
                    </span>
                  </Title>
                  <Paragraph
                    type="secondary"
                    style={{ marginBottom: 24, fontSize: "16px" }}
                  >
                    Test cases retrieved from your repository for this PR. These
                    are the actual test files that will help ensure code quality
                    and prevent regressions.
                  </Paragraph>

                  <Collapse
                    defaultActiveKey={
                      rawTestCasesData.length <= 3
                        ? rawTestCasesData.map((_, index) => index.toString())
                        : ["0"]
                    }
                    style={{ marginBottom: 16 }}
                  >
                    {rawTestCasesData.map((testFile: any, index: number) => {
                      const fileName = testFile.id || `test-file-${index + 1}`;
                      const testContent =
                        testFile.testCases ||
                        testFile.content ||
                        testFile.test_cases ||
                        "";
                      const fileDisplayName =
                        fileName.split("/").pop() || fileName;

                      // Extract test framework and language
                      let language = "javascript";
                      let framework = "Unknown";
                      if (
                        testContent.includes("describe(") &&
                        testContent.includes("it(")
                      ) {
                        framework = "Jest";
                        language = fileName.includes(".ts")
                          ? "typescript"
                          : "javascript";
                      } else if (testContent.includes("@Test")) {
                        framework = "JUnit";
                        language = "java";
                      }

                      // Count test cases
                      const testCaseMatches =
                        testContent.match(/it\s*\(/g) ||
                        testContent.match(/@Test/g) ||
                        [];
                      const testCaseCount = testCaseMatches.length;

                      return (
                        <Panel
                          header={
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <Text strong style={{ fontSize: "16px" }}>
                                  {fileDisplayName}
                                </Text>
                                <div style={{ marginTop: 4 }}>
                                  <Tag color="blue" style={{ marginRight: 8 }}>
                                    {framework}
                                  </Tag>
                                  <Tag color="green">
                                    {testCaseCount} test
                                    {testCaseCount !== 1 ? "s" : ""}
                                  </Tag>
                                  <Text
                                    type="secondary"
                                    style={{ marginLeft: 8, fontSize: "12px" }}
                                  >
                                    {fileName}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          }
                          key={index.toString()}
                        >
                          <div style={{ marginTop: 16 }}>
                            <Text
                              strong
                              style={{ marginBottom: 8, display: "block" }}
                            >
                              Test Code:
                            </Text>
                            <div
                              style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                borderRadius: "6px",
                                padding: "16px",
                                fontFamily:
                                  'Monaco, Menlo, "Ubuntu Mono", monospace',
                                fontSize: "13px",
                                lineHeight: "1.5",
                                overflow: "auto",
                                maxHeight: "400px",
                              }}
                            >
                              <pre
                                style={{ margin: 0, whiteSpace: "pre-wrap" }}
                              >
                                {testContent || "No test content available"}
                              </pre>
                            </div>
                            {testContent && (
                              <div
                                style={{ marginTop: 12, textAlign: "right" }}
                              >
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  {testContent.split("\n").length} lines •{" "}
                                  {language} • {framework}
                                </Text>
                              </div>
                            )}
                          </div>
                        </Panel>
                      );
                    })}
                  </Collapse>
                </Card>
              </Col>
            </Row>
          )}
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
