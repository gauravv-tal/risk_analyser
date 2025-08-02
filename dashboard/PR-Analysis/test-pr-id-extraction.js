// Test script to demonstrate PR_ID extraction functionality
// This script shows how the extractPrId function works with different URL formats

// Simulate the transformers.extractPrId function
function parseRepositoryFromUrl(url) {
  const githubMatch = url.match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)/
  );
  if (githubMatch) {
    return {
      platform: "github",
      owner: githubMatch[1],
      repo: githubMatch[2],
      number: parseInt(githubMatch[3], 10),
    };
  }

  const gitlabMatch = url.match(
    /^https:\/\/gitlab\.com\/([\w.-]+)\/([\w.-]+).*\/merge_requests\/(\d+)/
  );
  if (gitlabMatch) {
    return {
      platform: "gitlab",
      owner: gitlabMatch[1],
      repo: gitlabMatch[2],
      number: parseInt(gitlabMatch[3], 10),
    };
  }

  return null;
}

function extractPrId(url) {
  const repoInfo = parseRepositoryFromUrl(url);
  if (repoInfo) {
    return `${repoInfo.repo}_${repoInfo.number}`;
  }
  return null;
}

// Test cases
const testUrls = [
  "https://github.com/facebook/react/pull/123",
  "https://github.com/microsoft/vscode/pull/4567",
  "https://gitlab.com/gitlab-org/gitlab/merge_requests/890",
  "https://github.com/vercel/next.js/pull/12345",
  "https://github.com/nodejs/node/pull/987",
  "invalid-url",
];

console.log("🧪 Testing PR_ID Extraction:");
console.log("=".repeat(50));

testUrls.forEach((url, index) => {
  const prId = extractPrId(url);
  console.log(`${index + 1}. URL: ${url}`);
  console.log(`   PR_ID: ${prId || "null"}`);
  console.log(
    `   API Request Body: ${
      prId ? JSON.stringify({ prId: prId }) : "Invalid URL"
    }`
  );
  console.log("-".repeat(40));
});

console.log(
  "\n✅ This demonstrates how the frontend extracts PR_ID from user input URLs"
);
console.log("✅ The extracted PR_ID is then sent to /api/v1/retrieve endpoint");
console.log(
  '✅ API receives: { "prId": "calorie-tracker_123" } (repository name + _ + PR number)'
);
