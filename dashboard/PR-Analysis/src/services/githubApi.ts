import {
  GITHUB_CONFIG,
  GitHubFile,
  GitHubPullRequest,
  GitHubApiError,
  checkTokenPermissions,
} from "../config/github";

export class GitHubApiService {
  private static instance: GitHubApiService;

  private constructor() {}

  public static getInstance(): GitHubApiService {
    if (!GitHubApiService.instance) {
      GitHubApiService.instance = new GitHubApiService();
    }
    return GitHubApiService.instance;
  }

  /**
   * Extract repository and PR information from GitHub URL
   */
  public extractPRInfo(
    url: string
  ): { owner: string; repo: string; prNumber: number } | null {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
    const match = url.match(regex);

    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        prNumber: parseInt(match[3], 10),
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
   * Get repository information from GitHub API
   */
  public async getRepository(
    owner: string,
    repo: string
  ): Promise<{
    data?: any;
    error?: string;
    requiresAuth?: boolean;
  }> {
    console.log(`🌐 GitHub API Call: getRepository(${owner}/${repo})`);
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
      console.log(
        `✅ GitHub API Success: getRepository(${owner}/${repo}) - Repository: ${data.full_name}`
      );
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
   * Get files changed in a pull request from GitHub API
   */
  public async getPRFiles(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<{
    data?: GitHubFile[];
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

      const files = await response.json();
      return { data: files };
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
        return "Authentication required. Please provide a valid GitHub Personal Access Token.";
      case 403:
        if (errorData.message?.includes("rate limit")) {
          return "GitHub API rate limit exceeded. Please wait or use an authenticated token for higher limits.";
        }
        return "Access forbidden. Check if your token has the required permissions (repo or public_repo scope).";
      case 404:
        return "Pull request or repository not found. Check the URL and your access permissions.";
      case 422:
        return "Invalid request. Please check the PR URL format.";
      default:
        return `GitHub API error: ${status} - ${
          errorData.message || "Unknown error"
        }`;
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
}

// Export singleton instance
export const githubApi = GitHubApiService.getInstance();
