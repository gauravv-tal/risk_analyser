// Base interfaces for the PR Analysis Dashboard
export interface PullRequest {
  id: string;
  url: string;
  number: number;
  title: string;
  description?: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  status: "open" | "closed" | "merged";
  createdAt: string;
  updatedAt: string;
  branch: {
    source: string;
    target: string;
  };
  repository: {
    name: string;
    owner: string;
    fullName: string;
    platform: "github" | "gitlab";
  };
  riskScore: number; // For backward compatibility with existing UI
}

export interface RiskFactor {
  category:
    | "codeComplexity"
    | "criticalPath"
    | "testCoverage"
    | "historicalPattern"
    | "dependencies";
  impact: "high" | "medium" | "low";
  score: number;
  description: string;
}

export interface RiskAssessment {
  overallScore: number;
  riskLevel: "high" | "medium" | "low";
  confidence: number;
  factors: RiskFactor[];
  reasoning: string;
}

export interface ComplexityMetric {
  current: number;
  baseline: number;
  change: number;
  threshold: number;
  status: "exceeded" | "within_threshold" | "below_threshold";
}

export interface ComplexityMetrics {
  cyclomatic: ComplexityMetric;
  cognitive: ComplexityMetric;
  maintainability: ComplexityMetric;
  linesOfCode: {
    added: number;
    deleted: number;
    modified: number;
    total: number;
  };
  // Backward compatibility
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
}

export interface ModuleMetrics {
  linesChanged: number;
  functionsModified: number;
  testCoverageImpact: number;
}

export interface ImpactedModule {
  id: string;
  name: string;
  riskLevel: "high" | "medium" | "low";
  confidence: number;
  description: string;
  affectedFiles: string[];
  dependencies: string[];
  metrics: ModuleMetrics;
  riskFactors: string[];
  // Additional fields from API response
  componentType?: string;
  businessImpact?: string;
  filePath?: string;
}

export interface TestCoverage {
  currentCoverage: number;
  targetCoverage: number;
  gap: number;
}

export interface EstimatedEffort {
  hours: number;
  complexity: "low" | "medium" | "high";
}

export interface TestCode {
  language: string;
  framework: string;
  code: string;
}

export interface TestRecommendation {
  id: string;
  title: string;
  type: "unit" | "integration" | "e2e";
  priority: "high" | "medium" | "low";
  estimatedEffort: EstimatedEffort;
  confidence: number;
  description: string;
  rationale: string;
  coverage: TestCoverage;
  testCategories: string[];
  testCode: TestCode;
  relatedFiles: string[];
  // Backward compatibility
  estimatedTime: string;
}

export interface HistoricalEvent {
  type: "deployment" | "hotfix" | "rollback";
  status?: "success" | "failed";
  description?: string;
  timestamp: string;
  error?: string;
}

export interface HistoricalRiskData {
  date: string;
  riskScore: number;
  pullRequestCount: number;
  hotfixCount: number;
  deploymentSuccess: boolean;
  description: string;
  riskTrend: "increasing" | "decreasing" | "stable" | "critical";
  events: HistoricalEvent[];
}

export interface AIModel {
  name: string;
  version: string;
  confidence: number;
}

export interface DataSource {
  codeRepository: "github" | "gitlab";
  commitSha: string;
  baseBranch: string;
  headBranch: string;
}

export interface AnalysisMetadata {
  analysisId: string;
  timestamp: string;
  processingTime: number;
  aiModel: AIModel;
  dataSource: DataSource;
}

export interface DashboardStats {
  totalPRs: number;
  highRiskPRs: number;
  averageRiskScore: number;
  testCoverage: number;
}

// API Response interfaces
export interface ApiError {
  code: string;
  message: string;
  details: Record<string, any>;
}

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  processingTime?: number;
  version: string;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  error?: ApiError;
  meta: ApiMeta;
}

export interface PRAnalysisData {
  pullRequest: PullRequest;
  riskAssessment: RiskAssessment;
  complexityMetrics: ComplexityMetrics;
  impactedModules: ImpactedModule[];
  testRecommendations: TestRecommendation[];
  historicalAnalysis: HistoricalRiskData[];
  analysisMetadata: AnalysisMetadata;
}

export interface PRAnalysisRequest {
  prUrl: string;
  options?: {
    includeHistoricalData?: boolean;
    includeTestRecommendations?: boolean;
    complexityAnalysis?: boolean;
    impactAnalysis?: boolean;
  };
}

// Utility types for frontend state management
export interface UIState {
  loading: boolean;
  error: string | null;
  data: PRAnalysisData | null;
}

export interface FilterState {
  searchTerm: string;
  activeTab: "all" | "unit" | "integration" | "e2e";
  priorityFilter: "all" | "high" | "medium" | "low";
}

// Export for backward compatibility
export type { PullRequest as PR };
