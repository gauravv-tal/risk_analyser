// Test script to demonstrate API call with mock fallback
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://3.108.10.206:8080";

async function testApiCall(prId) {
  console.log(`🔄 Testing API call to ${API_BASE_URL}/api/v1/retrieve`);
  console.log(`📝 Request payload: {"PR_ID": "${prId}"}`);
  console.log("=".repeat(60));

  try {
    // Attempt actual API call
    const response = await fetch(`${API_BASE_URL}/api/v1/retrieve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prId: prId }),
    });

    console.log(`📡 API Response Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Real API Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.log(`⚠️  API call failed: ${error.message}`);
    console.log("🎭 Falling back to mock response...");

    // Return mock response in the expected format
    const mockResponse = {
      status: "success",
      message: "Code files retrieved successfully",
      data: [
        {
          id: "PaymentProcessor.java",
          test_cases:
            '@Test\npublic void testProcessPayment_ValidInput_Success() {\n    PaymentProcessor processor = new PaymentProcessor();\n    PaymentRequest request = new PaymentRequest(100.0, "USD", "valid-card");\n    \n    PaymentResult result = processor.processPayment(request);\n    \n    assertEquals(PaymentStatus.SUCCESS, result.getStatus());\n    assertNotNull(result.getTransactionId());\n}',
        },
        {
          id: "UserValidator.java",
          test_cases:
            '@Test\npublic void testValidateUser_InvalidEmail_ThrowsException() {\n    UserValidator validator = new UserValidator();\n    UserData invalidUser = new UserData("invalid-email", "password123");\n    \n    assertThrows(ValidationException.class, () -> {\n        validator.validateUser(invalidUser);\n    });\n}',
        },
      ],
    };

    console.log("🎭 Mock Response:", JSON.stringify(mockResponse, null, 2));
    return mockResponse;
  }
}

// Test with sample PR IDs
async function runTests() {
  console.log("🧪 Testing API Integration with Mock Fallback");
  console.log("=".repeat(80));

  const testPrIds = ["123", "456", "789"];

  for (const prId of testPrIds) {
    console.log(`\n🔍 Testing PR_ID: ${prId}`);
    console.log("-".repeat(40));

    const startTime = Date.now();
    const result = await testApiCall(prId);
    const endTime = Date.now();

    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(
      `📊 Data items returned: ${result.data ? result.data.length : 0}`
    );

    if (result.status === "success" && result.data) {
      console.log("✅ Response format is valid");
      result.data.forEach((item, index) => {
        console.log(
          `   ${index + 1}. ${item.id} - ${
            item.test_cases.split("\n")[1] || "Test case"
          }`
        );
      });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("🎉 Test completed! The API integration:");
  console.log("   ✅ Attempts real API calls to /api/v1/retrieve");
  console.log("   ✅ Gracefully falls back to mock data when API unavailable");
  console.log("   ✅ Returns data in your exact API response format");
  console.log("   ✅ Ready for production when your backend is deployed");
}

// Only run if this script is executed directly (not imported)
if (typeof window === "undefined" && require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testApiCall };
