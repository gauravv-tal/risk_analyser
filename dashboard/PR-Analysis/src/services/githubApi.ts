import {
  GITHUB_CONFIG,
  GitHubFile,
  GitHubPullRequest,
  GitHubApiError,
  checkTokenPermissions,
} from "../config/github";

export class GitHubApiService {
  private static instance: GitHubApiService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastRateLimitCheck: number = 0;
  private cachedRateLimit: any = null;

  private constructor() {}

  public static getInstance(): GitHubApiService {
    if (!GitHubApiService.instance) {
      GitHubApiService.instance = new GitHubApiService();
    }
    return GitHubApiService.instance;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  /**
   * Get cached data if available and valid
   */
  private getCachedData(cacheKey: string): any | null {
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      console.log(`💾 Using cached data for: ${cacheKey}`);
      return cached?.data || null;
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private setCachedData(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    console.log(`💾 Cached data for: ${cacheKey}`);
  }

  /**
   * Check rate limit status before making requests
   */
  private async checkRateLimit(): Promise<{
    canProceed: boolean;
    rateLimitInfo?: any;
    waitTime?: number;
  }> {
    const now = Date.now();

    // Check rate limit every 2 minutes to avoid excessive requests
    if (now - this.lastRateLimitCheck < 2 * 60 * 1000 && this.cachedRateLimit) {
      const remaining = this.cachedRateLimit.remaining;
      const resetTime = this.cachedRateLimit.reset * 1000;

      if (remaining <= 1 && now < resetTime) {
        const waitTime = Math.ceil((resetTime - now) / 1000 / 60); // minutes
        return {
          canProceed: false,
          rateLimitInfo: this.cachedRateLimit,
          waitTime,
        };
      }
      return { canProceed: true, rateLimitInfo: this.cachedRateLimit };
    }

    // Check current rate limit
    try {
      const rateLimitInfo = await this.getRateLimit();
      this.lastRateLimitCheck = now;
      this.cachedRateLimit = rateLimitInfo;

      if (rateLimitInfo && rateLimitInfo.remaining <= 1) {
        const resetTime = rateLimitInfo.reset * 1000;
        const waitTime = Math.ceil((resetTime - now) / 1000 / 60); // minutes
        return {
          canProceed: false,
          rateLimitInfo,
          waitTime,
        };
      }

      return { canProceed: true, rateLimitInfo };
    } catch (error) {
      // If we can't check rate limit, proceed cautiously
      console.warn("⚠️ Could not check rate limit status");
      return { canProceed: true };
    }
  }

  /**
   * Extract PR information from GitHub URL
   */
  public extractPRInfo(url: string): {
    owner: string;
    repo: string;
    prNumber: number;
  } | null {
    const githubPRPattern = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
    const match = url.match(githubPRPattern);

    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        prNumber: parseInt(match[3]),
      };
    }

    return null;
  }

