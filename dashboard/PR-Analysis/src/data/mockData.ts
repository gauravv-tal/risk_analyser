import {
  PullRequest,
  ComplexityMetrics,
  ImpactedModule,
  TestRecommendation,
  HistoricalRiskData,
  DashboardStats,
} from "../types";

export const mockPullRequests: PullRequest[] = [
  {
    id: "123",
    url: "https://github.com/company/billing-service/pull/123",
    number: 123,
    title: "Refactor billing service architecture",
    description:
      "This PR affects core billing logic and may impact payment processing",
    author: {
      username: "john.doe",
      displayName: "John Doe",
      avatarUrl: "https://github.com/john.doe.png",
    },
    status: "open",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
    branch: {
      source: "feature/billing-refactor",
      target: "main",
    },
    repository: {
      name: "billing-service",
      owner: "company",
      fullName: "company/billing-service",
      platform: "github",
    },
    riskScore: 8.5,
  },
  {
    id: "124",
    url: "https://github.com/company/billing-service/pull/124",
    number: 124,
    title: "Add customer payment validation",
    description: "Enhanced validation for customer payment methods",
    author: {
      username: "jane.smith",
      displayName: "Jane Smith",
      avatarUrl: "https://github.com/jane.smith.png",
    },
    status: "open",
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    branch: {
      source: "feature/payment-validation",
      target: "main",
    },
    repository: {
      name: "billing-service",
      owner: "company",
      fullName: "company/billing-service",
      platform: "github",
    },
    riskScore: 6.2,
  },
  {
    id: "125",
    url: "https://github.com/company/billing-service/pull/125",
    number: 125,
    title: "Update user interface components",
    description: "Minor UI improvements and accessibility updates",
    author: {
      username: "alex.johnson",
      displayName: "Alex Johnson",
      avatarUrl: "https://github.com/alex.johnson.png",
    },
    status: "merged",
    createdAt: "2024-01-12T14:22:00Z",
    updatedAt: "2024-01-13T11:30:00Z",
    branch: {
      source: "feature/ui-updates",
      target: "main",
    },
    repository: {
      name: "billing-service",
      owner: "company",
      fullName: "company/billing-service",
      platform: "github",
    },
    riskScore: 3.1,
  },
];

export const mockComplexityMetrics: ComplexityMetrics = {
  cyclomatic: {
    current: 15,
    baseline: 8,
    change: 7,
    threshold: 10,
    status: "exceeded",
  },
  cognitive: {
    current: 8,
    baseline: 5,
    change: 3,
    threshold: 7,
    status: "exceeded",
  },
  maintainability: {
    current: 65,
    baseline: 78,
    change: -13,
    threshold: 70,
    status: "below_threshold",
  },
  linesOfCode: {
    added: 247,
    deleted: 156,
    modified: 89,
    total: 492,
  },
  // Backward compatibility
  cyclomaticComplexity: 15,
  cognitiveComplexity: 8,
  maintainabilityIndex: 65,
};

