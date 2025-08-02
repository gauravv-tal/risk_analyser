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
    id: "3",
    url: "https://github.com/SayaliTal/calorie-tracker/pull/3",
    number: 3,
    title:
      "Add Quantum module with service and controller for quantum calorie processing, including AI vision analysis and neural network integration. Update app module to include QuantumModule.",
    description:
      "This PR introduces a complex quantum processing module with AI vision analysis and neural network integration for advanced calorie processing capabilities",
    author: {
      username: "yasinbhimani",
      displayName: "Yasin Bhimani",
      avatarUrl: "https://github.com/yasinbhimani.png",
    },
    status: "open",
    createdAt: "2025-08-02T10:00:00Z",
    updatedAt: "2025-08-02T10:00:00Z",
    branch: {
      source: "feature/quantum-module",
      target: "main",
    },
    repository: {
      name: "calorie-tracker",
      owner: "SayaliTal",
      fullName: "SayaliTal/calorie-tracker",
      platform: "github",
    },
    riskScore: 9.2, // High risk due to complex AI/ML integration
  },
  {
    id: "2",
    url: "https://github.com/SayaliTal/calorie-tracker/pull/2",
    number: 2,
    title:
      "[WIP] Merge activity log capability and track calories burn by day & week",
    description:
      "Work in progress PR to add activity logging and calorie burn tracking with daily and weekly analytics",
    author: {
      username: "gauravv-tal",
      displayName: "Gaurav Tal",
      avatarUrl: "https://github.com/gauravv-tal.png",
    },
    status: "open",
    createdAt: "2025-08-02T09:30:00Z",
    updatedAt: "2025-08-02T09:30:00Z",
    branch: {
      source: "feature/activity-logging",
      target: "main",
    },
    repository: {
      name: "calorie-tracker",
      owner: "SayaliTal",
      fullName: "SayaliTal/calorie-tracker",
      platform: "github",
    },
    riskScore: 6.7, // Medium risk due to WIP status and data tracking features
  },
  {
    id: "1",
    url: "https://github.com/SayaliTal/calorie-tracker/pull/1",
    number: 1,
    title: "[WIP][DO NOT MERGE] Update calorie.service.ts",
    description:
      "Work in progress changes to calorie service - marked as DO NOT MERGE for review purposes only",
    author: {
      username: "gauravv-tal",
      displayName: "Gaurav Tal",
      avatarUrl: "https://github.com/gauravv-tal.png",
    },
    status: "open",
    createdAt: "2025-08-01T14:22:00Z",
    updatedAt: "2025-08-01T14:22:00Z",
    branch: {
      source: "feature/calorie-service-updates",
      target: "main",
    },
    repository: {
      name: "calorie-tracker",
      owner: "SayaliTal",
      fullName: "SayaliTal/calorie-tracker",
      platform: "github",
    },
    riskScore: 4.1, // Lower risk due to DO NOT MERGE status and service-only changes
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
    id: "quantum-module",
    name: "Quantum Processing Module",
    riskLevel: "high",
    confidence: 0.95,
    description:
      "Complex quantum processing module with AI vision analysis and neural network integration for calorie processing",
    affectedFiles: [
      "src/quantum/quantum.module.ts",
      "src/quantum/quantum.service.ts",
      "src/quantum/quantum.controller.ts",
    ],
    dependencies: [
      "ai-vision-service",
      "neural-network-processor",
      "calorie-service",
    ],
    metrics: {
      linesChanged: 287,
      functionsModified: 12,
      testCoverageImpact: -18,
    },
    riskFactors: [
      "Complex AI/ML integration",
      "High computational complexity",
      "Limited test coverage for ML components",
    ],
  },
  {
    id: "calorie-service",
    name: "Calorie Service",
    riskLevel: "high",
    confidence: 0.88,
    description: "Core calorie calculation and tracking service modifications",
    affectedFiles: [
      "src/services/calorie.service.ts",
      "src/interfaces/calorie.interface.ts",
    ],
    dependencies: ["activity-tracker", "nutrition-database"],
    metrics: {
      linesChanged: 134,
      functionsModified: 6,
      testCoverageImpact: -8,
    },
    riskFactors: [
      "Core business logic changes",
      "Data accuracy implications",
      "Algorithm modifications",
    ],
  },
  {
    id: "activity-tracker",
    name: "Activity Tracking Module",
    riskLevel: "medium",
    confidence: 0.82,
    description:
      "Activity logging and calorie burn tracking with daily/weekly analytics",
    affectedFiles: [
      "src/modules/activity/activity.service.ts",
      "src/modules/activity/activity.controller.ts",
    ],
    dependencies: ["calorie-service", "user-profile"],
    metrics: {
      linesChanged: 156,
      functionsModified: 8,
      testCoverageImpact: 5,
    },
    riskFactors: ["Data persistence changes", "Analytics accuracy"],
  },
  {
    id: "ai-vision-service",
    name: "AI Vision Analysis",
    riskLevel: "high",
    confidence: 0.76,
    description:
      "AI-powered food recognition and calorie estimation from images",
    affectedFiles: ["src/ai/vision.service.ts", "src/ai/image-processor.ts"],
    dependencies: ["quantum-module", "ml-models"],
    metrics: {
      linesChanged: 98,
      functionsModified: 4,
      testCoverageImpact: -12,
    },
    riskFactors: [
      "Machine learning model dependencies",
      "Image processing complexity",
    ],
  },
  {
    id: "user-profile",
    name: "User Profile Service",
    riskLevel: "medium",
    confidence: 0.79,
    description:
      "User profile management and personalized calorie goal calculations",
    affectedFiles: [
      "src/user/profile.service.ts",
      "src/user/profile.controller.ts",
      "src/user/goal-calculator.ts",
    ],
    dependencies: ["calorie-service", "activity-tracker"],
    metrics: {
      linesChanged: 67,
      functionsModified: 5,
      testCoverageImpact: 3,
    },
    riskFactors: [
      "User data handling",
      "Personalization logic changes",
      "Goal calculation accuracy",
    ],
  },
  {
    id: "nutrition-database",
    name: "Nutrition Database",
    riskLevel: "low",
    confidence: 0.88,
    description: "Food nutrition data management and lookup services",
    affectedFiles: [
      "src/database/nutrition.service.ts",
      "src/database/food-items.ts",
    ],
    dependencies: ["calorie-service"],
    metrics: {
      linesChanged: 31,
      functionsModified: 3,
      testCoverageImpact: 8,
    },
    riskFactors: ["Read-only operations", "Data integrity maintenance"],
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
        description: "AI model inference timeout fix",
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
    description: "Critical calorie calculation accuracy issues",
    riskTrend: "critical",
    events: [
      {
        type: "deployment",
        status: "failed",
        timestamp: "2023-12-28T09:20:00Z",
        error: "AI model service connection timeout",
      },
      {
        type: "hotfix",
        description: "Emergency calorie algorithm rollback",
        timestamp: "2023-12-28T10:30:00Z",
      },
      {
        type: "hotfix",
        description: "Database connection pool fix",
        timestamp: "2023-12-28T12:45:00Z",
      },
      {
        type: "hotfix",
        description: "AI model inference retry logic",
        timestamp: "2023-12-28T15:20:00Z",
      },
    ],
  },
];

export const mockDashboardStats: DashboardStats = {
  totalPRs: 3,
  highRiskPRs: 1, // The quantum module PR
  averageRiskScore: 6.7, // Average of 9.2, 6.7, 4.1
  testCoverage: 65, // Lower coverage for a developing project
};
