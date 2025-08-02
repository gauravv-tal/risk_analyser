import {
  PRAnalysisRequest,
  PRAnalysisData,
  ApiResponse,
  PullRequest,
  ComplexityMetrics,
  ImpactedModule,
  TestRecommendation,
  HistoricalRiskData,
} from "../types";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";
const API_VERSION = "v1";

// Authentication token management
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token") || null;
};

const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem("auth_token");
};

// HTTP client with authentication
const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Version": API_VERSION,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || `HTTP Error: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  },
};

// PR Analysis API functions
export const prAnalysisApi = {
  /**
   * Analyze a pull request and return comprehensive analysis data
   */
  async analyzePR(request: PRAnalysisRequest): Promise<PRAnalysisData> {
    const response = await apiClient.post<PRAnalysisData>(
      "/analyze-pr",
      request
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || "Analysis failed");
  },

  /**
   * Get historical analysis data for a repository
   */
  async getHistoricalData(
    repository: string,
    days: number = 30
  ): Promise<HistoricalRiskData[]> {
    const response = await apiClient.get<HistoricalRiskData[]>(
      `/historical-analysis?repository=${repository}&days=${days}`
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    return [];
  },

  /**
   * Get analysis status for a specific analysis ID
   */
  async getAnalysisStatus(
    analysisId: string
  ): Promise<{ status: string; progress: number }> {
    const response = await apiClient.get<{ status: string; progress: number }>(
      `/analysis-status/${analysisId}`
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to get analysis status");
  },
};

// Data transformation utilities
export const transformers = {
  /**
   * Transform API response to maintain backward compatibility with existing UI
   */
  transformPRData(apiData: PRAnalysisData): {
    pullRequest: PullRequest;
    complexityMetrics: ComplexityMetrics;
    impactedModules: ImpactedModule[];
    testRecommendations: TestRecommendation[];
    historicalData: HistoricalRiskData[];
  } {
    // Add backward compatibility fields
    const transformedPR: PullRequest = {
      ...apiData.pullRequest,
      riskScore: apiData.riskAssessment.overallScore,
      description: apiData.riskAssessment.reasoning,
    };

    const transformedComplexity: ComplexityMetrics = {
      ...apiData.complexityMetrics,
      // Backward compatibility
      cyclomaticComplexity: apiData.complexityMetrics.cyclomatic.current,
      cognitiveComplexity: apiData.complexityMetrics.cognitive.current,
      maintainabilityIndex: apiData.complexityMetrics.maintainability.current,
    };

    const transformedTestRecommendations: TestRecommendation[] =
      apiData.testRecommendations.map((rec) => ({
        ...rec,
        // Backward compatibility
        estimatedTime: `${rec.estimatedEffort.hours} hours`,
      }));

    return {
      pullRequest: transformedPR,
      complexityMetrics: transformedComplexity,
      impactedModules: apiData.impactedModules,
      testRecommendations: transformedTestRecommendations,
      historicalData: apiData.historicalAnalysis,
    };
  },

  /**
   * Validate PR URL format
   */
  validatePRUrl(url: string): boolean {
    const githubPattern =
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+\/?(\?.*)?$/;
    const gitlabPattern =
      /^https:\/\/gitlab\.com\/[\w.-]+\/[\w.-]+(\/.*)?\/merge_requests\/\d+\/?(\?.*)?$/;

    return githubPattern.test(url.trim()) || gitlabPattern.test(url.trim());
  },

  /**
   * Extract repository information from PR URL
   */
  parseRepositoryFromUrl(url: string): {
    platform: "github" | "gitlab";
    owner: string;
    repo: string;
    number: number;
  } | null {
    const githubMatch = url.match(
      /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)/
    );
    if (githubMatch) {
      return {
        platform: "github",
        owner: githubMatch[1],
        repo: githubMatch[2],
        number: parseInt(githubMatch[3], 10),
      };
    }

    const gitlabMatch = url.match(
      /^https:\/\/gitlab\.com\/([\w.-]+)\/([\w.-]+).*\/merge_requests\/(\d+)/
    );
    if (gitlabMatch) {
      return {
        platform: "gitlab",
        owner: gitlabMatch[1],
        repo: gitlabMatch[2],
        number: parseInt(gitlabMatch[3], 10),
      };
    }

    return null;
  },
};

// Error handling utilities
export const apiErrors = {
  isRateLimitError(error: any): boolean {
    return error?.code === "RATE_LIMIT_EXCEEDED";
  },

  isAuthenticationError(error: any): boolean {
    return (
      error?.code === "AUTHENTICATION_REQUIRED" ||
      error?.code === "ACCESS_DENIED"
    );
  },

  isNotFoundError(error: any): boolean {
    return error?.code === "PR_NOT_FOUND";
  },

  getErrorMessage(error: any): string {
    if (error?.message) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
  },
};

// Authentication functions
export const authApi = {
  setAuthToken,
  removeAuthToken,
  getAuthToken,

  async validateToken(): Promise<boolean> {
    try {
      const response = await apiClient.get("/auth/validate");
      return response.status === "success";
    } catch {
      return false;
    }
  },
};

// Export all API functions
export { apiClient, getAuthToken, setAuthToken, removeAuthToken };

// Default export for convenience
export default {
  prAnalysis: prAnalysisApi,
  transformers,
  errors: apiErrors,
  auth: authApi,
};