export const mockImpactedModules: ImpactedModule[] = [
  {
    id: "billing-core",
    name: "Billing Core",
    riskLevel: "high",
    confidence: 0.95,
    description:
      "Core billing logic changes affect payment flow and invoice generation",
    affectedFiles: [
      "src/billing/core.js",
      "src/billing/calculator.js",
      "src/billing/invoice.js",
    ],
    dependencies: [
      "payment-processor",
      "invoice-generator",
      "customer-service",
    ],
    metrics: {
      linesChanged: 156,
      functionsModified: 8,
      testCoverageImpact: -12,
    },
    riskFactors: [
      "Critical business logic",
      "High coupling with payment systems",
      "Limited test coverage",
    ],
  },
  {
    id: "payment-api",
    name: "Payment API",
    riskLevel: "high",
    confidence: 0.88,
    description: "API endpoint modifications may break existing integrations",
    affectedFiles: ["src/api/payment.js", "src/api/middleware/validation.js"],
    dependencies: ["billing-core", "external-gateway"],
    metrics: {
      linesChanged: 89,
      functionsModified: 4,
      testCoverageImpact: -5,
    },
    riskFactors: [
      "Public API changes",
      "External integration dependencies",
      "Backward compatibility concerns",
    ],
  },
  {
    id: "customer-service",
    name: "Customer Service",
    riskLevel: "medium",
    confidence: 0.76,
    description: "Customer billing history retrieval methods updated",
    affectedFiles: ["src/services/customer.js"],
    dependencies: ["billing-core", "user-management"],
    metrics: {
      linesChanged: 45,
      functionsModified: 2,
      testCoverageImpact: 3,
    },
    riskFactors: ["Customer data access patterns", "Performance implications"],
  },
  {
    id: "audit-service",
    name: "Audit Service",
    riskLevel: "low",
    confidence: 0.82,
    description:
      "Audit logging service for tracking billing operations and changes",
    affectedFiles: ["src/services/audit.js", "src/middleware/audit.js"],
    dependencies: ["billing-core", "logging-service"],
    metrics: {
      linesChanged: 23,
      functionsModified: 1,
      testCoverageImpact: 8,
    },
    riskFactors: ["Low business impact", "Good test coverage"],
  },
  {
    id: "notification-system",
    name: "Notification System",
    riskLevel: "medium",
    confidence: 0.74,
    description:
      "Email and SMS notification system for billing events and alerts",
    affectedFiles: [
      "src/notifications/email.js",
      "src/notifications/sms.js",
      "src/templates/billing.html",
    ],
    dependencies: ["customer-service", "email-service", "sms-service"],
    metrics: {
      linesChanged: 67,
      functionsModified: 5,
      testCoverageImpact: -8,
    },
    riskFactors: [
      "External service dependencies",
      "Template changes",
      "Customer communication impact",
    ],
  },
  {
    id: "reporting-module",
    name: "Reporting Module",
    riskLevel: "low",
    confidence: 0.88,
    description: "Financial reporting and analytics module for billing data",
    affectedFiles: ["src/reports/financial.js", "src/reports/analytics.js"],
    dependencies: ["billing-core", "analytics-service"],
    metrics: {
      linesChanged: 31,
      functionsModified: 3,
      testCoverageImpact: 5,
    },
    riskFactors: ["Read-only operations", "Non-critical business function"],
  },
];

