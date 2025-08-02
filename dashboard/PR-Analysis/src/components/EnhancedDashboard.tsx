import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Select,
  Space,
  Badge,
  Alert,
  Avatar,
  Typography,
  Switch,
  Spin,
  message,
} from "antd";
import {
  BugOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  UserOutlined,
  SafetyOutlined,
  RobotOutlined,
  LinkOutlined,
  SettingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { githubApi } from "../services/githubApi";
import { prAnalysisApi } from "../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

// Enhanced Mock Data - Updated with real calorie-tracker PRs
const mockDashboardData = {
  overview: {
    totalPRs: 3,
    activePRs: 3,
    completedAnalysis: 0,
    riskScore: 67, // Average of 9.2, 6.7, 4.1
    systemHealth: 94.2,
    apiUsage: 78,
    accuracyRate: 94.2,
    analysisSpeed: 2.3,
    modelsActive: 3,
  },
  recentPRs: [
    {
      id: "#PR-3",
      title:
        "Add Quantum module with service and controller for quantum calorie processing, including AI vision analysis and neural network integration. Update app module to include QuantumModule.",
      author: "yasinbhimani",
      status: "critical",
      riskScore: 92, // 9.2 scaled to match UI expectations
      created: "Aug 2, 2025",
      repository: "calorie-tracker",
      files: 15,
      additions: 1185,
      deletions: 0,
      avatar: "https://github.com/yasinbhimani.png",
    },
    {
      id: "#PR-2",
      title:
        "[WIP] Merge activity log capability and track calories burn by day & week",
      author: "gauravv-tal",
      status: "medium-risk",
      riskScore: 67, // 6.7 scaled to match UI expectations
      created: "Aug 2, 2025",
      repository: "calorie-tracker",
      files: 8,
      additions: 423,
      deletions: 15,
      avatar: "https://github.com/gauravv-tal.png",
    },
    {
      id: "#PR-1",
      title: "[WIP][DO NOT MERGE] Update calorie.service.ts",
      author: "gauravv-tal",
      status: "low-risk",
      riskScore: 41, // 4.1 scaled to match UI expectations
      created: "Aug 1, 2025",
      repository: "calorie-tracker",
      files: 1,
      additions: 67,
      deletions: 23,
      avatar: "https://github.com/gauravv-tal.png",
    },
  ],
  riskAssessments: [
    {
      component: "Quantum Processing Module",
      risk: "critical",
      score: 9.2,
      status: "active",
      lastUpdated: "Aug 2, 2025",
      recommendations: 8,
    },
    {
      component: "Activity Tracking Service",
      risk: "medium",
      score: 6.7,
      status: "monitoring",
      lastUpdated: "Aug 2, 2025",
      recommendations: 3,
    },
    {
      component: "Calorie Service Updates",
      risk: "low",
      score: 4.1,
      status: "review",
      lastUpdated: "6 hours ago",
      recommendations: 1,
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
  systemMetrics: {
    githubAPI: {
      status: "active",
      usage: 78,
      remaining: 4247,
      resetTime: "45m",
    },
    workflows: { active: 3, queued: 0, failed: 0, successRate: 100 },
    repository: { size: "156MB", openIssues: 0, branches: 4 },
    performance: { avgResponseTime: 245, uptime: 99.8, errors: 3 },
  },
};

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // GitHub PRs state
  const [recentPRs, setRecentPRs] = useState<any[]>([]);
  const [loadingPRs, setLoadingPRs] = useState<boolean>(true);
  const [prError, setPrError] = useState<string>("");

  // Repository information state
  const [repositoryInfo, setRepositoryInfo] = useState<any>(null);
  const [loadingRepo, setLoadingRepo] = useState<boolean>(true);

  // GitHub API status state
  const [gitHubApiStatus, setGitHubApiStatus] = useState<{
    hasToken: boolean;
    rateLimitInfo?: any;
    showSetupGuide: boolean;
  }>({
    hasToken: githubApi.isTokenConfigured(),
    showSetupGuide: false,
  });

  // Fetch PRs and Repository info from GitHub API
  const fetchGitHubPRs = useCallback(async () => {
    setLoadingPRs(true);
    setLoadingRepo(true);
    setPrError("");

    try {
      // Fetch both PRs and repository info in parallel
      const [prResult, repoResult] = await Promise.all([
        githubApi.getPullRequests("SayaliTal", "calorie-tracker", "all", 10),
        githubApi.getRepository("SayaliTal", "calorie-tracker"),
      ]);

      // Handle repository information
      if (repoResult.error) {
        console.warn("Repository API error:", repoResult.error);
        setRepositoryInfo(null);
      } else if (repoResult.data) {
        setRepositoryInfo(repoResult.data);
        console.log("✅ Repository information loaded successfully");
      }

      // Handle PRs
      if (prResult.error) {
        setPrError(prResult.error);
        // Fall back to mock data on error
        setRecentPRs(mockDashboardData.recentPRs);

        // Update GitHub API status based on error type
        if (prResult.error.includes("rate limit")) {
          setGitHubApiStatus((prev) => ({
            ...prev,
            rateLimitInfo: prResult.rateLimitInfo,
            showSetupGuide: !prev.hasToken, // Show setup guide if no token
          }));
        }

        // Enhanced error handling with specific guidance
        if (prResult.requiresAuth && !prResult.rateLimitInfo) {
          message.warning({
            content: (
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                  GitHub Authentication Required
                </div>
                <div style={{ marginBottom: 8 }}>{prResult.error}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Add REACT_APP_GITHUB_TOKEN to your .env file to access live
                  repository data.
                </div>
              </div>
            ),
            duration: 8,
          });

          // Show setup guide for non-rate-limit auth issues
          setGitHubApiStatus((prev) => ({ ...prev, showSetupGuide: true }));
        } else if (prResult.error.includes("rate limit")) {
          const isAuthenticated = prResult.rateLimitInfo?.limit > 60;
          message.error({
            content: (
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                  🚫 GitHub API Rate Limit Exceeded
                </div>
                <div style={{ marginBottom: 8 }}>{prResult.error}</div>
                {prResult.rateLimitInfo && (
                  <div
                    style={{ fontSize: "12px", color: "#666", marginBottom: 8 }}
                  >
                    Current limit: {prResult.rateLimitInfo.remaining}/
                    {prResult.rateLimitInfo.limit} requests
                    {prResult.rateLimitInfo.reset && (
                      <span>
                        {" "}
                        • Resets at{" "}
                        {new Date(
                          prResult.rateLimitInfo.reset * 1000
                        ).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
                {!isAuthenticated && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#1890ff",
                      backgroundColor: "#f0f9ff",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    💡 Pro tip: Add a GitHub Personal Access Token to increase
                    your limit from 60 to 5,000 requests/hour
                  </div>
                )}
              </div>
            ),
            duration: 12,
          });
        } else {
          message.error({
            content: `GitHub API Error: ${prResult.error}. Using sample data with mock risk levels.`,
            duration: 6,
          });
        }
      } else if (prResult.data && prResult.data.length > 0) {
        // Update rate limit info on successful requests
        if (prResult.rateLimitInfo) {
          setGitHubApiStatus((prev) => ({
            ...prev,
            rateLimitInfo: {
              ...prResult.rateLimitInfo,
              isNearLimit: prResult.rateLimitInfo.remaining < 10,
              message: `${prResult.rateLimitInfo.remaining}/${prResult.rateLimitInfo.limit} GitHub API requests remaining`,
            },
          }));
        }

        console.log(`🔄 Fetching detailed info for ${prResult.data.length} PRs to get file change statistics...`);

        // Fetch detailed PR information for each PR to get file change statistics
        // The list endpoint doesn't include additions, deletions, changed_files
        const detailedPRs = await Promise.allSettled(
          prResult.data.map(async (pr: any) => {
            try {
              const detailResult = await githubApi.getPullRequest(
                "SayaliTal", 
                "calorie-tracker", 
                pr.number
              );
              
              if (detailResult.data) {
                // Merge list data with detailed data
                return {
                  ...pr,
                  additions: detailResult.data.additions || 0,
                  deletions: detailResult.data.deletions || 0,
                  changed_files: detailResult.data.changed_files || 0,
                };
              } else {
                // If detailed fetch fails, use original PR data with estimated values
                console.warn(`⚠️ Could not fetch detailed info for PR ${pr.number}, using list data only`);
                return pr;
              }
            } catch (error) {
              console.warn(`⚠️ Error fetching detailed info for PR ${pr.number}:`, error);
              return pr; // Return original PR data as fallback
            }
          })
        );

        // Process the results and extract successful PR data
        const successfulPRs = detailedPRs
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value);

        console.log(`✅ Successfully fetched detailed info for ${successfulPRs.length} PRs`);

        // Transform GitHub PRs to dashboard format with API risk levels
        const transformedPRs = await Promise.all(
          successfulPRs.map(async (pr: any) => {
            // Get risk level from backend API for each PR
            let apiRiskScore = Math.round(calculatePRRiskScore(pr) * 10); // Fallback to calculated score
            let apiRiskLevel = "medium";

            try {
              // Extract repository name and PR number for API call
              const repoName = pr.base.repo.name;
              const prNumber = pr.number;
              const prId = `${repoName}_${prNumber}`; // Format: calorie-tracker_3

              console.log(`🔍 Fetching risk level from API for ${prId}`);

              // Call backend API to get risk assessment
              const summaryResult = await prAnalysisApi.retrievePRSummary(prId);

              if (
                summaryResult &&
                summaryResult.data &&
                summaryResult.data.riskScore
              ) {
                apiRiskScore = summaryResult.data.riskScore;
                console.log(
                  `✅ Got API risk score for ${prId}: ${apiRiskScore}`
                );

                // Determine risk level based on API score
                if (apiRiskScore >= 80) apiRiskLevel = "critical";
                else if (apiRiskScore >= 60) apiRiskLevel = "high-risk";
                else if (apiRiskScore >= 40) apiRiskLevel = "medium-risk";
                else apiRiskLevel = "low-risk";
              } else {
                console.log(
                  `⚠️ No risk score in API response for ${prId}, using calculated score`
                );
              }
            } catch (error) {
              console.warn(
                `⚠️ Failed to get API risk level for PR ${pr.number}:`,
                error
              );
              // Use fallback calculated score and status
              apiRiskLevel = determineStatus(pr);
            }

            // Log actual GitHub data for changes
            console.log(
              `📊 PR ${pr.number} Changes: +${pr.additions || 0}/-${
                pr.deletions || 0
              } in ${pr.changed_files || 0} files (GitHub API with detailed fetch)`
            );

            return {
              id: `#PR-${pr.number}`,
              title: pr.title,
              author: pr.user.login,
              status: apiRiskLevel, // Use API-determined risk level
              riskScore: apiRiskScore, // Use API-provided risk score
              created: new Date(pr.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              repository: pr.base.repo.name,
              files: pr.changed_files || 0, // Real GitHub data from detailed fetch
              additions: pr.additions || 0, // Real GitHub data from detailed fetch
              deletions: pr.deletions || 0, // Real GitHub data from detailed fetch
              avatar: pr.user.avatar_url,
              // Additional GitHub data
              githubData: {
                url: pr.html_url,
                state: pr.state,
                merged: pr.merged,
                draft: pr.draft,
                number: pr.number,
              },
              // API data
              apiData: {
                prId: `${pr.base.repo.name}_${pr.number}`,
                hasApiData: true,
              },
            };
          })
        );

        setRecentPRs(transformedPRs);
        console.log(
          `✅ Loaded ${transformedPRs.length} PRs from GitHub with detailed file change statistics and API risk levels`
        );
      } else {
        // No PRs found, use mock data
        setRecentPRs(mockDashboardData.recentPRs);
        message.info(
          "No pull requests found in repository. Using sample data with mock risk levels."
        );
      }
    } catch (error) {
      console.error("Error fetching GitHub PRs:", error);
      setPrError("Failed to fetch PRs and risk levels from APIs");
      setRecentPRs(mockDashboardData.recentPRs);
      message.error(
        "Failed to fetch PRs from GitHub and risk levels from API. Using sample data."
      );
    } finally {
      setLoadingPRs(false);
      setLoadingRepo(false);
    }
  }, []);

  // Helper function to determine PR status based on GitHub data
  const determineStatus = (pr: any): string => {
    if (pr.draft) return "draft";
    if (pr.state === "closed" && pr.merged) return "merged";
    if (pr.state === "closed" && !pr.merged) return "closed";

    // Calculate risk level based on changes
    const totalChanges = (pr.additions || 0) + (pr.deletions || 0);
    const changedFiles = pr.changed_files || 0;

    // Check title for risk indicators
    const title = pr.title.toLowerCase();
    if (
      title.includes("breaking") ||
      title.includes("major") ||
      title.includes("critical") ||
      totalChanges > 1000
    ) {
      return "critical";
    }
    if (
      title.includes("wip") ||
      title.includes("work in progress") ||
      title.includes("draft") ||
      changedFiles > 10 ||
      totalChanges > 300
    ) {
      return "medium-risk";
    }
    if (
      title.includes("do not merge") ||
      title.includes("hotfix") ||
      title.includes("urgent")
    ) {
      return "high-risk";
    }

    return "low-risk";
  };

  // Helper function to calculate risk score (similar to GitHub API service)
  const calculatePRRiskScore = (pr: any): number => {
    let riskScore = 3.0; // Base score

    // Size-based risk factors
    const additions = pr.additions || 0;
    const deletions = pr.deletions || 0;
    const changedFiles = pr.changed_files || 0;

    // Large changes increase risk
    if (additions + deletions > 500) riskScore += 2.0;
    else if (additions + deletions > 200) riskScore += 1.0;
    else if (additions + deletions > 100) riskScore += 0.5;

    // Many files changed increase risk
    if (changedFiles > 10) riskScore += 1.5;
    else if (changedFiles > 5) riskScore += 0.5;

    // Title-based risk factors
    const title = pr.title.toLowerCase();
    if (title.includes("wip") || title.includes("work in progress"))
      riskScore += 1.0;
    if (title.includes("do not merge") || title.includes("draft"))
      riskScore += 0.5;
    if (title.includes("breaking") || title.includes("major")) riskScore += 2.0;
    if (title.includes("security") || title.includes("auth")) riskScore += 1.5;
    if (title.includes("database") || title.includes("migration"))
      riskScore += 1.0;
    if (
      title.includes("ai") ||
      title.includes("ml") ||
      title.includes("neural") ||
      title.includes("quantum") ||
      title.includes("algorithm")
    )
      riskScore += 1.5;

    // Draft status
    if (pr.draft) riskScore += 0.5;

    // Cap the risk score between 1.0 and 10.0
    return Math.min(Math.max(riskScore, 1.0), 10.0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGitHubPRs(); // Refresh PRs from GitHub
    setRefreshing(false);
  };

  // Calculate overview stats from real PR data with API-provided risk scores
  const calculateOverviewStats = () => {
    const totalPRs = recentPRs.length;
    const activePRs = recentPRs.filter(
      (pr) =>
        pr.status === "critical" ||
        pr.status === "medium-risk" ||
        pr.status === "high-risk" ||
        pr.status === "low-risk"
    ).length;

    // Calculate average risk score (now using API-provided scores)
    const avgRiskScore =
      totalPRs > 0
        ? Math.round(
            recentPRs.reduce((sum, pr) => sum + (pr.riskScore || 0), 0) /
              totalPRs
          )
        : 0;

    // System health calculation based on API risk scores
    const systemHealth = Math.max(100 - avgRiskScore * 0.3, 80); // Inverse relationship with API risk

    return {
      totalPRs,
      activePRs,
      riskScore: avgRiskScore, // Average of API-provided risk scores
      systemHealth: Math.round(systemHealth * 10) / 10, // Based on API risk levels
    };
  };

  // Fetch PRs on component mount
  useEffect(() => {
    fetchGitHubPRs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  const handleAnalyzePR = (record: any) => {
    // Construct the PR URL from the record data
    const prUrl =
      record.githubData?.url ||
      `https://github.com/SayaliTal/${
        record.repository
      }/pull/${record.id.replace("#PR-", "")}`;

    // Navigate to the Analysis page with the PR URL pre-filled
    navigate("/pr-analysis", {
      state: {
        prUrl: prUrl,
        autoAnalyze: true,
      },
    });
  };

  const handleViewPR = (record: any) => {
    // Use the GitHub URL from the record if available, otherwise construct it
    const githubUrl =
      record.githubData?.url ||
      `https://github.com/SayaliTal/${
        record.repository
      }/pull/${record.id.replace("#PR-", "")}`;

    // Open the GitHub PR in a new tab
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  };

  // Risk level color mapping
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "#ff4d4f";
      case "high":
      case "high-risk":
        return "#ff7a45";
      case "medium":
      case "medium-risk":
        return "#ffa940";
      case "low":
      case "low-risk":
        return "#52c41a";
      default:
        return "#d9d9d9";
    }
  };

  const getRiskTag = (risk: string, score?: number) => (
    <Tag color={getRiskColor(risk)} style={{ fontWeight: "bold" }}>
      {risk.toUpperCase()} {score && `(${score})`}
    </Tag>
  );

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    suffix?: string;
    prefix?: React.ReactNode;
    trend?: "up" | "down";
    trendValue?: string;
    color?: string;
    icon?: React.ReactNode;
  }> = ({ title, value, suffix, prefix, trend, trendValue, color, icon }) => (
    <Card
      hoverable
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
            {title}
          </Text>
          <div
            style={{ display: "flex", alignItems: "center", marginTop: "8px" }}
          >
            {prefix}
            <Text
              style={{
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
                margin: "0 4px",
              }}
            >
              {value}
            </Text>
            {suffix && (
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>{suffix}</Text>
            )}
          </div>
          {trend && trendValue && (
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {trend === "up" ? (
                <ArrowUpOutlined
                  style={{ color: "#52c41a", marginRight: "4px" }}
                />
              ) : (
                <ArrowDownOutlined
                  style={{ color: "#ff4d4f", marginRight: "4px" }}
                />
              )}
              <Text
                style={{
                  color: trend === "up" ? "#52c41a" : "#ff4d4f",
                  fontSize: "12px",
                }}
              >
                {trendValue}
              </Text>
            </div>
          )}
        </div>
        {icon && <div style={{ fontSize: "32px", opacity: 0.8 }}>{icon}</div>}
      </div>
    </Card>
  );

  const PRTable = () => {
    const columns = [
      {
        title: "PR",
        dataIndex: "id",
        key: "id",
        width: 160, // Set width for PR column to accommodate titles
        render: (text: string, record: any) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={record.avatar}
              size={32}
              style={{ marginRight: "12px" }}
            >
              <UserOutlined />
            </Avatar>
            <div>
              <Text strong style={{ color: "#1890ff" }}>
                {text}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.title}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: "Author",
        dataIndex: "author",
        key: "author",
        width: 90, // Reduced width for Author column
        render: (author: string) => (
          <Text style={{ fontWeight: "500", fontSize: "12px" }}>{author}</Text>
        ),
      },
      {
        title: "Risk Level",
        dataIndex: "status",
        key: "status",
        width: 130, // Slightly reduced width for Risk Level column
        render: (status: string, record: any) => (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {getRiskTag(status, record.riskScore)}
              {record.apiData?.hasApiData ? (
                <Tag
                  color="blue"
                  style={{ fontSize: "8px", padding: "0 3px" }}
                >
                  API
                </Tag>
              ) : (
                <Tag
                  color="orange"
                  style={{ fontSize: "8px", padding: "0 3px" }}
                >
                  CALC
                </Tag>
              )}
            </div>
            <Progress
              percent={record.riskScore}
              size="small"
              strokeColor={getRiskColor(status)}
              showInfo={false}
              style={{ marginTop: "3px" }}
            />
            <Text type="secondary" style={{ fontSize: "10px" }}>
              {record.apiData?.hasApiData ? "Backend API" : "Calculated"}
            </Text>
          </div>
        ),
      },
      {
        title: "Changes",
        key: "changes",
        width: 130, // Slightly reduced width to prevent line wrapping
        // Shows actual GitHub API data: additions, deletions, and changed_files
        render: (record: any) => (
          <div style={{ minWidth: "110px" }}>
            {/* Main changes line - keep on single line */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "2px",
              flexWrap: "nowrap",
              whiteSpace: "nowrap"
            }}>
              <Text style={{ color: "#52c41a", fontWeight: "500", fontSize: "12px" }}>
                +{record.additions || 0}
              </Text>
              <Text type="secondary" style={{ margin: "0 1px" }}>/</Text>
              <Text style={{ color: "#ff4d4f", fontWeight: "500", fontSize: "12px" }}>
                -{record.deletions || 0}
              </Text>
              {record.githubData?.url && (
                <Tag
                  color="green"
                  style={{
                    fontSize: "7px",
                    padding: "0 2px",
                    marginLeft: "3px",
                    lineHeight: "10px",
                    height: "12px"
                  }}
                >
                  LIVE
                </Tag>
              )}
            </div>
            
            {/* File count and source info - more compact */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "3px",
                fontSize: "9px",
              }}
            >
              <Text type="secondary" style={{ fontSize: "9px" }}>
                📁 {record.files || 0}
              </Text>
              <Text type="secondary" style={{ fontSize: "8px" }}>
                {record.githubData?.url ? "API" : "EST"}
              </Text>
            </div>
            
            {/* Progress bar - more compact */}
            {record.additions + record.deletions > 0 && (
              <div style={{ marginTop: "2px" }}>
                <div
                  style={{
                    height: "2px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "1px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(
                        (record.additions /
                          (record.additions + record.deletions)) *
                          100,
                        100
                      )}%`,
                      backgroundColor: "#52c41a",
                      borderRadius: "1px",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Created",
        dataIndex: "created",
        key: "created",
        width: 85, // Reduced width for Created column
        render: (created: string) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{ marginRight: "3px", color: "#8c8c8c", fontSize: "11px" }}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>{created}</Text>
          </div>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 90, // Slightly increased width for better button appearance
        render: (record: any) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewPR(record)}
              style={{ width: "100px" }}
            >
              View
            </Button>
            <Button
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => handleAnalyzePR(record)}
              style={{ width: "100px" }}
            >
              Analyze
            </Button>
          </div>
        ),
      },
    ];

    return (
      <Spin
        spinning={loadingPRs}
        tip="Loading pull requests from GitHub and risk levels from API..."
      >
        <Table
          columns={columns}
          dataSource={recentPRs}
          pagination={false}
          size="middle"
          rowKey="id"
          scroll={{ x: 615 }}
        />
      </Spin>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title
            level={2}
            style={{ margin: 0, display: "flex", alignItems: "center" }}
          >
            <RobotOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
            AI-Powered Release Impact Dashboard
          </Title>
          <Text type="secondary">
            Real-time insights and risk analysis for your releases
          </Text>
        </div>
        <Space>
          <Text type="secondary">Real-time updates</Text>
          <Switch
            checked={realTimeUpdates}
            onChange={setRealTimeUpdates}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
          <Select
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            style={{ width: 120 }}
          >
            <Option value="1d">Last 24h</Option>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>
          <Button
            type="primary"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Alert Banner */}
      <Alert
        message="System Status: All systems operational"
        description="Last updated 2 minutes ago. No critical issues detected."
        type="success"
        showIcon
        style={{ marginBottom: "24px" }}
        action={
          <Button size="small" type="text">
            View Details
          </Button>
        }
      />

      {/* Error Alert */}
      {prError && (
        <Alert
          message="API Integration Error"
          description={`Failed to fetch live data: ${prError}. Showing sample data with mock risk levels instead.`}
          type="warning"
          showIcon
          closable
          onClose={() => setPrError("")}
          style={{ marginBottom: "24px" }}
          action={
            <Button
              size="small"
              type="primary"
              onClick={handleRefresh}
              loading={refreshing}
            >
              Retry
            </Button>
          }
        />
      )}

      {/* Key Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Pull Requests"
            value={calculateOverviewStats().totalPRs}
            trend="up"
            trendValue="From GitHub API"
            icon={<BugOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active Analyses"
            value={calculateOverviewStats().activePRs}
            trend="up"
            trendValue="Live from repository"
            icon={<BarChartOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Risk Score"
            value={calculateOverviewStats().riskScore}
            suffix="/100"
            trend={calculateOverviewStats().riskScore > 60 ? "up" : "down"}
            trendValue={
              calculateOverviewStats().riskScore > 60
                ? "High risk from API analysis"
                : "Low risk from API analysis"
            }
            icon={<ExclamationCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="System Health"
            value={calculateOverviewStats().systemHealth}
            suffix="%"
            trend="up"
            trendValue="Calculated from PR risk"
            icon={<SafetyOutlined />}
          />
        </Col>
      </Row>

      {/* GitHub API Setup Guide */}
      {!gitHubApiStatus.hasToken && gitHubApiStatus.showSetupGuide && (
        <Alert
          message="🔧 Enhance your experience with GitHub Authentication"
          description={
            <div>
              <div style={{ marginBottom: 12 }}>
                You're currently using GitHub API without authentication, which
                limits you to <strong>60 requests per hour</strong>. With a
                Personal Access Token, you can make{" "}
                <strong>5,000 requests per hour</strong> and access private
                repositories.
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Quick Setup:</strong>
                <ol style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>
                    Go to{" "}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub Settings → Personal Access Tokens
                    </a>
                  </li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>
                    Select scope: <code>public_repo</code> (for public repos) or{" "}
                    <code>repo</code> (for private repos)
                  </li>
                  <li>
                    Copy the token and add{" "}
                    <code>REACT_APP_GITHUB_TOKEN=your_token_here</code> to your{" "}
                    <code>.env</code> file
                  </li>
                  <li>Restart the application</li>
                </ol>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  size="small"
                  onClick={() =>
                    setGitHubApiStatus((prev) => ({
                      ...prev,
                      showSetupGuide: false,
                    }))
                  }
                >
                  Dismiss
                </Button>
                <Button
                  size="small"
                  type="primary"
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  icon={<LinkOutlined />}
                >
                  Create Token
                </Button>
              </div>
            </div>
          }
          type="info"
          showIcon
          closable
          onClose={() =>
            setGitHubApiStatus((prev) => ({ ...prev, showSetupGuide: false }))
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Rate Limit Warning */}
      {gitHubApiStatus.rateLimitInfo?.isNearLimit && (
        <Alert
          message="⚠️ GitHub API Rate Limit Warning"
          description={
            <div>
              <div>{gitHubApiStatus.rateLimitInfo.message}</div>
              {!gitHubApiStatus.hasToken && (
                <div style={{ marginTop: 8 }}>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() =>
                      setGitHubApiStatus((prev) => ({
                        ...prev,
                        showSetupGuide: true,
                      }))
                    }
                  >
                    Setup Authentication
                  </Button>
                </div>
              )}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* AI Engine Status */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <RobotOutlined
                  style={{ marginRight: "8px", color: "#722ed1" }}
                />
                AI Analysis Engine
              </span>
            }
            extra={<Badge status="processing" text="Active" />}
            style={{ height: "100%" }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Text>Accuracy Rate</Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <Progress
                  percent={94.2}
                  strokeColor="#52c41a"
                  style={{ flex: 1, marginRight: "16px" }}
                />
                <Text strong>94.2%</Text>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text>Analysis Speed</Text>
              <div style={{ marginTop: "8px" }}>
                <Statistic
                  value={2.3}
                  suffix="s"
                  precision={1}
                  valueStyle={{ fontSize: "20px" }}
                />
                <Text type="secondary">Average per PR</Text>
              </div>
            </div>
            <div>
              <Text>Models Active</Text>
              <div style={{ marginTop: "8px" }}>
                <Badge count={3} style={{ backgroundColor: "#52c41a" }}>
                  <span style={{ marginRight: "8px" }}>
                    Risk Assessment, Coverage, Performance
                  </span>
                </Badge>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Pull Requests"
            extra={
              <Space>
                <Button icon={<FilterOutlined />} size="small">
                  Filter
                </Button>
                <Button icon={<ExportOutlined />} size="small">
                  Export
                </Button>
              </Space>
            }
            style={{ height: "100%" }}
          >
            <PRTable />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EnhancedDashboard;
