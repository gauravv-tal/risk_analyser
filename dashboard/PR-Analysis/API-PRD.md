# PR Analysis API - Product Requirements Document

## Overview

This document defines the API specification for the PR Risk Analysis service that powers the AI-Powered Impact & Risk Dashboard. The API analyzes GitHub and GitLab pull requests to provide comprehensive risk assessment, complexity metrics, impacted modules analysis, AI-generated test recommendations, and historical risk data.

## API Endpoint

### Analyze Pull Request

**POST** `/api/analyze-pr`

Analyzes a given pull request URL and returns comprehensive risk analysis data.

---

## Request Specification

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <access_token>
X-API-Version: v1
```

### Request Body

```json
{
  "prUrl": "https://github.com/owner/repo/pull/123",
  "options": {
    "includeHistoricalData": true,
    "includeTestRecommendations": true,
    "complexityAnalysis": true,
    "impactAnalysis": true
  }
}
```

### Request Parameters

| Field                                | Type    | Required | Description                                       |
| ------------------------------------ | ------- | -------- | ------------------------------------------------- |
| `prUrl`                              | string  | Yes      | Full URL of the GitHub/GitLab pull request        |
| `options.includeHistoricalData`      | boolean | No       | Include historical risk analysis (default: true)  |
| `options.includeTestRecommendations` | boolean | No       | Include AI test recommendations (default: true)   |
| `options.complexityAnalysis`         | boolean | No       | Include complexity metrics (default: true)        |
| `options.impactAnalysis`             | boolean | No       | Include impacted modules analysis (default: true) |

### Supported URL Formats

- GitHub: `https://github.com/{owner}/{repo}/pull/{number}`
- GitLab: `https://gitlab.com/{owner}/{repo}/-/merge_requests/{number}`

---