export const mockTestRecommendations: TestRecommendation[] = [
  {
    id: "1",
    title: "Billing Core Calculation Tests",
    type: "unit",
    priority: "high",
    estimatedEffort: {
      hours: 4,
      complexity: "medium",
    },
    confidence: 0.91,
    description:
      "Test all billing calculation methods including edge cases like pro-rata billing, discounts, and tax calculations",
    rationale:
      "Critical business logic changes require comprehensive unit test coverage to prevent billing errors",
    coverage: {
      currentCoverage: 67,
      targetCoverage: 90,
      gap: 23,
    },
    testCategories: ["calculation-accuracy", "edge-cases", "error-handling"],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('Billing Core Calculations', () => {
  test('should calculate pro-rata billing correctly', () => {
    const result = calculateProRataBilling(100, 15, 30);
    expect(result).toBe(50);
  });

  test('should apply discounts correctly', () => {
    const result = applyDiscount(100, 0.1);
    expect(result).toBe(90);
  });

  test('should handle tax calculations', () => {
    const result = calculateTax(100, 0.08);
    expect(result).toBe(108);
  });
});`,
    },
    relatedFiles: ["src/billing/core.js", "src/billing/calculator.js"],
    // Backward compatibility
    estimatedTime: "4 hours",
  },
  {
    id: "2",
    title: "Payment Processor Edge Cases",
    type: "unit",
    priority: "high",
    estimatedEffort: {
      hours: 3,
      complexity: "medium",
    },
    confidence: 0.87,
    description:
      "Test payment processing with various edge cases including failed payments, timeouts, and retries",
    rationale:
      "Payment processing changes introduce risk of transaction failures and need robust error handling tests",
    coverage: {
      currentCoverage: 45,
      targetCoverage: 85,
      gap: 40,
    },
    testCategories: ["error-handling", "retry-logic", "timeout-scenarios"],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('Payment Processor', () => {
  test('should handle failed payments gracefully', async () => {
    const mockPayment = { amount: 100, method: 'card' };
    const result = await processPayment(mockPayment);
    expect(result.status).toBe('failed');
  });

  test('should retry on timeout', async () => {
    jest.spyOn(paymentGateway, 'process').mockRejectedValueOnce(new TimeoutError());
    const result = await processPayment({ amount: 100 });
    expect(paymentGateway.process).toHaveBeenCalledTimes(2);
  });
});`,
    },
    relatedFiles: ["src/api/payment.js"],
    // Backward compatibility
    estimatedTime: "3 hours",
  },
  {
    id: "3",
    title: "End-to-End Payment Flow",
    type: "integration",
    priority: "high",
    estimatedEffort: {
      hours: 6,
      complexity: "high",
    },
    confidence: 0.83,
    description:
      "Complete integration test covering customer creation, invoice generation, and payment processing",
    rationale:
      "Multiple system integration points require comprehensive testing to ensure end-to-end functionality",
    coverage: {
      currentCoverage: 30,
      targetCoverage: 75,
      gap: 45,
    },
    testCategories: [
      "integration-flow",
      "data-consistency",
      "system-interaction",
    ],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('E2E Payment Flow', () => {
  test('complete customer payment journey', async () => {
    // Create customer
    const customer = await createCustomer({ name: 'Test User', email: 'test@example.com' });
    
    // Generate invoice
    const invoice = await generateInvoice(customer.id, { amount: 100 });
    
    // Process payment
    const payment = await processPayment(invoice.id, { method: 'card' });
    
    expect(payment.status).toBe('completed');
    expect(invoice.status).toBe('paid');
  });
});`,
    },
    relatedFiles: [
      "src/billing/core.js",
      "src/api/payment.js",
      "src/services/customer.js",
    ],
    // Backward compatibility
    estimatedTime: "6 hours",
  },
  {
    id: "4",
    title: "Customer Portal Payment Journey",
    type: "e2e",
    priority: "medium",
    estimatedEffort: {
      hours: 8,
      complexity: "high",
    },
    confidence: 0.79,
    description:
      "End-to-end test simulating complete customer payment journey through the web interface",
    rationale:
      "UI changes affecting payment flow need validation through automated user journey testing",
    coverage: {
      currentCoverage: 0,
      targetCoverage: 60,
      gap: 60,
    },
    testCategories: ["user-journey", "ui-integration", "browser-compatibility"],
    testCode: {
      language: "javascript",
      framework: "playwright",
      code: `describe('Customer Portal E2E', () => {
  test('customer can complete payment flow', async () => {
    await page.goto('/portal/login');
    await page.fill('#email', 'customer@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-btn');
    
    await page.click('#invoices-tab');
    await page.click('.invoice-row:first-child .pay-btn');
    
    await page.fill('#card-number', '4111111111111111');
    await page.fill('#expiry', '12/25');
    await page.fill('#cvv', '123');
    await page.click('#pay-now-btn');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });
});`,
    },
    relatedFiles: ["web/components/PaymentForm.jsx", "web/pages/portal.jsx"],
    // Backward compatibility
    estimatedTime: "8 hours",
  },
  {
    id: "5",
    title: "Database Transaction Tests",
    type: "unit",
    priority: "high",
    estimatedEffort: {
      hours: 5,
      complexity: "high",
    },
    confidence: 0.94,
    description:
      "Test database transaction handling, rollbacks, and concurrent access patterns for billing operations",
    rationale:
      "Database changes in billing core require thorough transaction testing to prevent data corruption",
    coverage: {
      currentCoverage: 45,
      targetCoverage: 85,
      gap: 40,
    },
    testCategories: ["database-transactions", "concurrency", "data-integrity"],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('Database Transactions', () => {
  test('should rollback on billing calculation failure', async () => {
    await expect(async () => {
      await db.transaction(async (trx) => {
        await createInvoice(trx, invalidData);
      });
    }).rejects.toThrow();
    
    const invoiceCount = await db('invoices').count();
    expect(invoiceCount[0].count).toBe('0');
  });

  test('should handle concurrent billing operations', async () => {
    const promises = Array(10).fill().map(() => 
      processPayment({ customerId: 'test', amount: 100 })
    );
    
    const results = await Promise.all(promises);
    expect(results.every(r => r.status === 'success')).toBe(true);
  });
});`,
    },
    relatedFiles: ["src/billing/core.js", "src/database/transactions.js"],
    estimatedTime: "5 hours",
  },
  {
    id: "6",
    title: "API Input Validation Tests",
    type: "unit",
    priority: "medium",
    estimatedEffort: {
      hours: 3,
      complexity: "low",
    },
    confidence: 0.89,
    description:
      "Comprehensive input validation tests for payment API endpoints",
    rationale:
      "API changes require validation testing to prevent malformed requests from causing system issues",
    coverage: {
      currentCoverage: 72,
      targetCoverage: 90,
      gap: 18,
    },
    testCategories: ["input-validation", "api-security", "error-handling"],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('API Input Validation', () => {
  test('should reject invalid payment amounts', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({ amount: -100, currency: 'USD' });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/invalid amount/i);
  });

  test('should sanitize customer data', async () => {
    const maliciousData = {
      name: '<script>alert("xss")</script>',
      email: 'test@example.com'
    };
    
    const response = await request(app)
      .post('/api/customers')
      .send(maliciousData);
    
    expect(response.body.name).not.toContain('<script>');
  });
});`,
    },
    relatedFiles: ["src/api/payment.js", "src/middleware/validation.js"],
    estimatedTime: "3 hours",
  },
  {
    id: "7",
    title: "Error Handling & Recovery Tests",
    type: "unit",
    priority: "high",
    estimatedEffort: {
      hours: 4,
      complexity: "medium",
    },
    confidence: 0.92,
    description:
      "Test error handling, graceful degradation, and recovery mechanisms",
    rationale:
      "Robust error handling is critical for billing systems to prevent financial discrepancies",
    coverage: {
      currentCoverage: 38,
      targetCoverage: 80,
      gap: 42,
    },
    testCategories: [
      "error-handling",
      "recovery-mechanisms",
      "graceful-degradation",
    ],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('Error Handling', () => {
  test('should handle payment gateway timeouts', async () => {
    mockGateway.mockRejectedValue(new TimeoutError());
    
    const result = await processPayment({ amount: 100 });
    
    expect(result.status).toBe('pending');
    expect(result.retryCount).toBe(1);
  });

  test('should gracefully degrade when audit service fails', async () => {
    mockAuditService.mockRejectedValue(new Error('Service unavailable'));
    
    const result = await createInvoice(validData);
    
    expect(result.status).toBe('created');
    expect(logger.warn).toHaveBeenCalledWith('Audit logging failed');
  });
});`,
    },
    relatedFiles: ["src/billing/core.js", "src/services/error-handler.js"],
    estimatedTime: "4 hours",
  },
  {
    id: "8",
    title: "Performance & Load Tests",
    type: "unit",
    priority: "medium",
    estimatedEffort: {
      hours: 6,
      complexity: "high",
    },
    confidence: 0.85,
    description:
      "Performance benchmarks and load testing for billing calculations",
    rationale:
      "Billing system changes could impact performance during high-load periods",
    coverage: {
      currentCoverage: 25,
      targetCoverage: 70,
      gap: 45,
    },
    testCategories: ["performance", "load-testing", "benchmarks"],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('Performance Tests', () => {
  test('should calculate billing within acceptable time', async () => {
    const startTime = Date.now();
    
    await calculateMonthlyBilling(largeCustomerSet);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds max
  });

  test('should handle batch processing efficiently', async () => {
    const batchSize = 1000;
    const invoices = generateTestInvoices(batchSize);
    
    const startTime = Date.now();
    await processBatchInvoices(invoices);
    const duration = Date.now() - startTime;
    
    expect(duration / batchSize).toBeLessThan(10); // <10ms per invoice
  });
});`,
    },
    relatedFiles: [
      "src/billing/calculator.js",
      "src/services/batch-processor.js",
    ],
    estimatedTime: "6 hours",
  },
  {
    id: "9",
    title: "Configuration & Environment Tests",
    type: "unit",
    priority: "low",
    estimatedEffort: {
      hours: 2,
      complexity: "low",
    },
    confidence: 0.78,
    description: "Test configuration loading and environment-specific behavior",
    rationale:
      "Configuration changes need testing to ensure proper behavior across environments",
    coverage: {
      currentCoverage: 60,
      targetCoverage: 80,
      gap: 20,
    },
    testCategories: [
      "configuration",
      "environment-specific",
      "settings-validation",
    ],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('Configuration Tests', () => {
  test('should load correct tax rates by region', () => {
    process.env.REGION = 'US';
    const config = loadBillingConfig();
    
    expect(config.taxRates.default).toBe(0.08);
    expect(config.currency).toBe('USD');
  });

  test('should validate required configuration', () => {
    delete process.env.PAYMENT_GATEWAY_URL;
    
    expect(() => {
      initializePaymentService();
    }).toThrow('Payment gateway URL not configured');
  });
});`,
    },
    relatedFiles: ["src/config/billing.js", "src/config/environment.js"],
    estimatedTime: "2 hours",
  },
  {
    id: "10",
    title: "Security & Authorization Tests",
    type: "unit",
    priority: "high",
    estimatedEffort: {
      hours: 4,
      complexity: "medium",
    },
    confidence: 0.91,
    description:
      "Test security controls, authorization, and data protection mechanisms",
    rationale:
      "Security is critical for billing systems handling sensitive financial data",
    coverage: {
      currentCoverage: 55,
      targetCoverage: 95,
      gap: 40,
    },
    testCategories: ["security", "authorization", "data-protection"],
    testCode: {
      language: "javascript",
      framework: "jest",
      code: `describe('Security Tests', () => {
  test('should prevent unauthorized access to billing data', async () => {
    const unauthorizedToken = 'invalid-token';
    
    const response = await request(app)
      .get('/api/billing/customer/123')
      .set('Authorization', \`Bearer \${unauthorizedToken}\`);
    
    expect(response.status).toBe(401);
  });

  test('should encrypt sensitive payment data', () => {
    const paymentData = { cardNumber: '4111111111111111' };
    const encrypted = encryptPaymentData(paymentData);
    
    expect(encrypted.cardNumber).not.toBe(paymentData.cardNumber);
    expect(encrypted.cardNumber).toMatch(/^encrypted:/);
  });
});`,
    },
    relatedFiles: [
      "src/security/authorization.js",
      "src/security/encryption.js",
    ],
    estimatedTime: "4 hours",
  },
];

