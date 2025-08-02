// GitHub API Configuration and Permissions
export const GITHUB_CONFIG = {
  API_BASE_URL: "https://api.github.com",
  // GitHub Personal Access Token - should be set in environment variables
  TOKEN: process.env.REACT_APP_GITHUB_TOKEN || "",

  // Rate limits
  RATE_LIMIT: {
    AUTHENTICATED: 5000, // requests per hour with token
    UNAUTHENTICATED: 60, // requests per hour without token
  },

  // Required scopes for different repository types
  REQUIRED_SCOPES: {
    PUBLIC_REPO: ["public_repo"], // For public repositories
    PRIVATE_REPO: ["repo"], // For private repositories (includes public_repo)
  },
};

/**
 * GitHub API Permissions Required:
 *
 * PUBLIC REPOSITORIES:
 * - Basic info accessible without authentication
 * - Detailed file changes usually require authentication for better rate limits
 * - Recommended scope: 'public_repo'
 *
 * PRIVATE REPOSITORIES:
 * - Definitely need authentication + repository access
 * - Required scope: 'repo' (includes full repository access)
 *
 * TOKEN SETUP:
 * 1. Go to GitHub Settings > Developer settings > Personal access tokens
 * 2. Generate new token with appropriate scopes:
 *    - For public repos only: select 'public_repo'
 *    - For private repos: select 'repo' (full access)
 * 3. Set token in environment variable: REACT_APP_GITHUB_TOKEN
 *
 * OAUTH APP ALTERNATIVE:
 * - Can also use OAuth App for production deployments
 * - Provides better security and user consent flow
 */

export interface GitHubApiError {
  message: string;
  documentation_url?: string;
  status: number;
}

export interface GitHubFile {
  sha: string;
  filename: string;
  status:
    | "added"
    | "removed"
    | "modified"
    | "renamed"
    | "copied"
    | "changed"
    | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  merged: boolean;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
      private: boolean;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
      private: boolean;
    };
  };
  created_at: string;
  updated_at: string;
  html_url: string;
}

// Helper function to check if token has required permissions
export const checkTokenPermissions = async (
  repoFullName: string
): Promise<{
  hasAccess: boolean;
  isPrivate: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${GITHUB_CONFIG.API_BASE_URL}/repos/${repoFullName}`,
      {
        headers: GITHUB_CONFIG.TOKEN
          ? {
              Authorization: `Bearer ${GITHUB_CONFIG.TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            }
          : {
              Accept: "application/vnd.github.v3+json",
            },
      }
    );

    if (response.ok) {
      const repo = await response.json();
      return {
        hasAccess: true,
        isPrivate: repo.private,
      };
    } else if (response.status === 401) {
      return {
        hasAccess: false,
        isPrivate: true, // Assume private if unauthorized
        error: "Authentication required. Please provide a valid GitHub token.",
      };
    } else if (response.status === 404) {
      return {
        hasAccess: false,
        isPrivate: true, // Could be private or non-existent
        error:
          "Repository not found or access denied. Check if the repository exists and you have proper permissions.",
      };
    } else {
      return {
        hasAccess: false,
        isPrivate: false,
        error: `GitHub API error: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      hasAccess: false,
      isPrivate: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};
