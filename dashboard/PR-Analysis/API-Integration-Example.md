# API Integration Example

This document shows how to integrate the new PR Analysis API with the existing React component.

## Updated PRAnalysis Component

Here's how to update the `handlePRAnalysis` function in `src/components/PRAnalysis.tsx`:

```typescript
import { prAnalysisApi, transformers, apiErrors } from "../services/api";
import { PRAnalysisData } from "../types";

const PRAnalysis: React.FC = () => {
  // ... existing state declarations ...
  const [apiData, setApiData] = useState<PRAnalysisData | null>(null);

  const handlePRAnalysis = async (url: string) => {
    if (!isValidUrl) {
      message.error("Please enter a valid PR URL");
      return;
    }

    setLoading(true);

    try {
      // Call the new API
      const analysisData = await prAnalysisApi.analyzePR({
        prUrl: url,
        options: {
          includeHistoricalData: true,
          includeTestRecommendations: true,
          complexityAnalysis: true,
          impactAnalysis: true,
        },
      });

      // Store the full API data
      setApiData(analysisData);

      // Transform for backward compatibility with existing UI
      const transformedData = transformers.transformPRData(analysisData);
      setAnalyzedPR(transformedData.pullRequest);

      message.success("PR analysis completed successfully!");
    } catch (error: any) {
      // Enhanced error handling
      if (apiErrors.isRateLimitError(error)) {
        message.error("Rate limit exceeded. Please try again later.");
      } else if (apiErrors.isAuthenticationError(error)) {
        message.error("Authentication required. Please log in.");
      } else if (apiErrors.isNotFoundError(error)) {
        message.error("Pull request not found or not accessible.");
      } else {
        message.error(apiErrors.getErrorMessage(error));
      }

      console.error("PR Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update data access to use API data when available
  const getCurrentData = () => {
    if (apiData) {
      return transformers.transformPRData(apiData);
    }
    // Fallback to mock data for development
    return {
      pullRequest: analyzedPR,
      complexityMetrics: mockComplexityMetrics,
      impactedModules: mockImpactedModules,
      testRecommendations: mockTestRecommendations,
      historicalData: mockHistoricalData,
    };
  };

  const currentData = getCurrentData();

  // Use currentData throughout the component instead of individual mock data
  // Example:
  // <ComplexityMetrics data={currentData.complexityMetrics} />
  // <ImpactedModules data={currentData.impactedModules} />
  // etc.
};
```

## Environment Configuration

Add API configuration to your environment files:

### `.env.development`

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_AUTH_REQUIRED=false
```

### `.env.production`

```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
REACT_APP_AUTH_REQUIRED=true
```

## Authentication Integration

If authentication is required, add login functionality:

```typescript
// src/components/Login.tsx
import { authApi } from "../services/api";

const Login: React.FC = () => {
  const handleLogin = async (token: string) => {
    authApi.setAuthToken(token);
    const isValid = await authApi.validateToken();

    if (isValid) {
      message.success("Logged in successfully");
      // Redirect to dashboard
    } else {
      message.error("Invalid token");
      authApi.removeAuthToken();
    }
  };

  // ... login form implementation
};
```

## Error Boundary

Add error boundary for better error handling:

```typescript
// src/components/ErrorBoundary.tsx
import React from "react";
import { Result, Button } from "antd";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Something went wrong"
          subTitle="An unexpected error occurred while analyzing the PR."
          extra={
            <Button
              type="primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Updated Component Structure

Here's how to structure components to use the new API data:

```typescript
// Enhanced test recommendations with full API data
const TestRecommendationsSection: React.FC<{
  recommendations: TestRecommendation[];
}> = ({ recommendations }) => {
  return (
    <div>
      {recommendations.map((item) => (
        <Card key={item.id}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <Title level={4}>{item.title}</Title>
              <Text type="secondary">{item.description}</Text>
            </div>
            <div>
              <Tag color={getTypeColor(item.type)}>{item.type}</Tag>
              <Tag color={getPriorityColor(item.priority)}>{item.priority}</Tag>
              <Text>Confidence: {Math.round(item.confidence * 100)}%</Text>
            </div>
          </div>

          {/* Enhanced test information */}
          <div style={{ marginTop: 16 }}>
            <Text strong>Estimated Effort: </Text>
            <Text>
              {item.estimatedEffort.hours} hours (
              {item.estimatedEffort.complexity})
            </Text>
          </div>

          <div style={{ marginTop: 8 }}>
            <Text strong>Test Coverage: </Text>
            <Text>
              {item.coverage.currentCoverage}% → {item.coverage.targetCoverage}%
              (Gap: {item.coverage.gap}%)
            </Text>
          </div>

          {/* Expandable test code with proper typing */}
          <Collapse ghost style={{ marginTop: 16 }}>
            <Panel header="View Test Code" key="1">
              <Card size="small" style={{ backgroundColor: "#f6f8fa" }}>
                <div style={{ marginBottom: 8 }}>
                  <Tag>{item.testCode.language}</Tag>
                  <Tag>{item.testCode.framework}</Tag>
                </div>
                <pre
                  style={{
                    fontSize: 12,
                    fontFamily: "Monaco, monospace",
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
  );
};
```

## Migration Strategy

### Phase 1: Dual Mode (Current)

- Keep existing mock data as fallback
- Add API integration alongside mock data
- Use feature flag to switch between modes

### Phase 2: API-First

- Default to API data
- Keep mock data for development/testing only
- Add proper loading states and error handling

### Phase 3: Full Migration

- Remove mock data dependencies
- Optimize for API-first workflow
- Add advanced features (caching, real-time updates)

## Testing Integration

Add API testing alongside existing tests:

```typescript
// src/services/__tests__/api.test.ts
import { prAnalysisApi, transformers, apiErrors } from "../api";

describe("PR Analysis API", () => {
  test("should validate PR URLs correctly", () => {
    expect(
      transformers.validatePRUrl("https://github.com/owner/repo/pull/123")
    ).toBe(true);
    expect(
      transformers.validatePRUrl(
        "https://gitlab.com/owner/repo/-/merge_requests/123"
      )
    ).toBe(true);
    expect(transformers.validatePRUrl("https://invalid-url.com")).toBe(false);
  });

  test("should parse repository info from URL", () => {
    const result = transformers.parseRepositoryFromUrl(
      "https://github.com/owner/repo/pull/123"
    );
    expect(result).toEqual({
      platform: "github",
      owner: "owner",
      repo: "repo",
      number: 123,
    });
  });

  test("should handle API errors gracefully", () => {
    const rateLimitError = { code: "RATE_LIMIT_EXCEEDED" };
    expect(apiErrors.isRateLimitError(rateLimitError)).toBe(true);

    const authError = { code: "AUTHENTICATION_REQUIRED" };
    expect(apiErrors.isAuthenticationError(authError)).toBe(true);
  });
});
```

This integration approach allows for a smooth transition from mock data to real API data while maintaining backward compatibility with the existing UI components.