## Response Specification

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "pullRequest": {
      "id": "pr-123-github-owner-repo",
      "url": "https://github.com/owner/repo/pull/123",
      "number": 123,
      "title": "Refactor billing service architecture",
      "description": "This PR affects core billing logic and may impact payment processing",
      "author": {
        "username": "john.doe",
        "displayName": "John Doe",
        "avatarUrl": "https://github.com/john.doe.png"
      },
      "status": "open",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:20:00Z",
      "branch": {
        "source": "feature/billing-refactor",
        "target": "main"
      },
      "repository": {
        "name": "billing-service",
        "owner": "company",
        "fullName": "company/billing-service",
        "platform": "github"
      }
    },
    "riskAssessment": {
      "overallScore": 8.5,
      "riskLevel": "high",
      "confidence": 0.92,
      "factors": [
        {
          "category": "codeComplexity",
          "impact": "high",
          "score": 8.2,
          "description": "High cyclomatic complexity in billing logic"
        },
        {
          "category": "criticalPath",
          "impact": "high",
          "score": 9.1,
          "description": "Changes affect payment processing pipeline"
        },
        {
          "category": "testCoverage",
          "impact": "medium",
          "score": 6.8,
          "description": "Moderate test coverage for modified files"
        }
      ],
      "reasoning": "This PR affects core billing logic and may impact payment processing. The high complexity combined with critical system changes elevates the risk level."
    },
    "complexityMetrics": {
      "cyclomatic": {
        "current": 15,
        "baseline": 8,
        "change": 7,
        "threshold": 10,
        "status": "exceeded"
      },
      "cognitive": {
        "current": 8,
        "baseline": 5,
        "change": 3,
        "threshold": 7,
        "status": "exceeded"
      },
      "maintainability": {
        "current": 65,
        "baseline": 78,
        "change": -13,
        "threshold": 70,
        "status": "below_threshold"
      },
      "linesOfCode": {
        "added": 247,
        "deleted": 156,
        "modified": 89,
        "total": 492
      }
    },
    "impactedModules": [
      {
        "id": "billing-core",
        "name": "Billing Core",
        "riskLevel": "high",
        "confidence": 0.95,
        "description": "Core billing logic changes affect payment flow and invoice generation",
        "affectedFiles": [
          "src/billing/core.js",
          "src/billing/calculator.js",
          "src/billing/invoice.js"
        ],
        "dependencies": [
          "payment-processor",
          "invoice-generator",
          "customer-service"
        ],
        "metrics": {
          "linesChanged": 156,
          "functionsModified": 8,
          "testCoverageImpact": -12
        },
        "riskFactors": [
          "Critical business logic",
          "High coupling with payment systems",
          "Limited test coverage"
        ]
      },
      {
        "id": "payment-api",
        "name": "Payment API",
        "riskLevel": "high",
        "confidence": 0.88,
        "description": "API endpoint modifications may break existing integrations",
        "affectedFiles": [
          "src/api/payment.js",
          "src/api/middleware/validation.js"
        ],
        "dependencies": ["billing-core", "external-gateway"],
        "metrics": {
          "linesChanged": 89,
          "functionsModified": 4,
          "testCoverageImpact": -5
        },
        "riskFactors": [
          "Public API changes",
          "External integration dependencies",
          "Backward compatibility concerns"
        ]
      },
      {
        "id": "customer-service",
        "name": "Customer Service",
        "riskLevel": "medium",
        "confidence": 0.76,
        "description": "Customer billing history retrieval methods updated",
        "affectedFiles": ["src/services/customer.js"],
        "dependencies": ["billing-core", "user-management"],
        "metrics": {
          "linesChanged": 45,
          "functionsModified": 2,
          "testCoverageImpact": 3
        },
        "riskFactors": [
          "Customer data access patterns",
          "Performance implications"
        ]
      }
    ],
    "testRecommendations": [
      {
        "id": "test-rec-1",
        "title": "Billing Core Calculation Tests",
        "type": "unit",
        "priority": "high",
        "estimatedEffort": {
          "hours": 4,
          "complexity": "medium"
        },
        "confidence": 0.91,
        "description": "Test all billing calculation methods including edge cases like pro-rata billing, discounts, and tax calculations",
        "rationale": "Critical business logic changes require comprehensive unit test coverage to prevent billing errors",
        "coverage": {
          "currentCoverage": 67,
          "targetCoverage": 90,
          "gap": 23
        },
        "testCategories": [
          "calculation-accuracy",
          "edge-cases",
          "error-handling"
        ],
        "testCode": {
          "language": "javascript",
          "framework": "jest",
          "code": "describe('Billing Core Calculations', () => {\n  test('should calculate pro-rata billing correctly', () => {\n    const result = calculateProRataBilling(100, 15, 30);\n    expect(result).toBe(50);\n  });\n\n  test('should apply discounts correctly', () => {\n    const result = applyDiscount(100, 0.1);\n    expect(result).toBe(90);\n  });\n\n  test('should handle tax calculations', () => {\n    const result = calculateTax(100, 0.08);\n    expect(result).toBe(108);\n  });\n});"
        },
        "relatedFiles": ["src/billing/core.js", "src/billing/calculator.js"]
      },
      {
        "id": "test-rec-2",
        "title": "Payment Processor Edge Cases",
        "type": "unit",
        "priority": "high",
        "estimatedEffort": {
          "hours": 3,
          "complexity": "medium"
        },
        "confidence": 0.87,
        "description": "Test payment processing with various edge cases including failed payments, timeouts, and retries",
        "rationale": "Payment processing changes introduce risk of transaction failures and need robust error handling tests",
        "coverage": {
          "currentCoverage": 45,
          "targetCoverage": 85,
          "gap": 40
        },
        "testCategories": [
          "error-handling",
          "retry-logic",
          "timeout-scenarios"
        ],
        "testCode": {
          "language": "javascript",
          "framework": "jest",
          "code": "describe('Payment Processor', () => {\n  test('should handle failed payments gracefully', async () => {\n    const mockPayment = { amount: 100, method: 'card' };\n    const result = await processPayment(mockPayment);\n    expect(result.status).toBe('failed');\n  });\n\n  test('should retry on timeout', async () => {\n    jest.spyOn(paymentGateway, 'process').mockRejectedValueOnce(new TimeoutError());\n    const result = await processPayment({ amount: 100 });\n    expect(paymentGateway.process).toHaveBeenCalledTimes(2);\n  });\n});"
        },
        "relatedFiles": ["src/api/payment.js"]
      },
      {
        "id": "test-rec-3",
        "title": "End-to-End Payment Flow",
        "type": "integration",
        "priority": "high",
        "estimatedEffort": {
          "hours": 6,
          "complexity": "high"
        },
        "confidence": 0.83,
        "description": "Complete integration test covering customer creation, invoice generation, and payment processing",
        "rationale": "Multiple system integration points require comprehensive testing to ensure end-to-end functionality",
        "coverage": {
          "currentCoverage": 30,
          "targetCoverage": 75,
          "gap": 45
        },
        "testCategories": [
          "integration-flow",
          "data-consistency",
          "system-interaction"
        ],
        "testCode": {
          "language": "javascript",
          "framework": "jest",
          "code": "describe('E2E Payment Flow', () => {\n  test('complete customer payment journey', async () => {\n    // Create customer\n    const customer = await createCustomer({ name: 'Test User', email: 'test@example.com' });\n    \n    // Generate invoice\n    const invoice = await generateInvoice(customer.id, { amount: 100 });\n    \n    // Process payment\n    const payment = await processPayment(invoice.id, { method: 'card' });\n    \n    expect(payment.status).toBe('completed');\n    expect(invoice.status).toBe('paid');\n  });\n});"
        },
        "relatedFiles": [
          "src/billing/core.js",
          "src/api/payment.js",
          "src/services/customer.js"
        ]
      },
      {
        "id": "test-rec-4",
        "title": "Customer Portal Payment Journey",
        "type": "e2e",
        "priority": "medium",
        "estimatedEffort": {
          "hours": 8,
          "complexity": "high"
        },
        "confidence": 0.79,
        "description": "End-to-end test simulating complete customer payment journey through the web interface",
        "rationale": "UI changes affecting payment flow need validation through automated user journey testing",
        "coverage": {
          "currentCoverage": 0,
          "targetCoverage": 60,
          "gap": 60
        },
        "testCategories": [
          "user-journey",
          "ui-integration",
          "browser-compatibility"
        ],
        "testCode": {
          "language": "javascript",
          "framework": "playwright",
          "code": "describe('Customer Portal E2E', () => {\n  test('customer can complete payment flow', async () => {\n    await page.goto('/portal/login');\n    await page.fill('#email', 'customer@example.com');\n    await page.fill('#password', 'password123');\n    await page.click('#login-btn');\n    \n    await page.click('#invoices-tab');\n    await page.click('.invoice-row:first-child .pay-btn');\n    \n    await page.fill('#card-number', '4111111111111111');\n    await page.fill('#expiry', '12/25');\n    await page.fill('#cvv', '123');\n    await page.click('#pay-now-btn');\n    \n    await expect(page.locator('.success-message')).toBeVisible();\n  });\n});"
        },
        "relatedFiles": [
          "web/components/PaymentForm.jsx",
          "web/pages/portal.jsx"
        ]
      }
    ],
    "historicalAnalysis": [
      {
        "date": "2024-01-10T00:00:00Z",
        "riskScore": 7.2,
        "pullRequestCount": 3,
        "hotfixCount": 1,
        "deploymentSuccess": true,
        "description": "Recent push changes to affected files",
        "riskTrend": "increasing",
        "events": [
          {
            "type": "deployment",
            "status": "success",
            "timestamp": "2024-01-10T14:30:00Z"
          },
          {
            "type": "hotfix",
            "description": "Payment gateway timeout fix",
            "timestamp": "2024-01-10T16:45:00Z"
          }
        ]
      },
      {
        "date": "2024-01-05T00:00:00Z",
        "riskScore": 5.8,
        "pullRequestCount": 5,
        "hotfixCount": 0,
        "deploymentSuccess": true,
        "description": "Normal development activity",
        "riskTrend": "stable",
        "events": [
          {
            "type": "deployment",
            "status": "success",
            "timestamp": "2024-01-05T10:15:00Z"
          }
        ]
      },
      {
        "date": "2023-12-28T00:00:00Z",
        "riskScore": 9.1,
        "pullRequestCount": 2,
        "hotfixCount": 3,
        "deploymentSuccess": false,
        "description": "Critical payment gateway issues",
        "riskTrend": "critical",
        "events": [
          {
            "type": "deployment",
            "status": "failed",
            "timestamp": "2023-12-28T09:20:00Z",
            "error": "Payment gateway connection timeout"
          },
          {
            "type": "hotfix",
            "description": "Emergency payment system rollback",
            "timestamp": "2023-12-28T10:30:00Z"
          },
          {
            "type": "hotfix",
            "description": "Database connection pool fix",
            "timestamp": "2023-12-28T12:45:00Z"
          },
          {
            "type": "hotfix",
            "description": "Payment gateway retry logic",
            "timestamp": "2023-12-28T15:20:00Z"
          }
        ]
      }
    ],
    "analysisMetadata": {
      "analysisId": "analysis-uuid-123",
      "timestamp": "2024-01-15T15:30:00Z",
      "processingTime": 2847,
      "aiModel": {
        "name": "risk-analyzer-v2.1",
        "version": "2.1.0",
        "confidence": 0.89
      },
      "dataSource": {
        "codeRepository": "github",
        "commitSha": "abc123def456",
        "baseBranch": "main",
        "headBranch": "feature/billing-refactor"
      }
    }
  },
  "meta": {
    "requestId": "req-uuid-456",
    "timestamp": "2024-01-15T15:30:00Z",
    "processingTime": 2847,
    "version": "v1"
  }
}
```

---

## Error Response Specifications

### 400 Bad Request - Invalid PR URL

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PR_URL",
    "message": "The provided PR URL is not valid or supported",
    "details": {
      "providedUrl": "https://invalid-url.com",
      "supportedFormats": [
        "https://github.com/{owner}/{repo}/pull/{number}",
        "https://gitlab.com/{owner}/{repo}/-/merge_requests/{number}"
      ]
    }
  },
  "meta": {
    "requestId": "req-uuid-789",
    "timestamp": "2024-01-15T15:30:00Z"
  }
}
```