  /**
   * Get pull request information from GitHub API
   */
  public async getPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<{
    data?: GitHubPullRequest;
    error?: string;
    requiresAuth?: boolean;
  }> {
    try {
      // Check permissions first
      const permissionCheck = await checkTokenPermissions(`${owner}/${repo}`);
      if (!permissionCheck.hasAccess) {
        return {
          error: permissionCheck.error,
          requiresAuth: true,
        };
      }

      const response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: this.handleApiError(response.status, errorData),
          requiresAuth: response.status === 401 || response.status === 403,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get repository information
   */
  public async getRepository(
    owner: string,
    repo: string
  ): Promise<{
    data?: any;
    error?: string;
    requiresAuth?: boolean;
    rateLimitInfo?: any;
  }> {
    const cacheKey = `repo-${owner}-${repo}`;
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      return { data: cachedData };
    }

    // Check rate limit before making request
    const rateLimitCheck = await this.checkRateLimit();
    if (!rateLimitCheck.canProceed) {
      return {
        error: `GitHub API rate limit exceeded. Please wait ${rateLimitCheck.waitTime} minutes or configure a GitHub Personal Access Token for higher limits.`,
        requiresAuth: !GITHUB_CONFIG.TOKEN,
        rateLimitInfo: rateLimitCheck.rateLimitInfo,
      };
    }

    console.log(`🌐 GitHub API Call: getRepository(${owner}/${repo})`);
    console.log(
      `📊 Rate limit status: ${
        rateLimitCheck.rateLimitInfo?.remaining || "unknown"
      } requests remaining`
    );

    try {
      const response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/repos/${owner}/${repo}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: this.handleApiError(response.status, errorData),
          requiresAuth: response.status === 401 || response.status === 403,
        };
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);

      console.log(`✅ GitHub API Success: getRepository(${owner}/${repo})`);
      return { data, rateLimitInfo: rateLimitCheck.rateLimitInfo };
    } catch (error) {
      return {
        error: `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get pull requests from a repository
   */
  public async getPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "all",
    per_page: number = 30
  ): Promise<{
    data?: any[];
    error?: string;
    requiresAuth?: boolean;
    rateLimitInfo?: any;
  }> {
    const cacheKey = `prs-${owner}-${repo}-${state}-${per_page}`;
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      return { data: cachedData };
    }

    // Check rate limit before making request
    const rateLimitCheck = await this.checkRateLimit();
    if (!rateLimitCheck.canProceed) {
      return {
        error: `GitHub API rate limit exceeded. Please wait ${rateLimitCheck.waitTime} minutes or configure a GitHub Personal Access Token for higher limits.`,
        requiresAuth: !GITHUB_CONFIG.TOKEN,
        rateLimitInfo: rateLimitCheck.rateLimitInfo,
      };
    }

    console.log(`🌐 GitHub API Call: getPullRequests(${owner}/${repo})`);
    console.log(
      `📊 Rate limit status: ${
        rateLimitCheck.rateLimitInfo?.remaining || "unknown"
      } requests remaining`
    );

    try {
      const response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/repos/${owner}/${repo}/pulls?state=${state}&per_page=${per_page}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: this.handleApiError(response.status, errorData),
          requiresAuth: response.status === 401 || response.status === 403,
        };
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);

      console.log(
        `✅ GitHub API Success: getPullRequests(${owner}/${repo}) - Found ${data.length} PRs`
      );
      return { data, rateLimitInfo: rateLimitCheck.rateLimitInfo };
    } catch (error) {
      return {
        error: `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Transform GitHub pull requests to our internal PullRequest format
   */
  public transformGitHubPRsToPullRequests(githubPRs: any[]): any[] {
    return githubPRs.map((pr) => ({
      id: pr.number.toString(),
      url: pr.html_url,
      number: pr.number,
      title: pr.title,
      description: pr.body || "No description provided",
      author: {
        username: pr.user.login,
        displayName: pr.user.login,
        avatarUrl: pr.user.avatar_url,
      },
      status: pr.state, // 'open' or 'closed'
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      branch: {
        source: pr.head.ref,
        target: pr.base.ref,
      },
      repository: {
        name: pr.base.repo.name,
        owner: pr.base.repo.owner.login,
        fullName: pr.base.repo.full_name,
        platform: "github",
      },
      // Calculate a basic risk score based on PR characteristics
      riskScore: this.calculatePRRiskScore(pr),
      // Additional GitHub-specific fields
      githubData: {
        state: pr.state,
        merged: pr.merged,
        draft: pr.draft,
        mergeable: pr.mergeable,
        comments: pr.comments,
        review_comments: pr.review_comments,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
      },
    }));
  }

  /**
   * Calculate basic risk score based on PR characteristics
   */
  private calculatePRRiskScore(pr: any): number {
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

    // Title/description-based risk factors
    const title = pr.title.toLowerCase();
    const body = (pr.body || "").toLowerCase();

    if (title.includes("wip") || title.includes("work in progress"))
      riskScore += 1.0;
    if (title.includes("do not merge") || title.includes("draft"))
      riskScore += 0.5;
    if (title.includes("breaking") || title.includes("major")) riskScore += 2.0;
    if (title.includes("security") || title.includes("auth")) riskScore += 1.5;
    if (title.includes("database") || title.includes("migration"))
      riskScore += 1.0;
    if (title.includes("config") || title.includes("environment"))
      riskScore += 0.5;

    // AI/ML related keywords increase complexity
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
  }

  /**
   * Get PR files with changes
   */
  public async getPRFiles(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<{
    data?: any[];
    error?: string;
    requiresAuth?: boolean;
    rateLimitInfo?: any;
  }> {
    const cacheKey = `pr-files-${owner}-${repo}-${prNumber}`;
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      return { data: cachedData };
    }

    // Check rate limit before making request
    const rateLimitCheck = await this.checkRateLimit();
    if (!rateLimitCheck.canProceed) {
      return {
        error: `GitHub API rate limit exceeded. Please wait ${rateLimitCheck.waitTime} minutes or configure a GitHub Personal Access Token for higher limits.`,
        requiresAuth: !GITHUB_CONFIG.TOKEN,
        rateLimitInfo: rateLimitCheck.rateLimitInfo,
      };
    }

    console.log(`🌐 GitHub API Call: getPRFiles(${owner}/${repo}#${prNumber})`);
    console.log(
      `📊 Rate limit status: ${
        rateLimitCheck.rateLimitInfo?.remaining || "unknown"
      } requests remaining`
    );

    try {
      const response = await fetch(
        `${GITHUB_CONFIG.API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: this.handleApiError(response.status, errorData),
          requiresAuth: response.status === 401 || response.status === 403,
        };
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);

      console.log(
        `✅ GitHub API Success: getPRFiles(${owner}/${repo}#${prNumber}) - Found ${data.length} files`
      );
      return { data, rateLimitInfo: rateLimitCheck.rateLimitInfo };
    } catch (error) {
      return {
        error: `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Transform GitHub files to our internal format
   */
  public transformGitHubFilesToChanges(githubFiles: GitHubFile[]): any[] {
    return githubFiles.map((file, index) => ({
      id: index + 1,
      fileName: file.filename,
      filePath: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: this.extractChangesFromPatch(file.patch || "", file.filename),
    }));
  }

  /**
   * Extract individual changes from Git patch format
   */
  private extractChangesFromPatch(patch: string, fileName: string): any[] {
    if (!patch) {
      return [
        {
          type: "modification",
          lineNumber: 1,
          oldContent: `// Previous content in ${fileName}`,
          newContent: `// Updated content in ${fileName}`,
          context: "File modified (patch not available)",
        },
      ];
    }

    const changes: any[] = [];
    const lines = patch.split("\n");
    let currentLine = 1;

    for (const line of lines) {
      if (line.startsWith("@@")) {
        // Extract line number from hunk header
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          currentLine = parseInt(match[2], 10);
        }
        continue;
      }

      if (line.startsWith("+") && !line.startsWith("+++")) {
        changes.push({
          type: "addition",
          lineNumber: currentLine,
          content: line.substring(1),
          context: `Added at line ${currentLine}`,
        });
        currentLine++;
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        changes.push({
          type: "deletion",
          lineNumber: currentLine,
          content: line.substring(1),
          context: `Removed from line ${currentLine}`,
        });
      } else if (line.startsWith(" ")) {
        currentLine++;
      }
    }

    // If no changes extracted, add a generic one
    if (changes.length === 0) {
      changes.push({
        type: "modification",
        lineNumber: 1,
        oldContent: `// Previous content in ${fileName}`,
        newContent: `// Updated content in ${fileName}`,
        context: "File modified",
      });
    }

    return changes;
  }

  /**
   * Get appropriate headers for GitHub API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Risk-Analyzer-App/1.0",
    };

    if (GITHUB_CONFIG.TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_CONFIG.TOKEN}`;
    }

    return headers;
  }

  /**
   * Handle GitHub API error responses
   */
  private handleApiError(status: number, errorData: any): string {
    switch (status) {
      case 401:
        return "Authentication required. Please provide a valid GitHub Personal Access Token with 'public_repo' scope for public repositories or 'repo' scope for private repositories.";
      case 403:
        if (
          errorData.message?.includes("rate limit") ||
          errorData.message?.includes("API rate limit")
        ) {
          const rateLimitType = GITHUB_CONFIG.TOKEN
            ? "authenticated"
            : "unauthenticated";
          const currentLimit = GITHUB_CONFIG.TOKEN
            ? "5,000 requests/hour"
            : "60 requests/hour";
          const suggestion = GITHUB_CONFIG.TOKEN
            ? "Please wait for the rate limit to reset or reduce API usage."
            : "Configure a GitHub Personal Access Token to increase your rate limit to 5,000 requests/hour.";

          return `GitHub API rate limit exceeded for ${rateLimitType} requests (${currentLimit}). ${suggestion}`;
        }
        if (errorData.message?.includes("access blocked")) {
          return "Access to this repository is blocked. This may be a private repository requiring authentication or additional permissions.";
        }
        return `Access forbidden. ${
          GITHUB_CONFIG.TOKEN
            ? "Your token may lack required permissions (repo or public_repo scope)."
            : "Authentication required - please configure a GitHub Personal Access Token."
        }`;
      case 404:
        return "Repository or pull request not found. Please verify the URL is correct and you have access to this repository.";
      case 422:
        return "Invalid request parameters. Please check the repository name and PR number format.";
      case 500:
      case 502:
      case 503:
        return "GitHub API is experiencing issues. Please try again in a few minutes.";
      default:
        const message = errorData.message || "Unknown error";
        return `GitHub API error (${status}): ${message}`;
    }
  }

  /**
   * Check if GitHub token is configured
   */
  public isTokenConfigured(): boolean {
    return Boolean(GITHUB_CONFIG.TOKEN);
  }

  /**
   * Get current rate limit status
   */
  public async getRateLimit(): Promise<{
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  } | null> {
    try {
      const response = await fetch(`${GITHUB_CONFIG.API_BASE_URL}/rate_limit`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.rate;
      }
    } catch (error) {
      console.error("Failed to get rate limit:", error);
    }

    return null;
  }

  /**
   * Get formatted rate limit status for user display
   */
  public async getRateLimitStatus(): Promise<{
    remaining: number;
    limit: number;
    resetTime: string;
    resetIn: string;
    isNearLimit: boolean;
    message: string;
  } | null> {
    const rateLimit = await this.getRateLimit();
    if (!rateLimit) return null;

    const resetDate = new Date(rateLimit.reset * 1000);
    const now = new Date();
    const minutesUntilReset = Math.ceil(
      (resetDate.getTime() - now.getTime()) / 1000 / 60
    );

    const isNearLimit = rateLimit.remaining < 10;
    const hasToken = Boolean(GITHUB_CONFIG.TOKEN);

    let message = `${rateLimit.remaining}/${rateLimit.limit} API requests remaining`;
    if (isNearLimit) {
      message += `. Rate limit resets in ${minutesUntilReset} minutes.`;
      if (!hasToken) {
        message += " Consider adding a GitHub token for higher limits.";
      }
    }

    return {
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
      resetTime: resetDate.toLocaleTimeString(),
      resetIn: `${minutesUntilReset} minutes`,
      isNearLimit,
      message,
    };
  }

  /**
   * Clear cache for specific keys or all cache
   */
  public clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
        key.includes(pattern)
      );
      keysToDelete.forEach((key) => this.cache.delete(key));
      console.log(
        `💾 Cleared cache for pattern: ${pattern} (${keysToDelete.length} items)`
      );
    } else {
      this.cache.clear();
      console.log("💾 Cleared all cache");
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    totalItems: number;
    cacheSize: string;
    oldestItem: string;
  } {
    const now = Date.now();
    const items = Array.from(this.cache.entries());
    const oldestTimestamp = Math.min(
      ...items.map(([_, value]) => value.timestamp)
    );
    const oldestAge = Math.round((now - oldestTimestamp) / 1000 / 60);

    return {
      totalItems: items.length,
      cacheSize: `${Math.round(JSON.stringify(items).length / 1024)}KB`,
      oldestItem: `${oldestAge} minutes ago`,
    };
  }
}

// Export singleton instance
export const githubApi = GitHubApiService.getInstance();