export const mockHistoricalData: HistoricalRiskData[] = [
  {
    date: "2024-01-10T00:00:00Z",
    riskScore: 7.2,
    pullRequestCount: 3,
    hotfixCount: 1,
    deploymentSuccess: true,
    description: "Recent push changes to affected files",
    riskTrend: "increasing",
    events: [
      {
        type: "deployment",
        status: "success",
        timestamp: "2024-01-10T14:30:00Z",
      },
      {
        type: "hotfix",
        description: "Payment gateway timeout fix",
        timestamp: "2024-01-10T16:45:00Z",
      },
    ],
  },
  {
    date: "2024-01-05T00:00:00Z",
    riskScore: 5.8,
    pullRequestCount: 5,
    hotfixCount: 0,
    deploymentSuccess: true,
    description: "Normal development activity",
    riskTrend: "stable",
    events: [
      {
        type: "deployment",
        status: "success",
        timestamp: "2024-01-05T10:15:00Z",
      },
    ],
  },
  {
    date: "2023-12-28T00:00:00Z",
    riskScore: 9.1,
    pullRequestCount: 2,
    hotfixCount: 3,
    deploymentSuccess: false,
    description: "Critical payment gateway issues",
    riskTrend: "critical",
    events: [
      {
        type: "deployment",
        status: "failed",
        timestamp: "2023-12-28T09:20:00Z",
        error: "Payment gateway connection timeout",
      },
      {
        type: "hotfix",
        description: "Emergency payment system rollback",
        timestamp: "2023-12-28T10:30:00Z",
      },
      {
        type: "hotfix",
        description: "Database connection pool fix",
        timestamp: "2023-12-28T12:45:00Z",
      },
      {
        type: "hotfix",
        description: "Payment gateway retry logic",
        timestamp: "2023-12-28T15:20:00Z",
      },
    ],
  },
];

export const mockDashboardStats: DashboardStats = {
  totalPRs: 156,
  highRiskPRs: 23,
  averageRiskScore: 6.4,
  testCoverage: 78,
};