### 404 Not Found - PR Not Found

```json
{
  "status": "error",
  "error": {
    "code": "PR_NOT_FOUND",
    "message": "Pull request not found or not accessible",
    "details": {
      "url": "https://github.com/owner/repo/pull/999",
      "possibleReasons": [
        "PR does not exist",
        "Repository is private and not accessible",
        "Invalid repository or PR number"
      ]
    }
  }
}
```

### 401 Unauthorized - Authentication Required

```json
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Valid authentication token required",
    "details": {
      "requiredHeaders": ["Authorization: Bearer <token>"]
    }
  }
}
```

### 403 Forbidden - Access Denied

```json
{
  "status": "error",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Insufficient permissions to access this repository",
    "details": {
      "repository": "owner/repo",
      "requiredPermissions": ["read"]
    }
  }
}
```

### 429 Too Many Requests - Rate Limited

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetTime": "2024-01-15T16:00:00Z"
    }
  }
}
```

### 500 Internal Server Error - Analysis Failed

```json
{
  "status": "error",
  "error": {
    "code": "ANALYSIS_FAILED",
    "message": "Failed to analyze the pull request",
    "details": {
      "stage": "complexity_analysis",
      "reason": "Unable to parse code structure"
    }
  }
}
```

---

## Technical Requirements

### Performance Requirements

- **Response Time**: Maximum 5 seconds for complete analysis
- **Throughput**: Support 100 concurrent requests per server
- **Availability**: 99.9% uptime SLA
- **Data Freshness**: Analysis based on latest commit data

### Security Requirements

- **Authentication**: OAuth 2.0 / Bearer token authentication
- **Authorization**: Repository-level access control
- **Rate Limiting**: 100 requests per hour per user
- **Data Privacy**: No long-term storage of repository content

### Scalability Requirements

- **Horizontal Scaling**: Support for auto-scaling based on load
- **Caching**: Cache analysis results for 1 hour
- **Queue Management**: Background processing for heavy analysis tasks

---

## Integration Requirements

### Repository Platform Support

- **GitHub**: Public and private repositories (with permissions)
- **GitLab**: GitLab.com repositories (with API access)
- **Future**: Bitbucket, Azure DevOps support planned

### Required Permissions

- **GitHub**: `repo` scope for private repositories, `public_repo` for public
- **GitLab**: `read_api` and `read_repository` scopes

### Webhook Integration (Future)

- Real-time analysis triggers on PR creation/updates
- Configurable analysis depth based on repository settings
- Integration with CI/CD pipelines

---

## Data Models

### Risk Score Calculation

Risk scores are calculated using a weighted algorithm considering:

- **Code Complexity** (30%): Cyclomatic and cognitive complexity
- **Critical Path Impact** (25%): Changes to critical business logic
- **Test Coverage** (20%): Current and projected test coverage
- **Historical Patterns** (15%): Past issues in similar changes
- **Dependencies** (10%): Impact on dependent systems

### Confidence Scores

All AI-generated recommendations include confidence scores (0.0-1.0):

- **>0.9**: High confidence, actionable recommendations
- **0.7-0.9**: Medium confidence, review recommended
- **<0.7**: Low confidence, human validation required

---

## Frontend Integration

### React Component Updates Required

Update the `handlePRAnalysis` function in `PRAnalysis.tsx`:

```typescript
const handlePRAnalysis = async (url: string) => {
  if (!isValidUrl) {
    message.error("Please enter a valid PR URL");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/analyze-pr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        prUrl: url,
        options: {
          includeHistoricalData: true,
          includeTestRecommendations: true,
          complexityAnalysis: true,
          impactAnalysis: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      setAnalyzedPR(transformApiResponse(data.data));
      message.success("PR analysis completed successfully!");
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    message.error("Failed to analyze PR. Please try again.");
    console.error("PR Analysis Error:", error);
  } finally {
    setLoading(false);
  }
};
```

### Data Transformation

Create transformation functions to map API response to UI state:

```typescript
const transformApiResponse = (apiData: ApiResponse): PullRequest => {
  return {
    id: apiData.pullRequest.id,
    title: apiData.pullRequest.title,
    number: apiData.pullRequest.number,
    author: apiData.pullRequest.author.username,
    status: apiData.pullRequest.status,
    riskScore: apiData.riskAssessment.overallScore,
    description: apiData.riskAssessment.reasoning,
  };
};
```

---

## Testing Strategy

### API Testing

- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end API workflow testing
- **Load Testing**: Performance under high concurrent load
- **Security Testing**: Authentication and authorization validation

### Test Data

- Sample PRs across different risk levels (low, medium, high)
- Edge cases: empty PRs, large PRs, merge conflicts
- Different repository types and sizes
- Various programming languages and frameworks

---

## Monitoring and Analytics

### Key Metrics

- **Analysis Success Rate**: % of successful analyses
- **Response Time Distribution**: P50, P95, P99 latencies
- **Error Rate by Type**: Classification of failure modes
- **User Adoption**: Active users and analysis frequency

### Alerting

- **High Error Rate**: >5% error rate in 5-minute window
- **Slow Response**: >10 second response time
- **Rate Limit Breaches**: Unusual traffic patterns
- **AI Model Performance**: Confidence score degradation

---

## Deployment and Infrastructure

### Environment Requirements

- **Production**: Kubernetes cluster with auto-scaling
- **Staging**: Mirrored production environment for testing
- **Development**: Local development with Docker compose

### Dependencies

- **Code Analysis Service**: Static code analysis engine
- **AI/ML Pipeline**: Test recommendation generation
- **GitHub/GitLab APIs**: Repository data access
- **Database**: Analysis caching and historical data
- **Queue Service**: Background processing management

---

## Future Enhancements

### Planned Features (Q2 2024)

- **Custom Risk Thresholds**: Organization-specific risk criteria
- **Webhook Integration**: Real-time PR analysis triggers
- **Team Analytics**: Team-level risk and quality metrics
- **Integration Plugins**: IDE and CI/CD pipeline integrations

### Advanced Features (Q3-Q4 2024)

- **ML Model Training**: Custom models based on organization data
- **Predictive Analytics**: Deployment risk prediction
- **Advanced Visualizations**: Risk trend analysis and forecasting
- **Multi-Repository Analysis**: Cross-repository impact analysis

---

## Conclusion

This API specification provides a comprehensive foundation for the PR Risk Analysis service, supporting all current UI requirements while maintaining flexibility for future enhancements. The response structure is designed to be performant, scalable, and extensible.

For implementation questions or clarifications, please refer to the technical team or create an issue in the project repository.
