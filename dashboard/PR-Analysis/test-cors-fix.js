// Test script to verify CORS fix with proxy configuration
// Run this in browser console after starting the React app with proxy

console.log("🧪 Testing CORS Fix with Proxy Configuration");
console.log("=".repeat(60));

// Test relative URL (should work with proxy)
const testRelativeAPI = async () => {
  try {
    console.log("🔄 Testing relative API call (via proxy)...");

    const response = await fetch("/api/v1/summary/retrieve/calorie-tracker_3", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Relative API call successful!");
    console.log("📊 Response status:", response.status);

    const data = await response.json();
    console.log("📦 Response data:", data);
  } catch (error) {
    console.log("❌ Relative API call failed:", error.message);
  }
};

// Test direct URL (should fail with CORS)
const testDirectAPI = async () => {
  try {
    console.log("🔄 Testing direct API call (should fail with CORS)...");

    const response = await fetch(
      "http://3.108.10.206:8080/api/v1/summary/retrieve/calorie-tracker_3",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Direct API call successful! (CORS must be configured)");
    console.log("📊 Response status:", response.status);
  } catch (error) {
    console.log(
      "❌ Direct API call failed (expected with CORS):",
      error.message
    );
  }
};

// Test POST API as well
const testPostAPI = async () => {
  try {
    console.log("🔄 Testing POST API call (via proxy)...");

    const response = await fetch("/api/v1/retrieve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prId: "calorie-tracker_3" }),
    });

    console.log("✅ POST API call successful!");
    console.log("📊 Response status:", response.status);

    const data = await response.json();
    console.log("📦 Response data:", data);
  } catch (error) {
    console.log("❌ POST API call failed:", error.message);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log("🚀 Starting CORS fix verification tests...");
  console.log("");

  await testRelativeAPI();
  console.log("");

  await testDirectAPI();
  console.log("");

  await testPostAPI();
  console.log("");

  console.log("🎉 CORS fix tests completed!");
  console.log("");
  console.log("💡 Expected results:");
  console.log("   ✅ Relative API calls should work (via proxy)");
  console.log("   ❌ Direct API calls should fail (CORS blocked)");
  console.log("   ✅ POST API calls should work (via proxy)");
};

// Auto-run tests if in browser console
if (typeof window !== "undefined") {
  runAllTests();
} else {
  console.log("ℹ️  Copy and paste this script into your browser console");
  console.log("   after starting the React app with: npm start");
}

// Export for manual testing
if (typeof module !== "undefined") {
  module.exports = { testRelativeAPI, testDirectAPI, testPostAPI, runAllTests };
}
