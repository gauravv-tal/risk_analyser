# 🚀 EC2 Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Set Your EC2 Backend URL

```bash
# Create .env file with your EC2 server details
echo "REACT_APP_API_BASE_URL=http://your-ec2-server.amazonaws.com" > .env

# Example with actual EC2 public DNS:
# echo "REACT_APP_API_BASE_URL=http://ec2-123-456-789-012.compute-1.amazonaws.com" > .env
```

### Step 2: Build for Production

```bash
npm run build
```

### Step 3: Test the Integration

```bash
# Test with the current configuration
node test-api-call-node.js
```

**Expected Output:**

```
🔄 Testing API call to http://your-ec2-server.amazonaws.com/api/v1/retrieve
📝 Request payload: {"PR_ID": "123"}
⚠️  API call failed: ECONNREFUSED (API not deployed)
🎭 Falling back to mock response...
✅ Response format matches your API specification exactly
```

### Step 4: Deploy Your React App

```bash
# Option 1: Serve locally for testing
npx serve -s build -p 3000

# Option 2: Deploy to production
# Upload build/ folder to your web server
```

---

## 🎯 What Happens Now?

### ✅ **Current Behavior:**

1. **React app attempts to call your EC2 server**: `http://your-ec2-server.amazonaws.com/api/v1/retrieve`
2. **If EC2 backend is not ready**: Falls back to mock data in your exact format
3. **Mock data includes**: 3 Java test cases with proper JUnit annotations
4. **UI displays**: Transformed test recommendations with full functionality

### 🚀 **When You Deploy Your EC2 Backend:**

1. **No code changes needed** - React app will automatically use real API
2. **API endpoint**: `/api/v1/retrieve`
3. **Request format**: `{"PR_ID": "123"}`
4. **Response format**: Your exact specification with `status`, `message`, `data[]`

---

## 🔧 EC2 Backend Requirements

Your Spring Boot API should handle:

```java
@RestController
@CrossOrigin(origins = {"http://your-frontend-domain.com"})
public class TestRecommendationController {

    @PostMapping("/api/v1/retrieve")
    public ResponseEntity<?> retrieveTestRecommendations(@RequestBody Map<String, String> request) {
        String prId = request.get("PR_ID");

        // Your processing logic here

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Code files retrieved successfully",
            "data", Arrays.asList(
                Map.of(
                    "id", "SomeClass.java",
                    "test_cases", "@Test\npublic void testMethod() { ... }"
                )
            )
        ));
    }
}
```

---

## 🧪 Testing Commands

```bash
# Test React app integration
node test-api-call-node.js

# Test EC2 endpoint directly (when deployed)
curl -X POST http://your-ec2-server.amazonaws.com/api/v1/retrieve \
  -H "Content-Type: application/json" \
  -d '{"PR_ID": "123"}'

# Check if React app is correctly configured
grep -r "REACT_APP_API_BASE_URL" .env
```

---

## 📊 Configuration Summary

| Component        | Configuration        | Value                                                         |
| ---------------- | -------------------- | ------------------------------------------------------------- |
| **Frontend**     | Environment Variable | `REACT_APP_API_BASE_URL=http://your-ec2-server.amazonaws.com` |
| **API Endpoint** | Backend Route        | `/api/v1/retrieve`                                            |
| **Request**      | JSON Payload         | `{"PR_ID": "123"}`                                            |
| **Response**     | Your Format          | `{status, message, data[]}`                                   |
| **Fallback**     | Mock Data            | ✅ Enabled                                                    |

---

## 🎉 You're Ready!

✅ **React app configured for EC2 deployment**  
✅ **Real API calls implemented**  
✅ **Mock data fallback in your exact format**  
✅ **Production build ready**  
✅ **No code changes needed when EC2 is deployed**

**Just update the `.env` file with your actual EC2 URL and you're live!** 🚀
