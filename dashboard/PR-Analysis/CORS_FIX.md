# 🔧 CORS Error Fix Guide

## 🚨 **Current Issue**

```
Access to fetch at 'http://3.108.10.206:8080/api/v1/summary/retrieve/calorie-tracker%233'
from origin 'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🎯 **Root Cause**

Your EC2 backend server at `3.108.10.206:8080` doesn't have CORS headers configured to allow requests from `http://localhost:3000`.

---

## ✅ **Solution 1: Backend CORS Configuration (Recommended)**

### **For Spring Boot Backend:**

Add this to your main application class or configuration:

```java
@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DashboardController {
    // Your existing controller code
}
```

**Or globally configure CORS:**

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### **For Node.js/Express Backend:**

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
```

### **For Nginx (if using reverse proxy):**

```nginx
server {
    listen 8080;
    server_name 3.108.10.206;

    location /api/ {
        add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://localhost:3000';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        proxy_pass http://your-backend-service;
    }
}
```

---

## ⚡ **Solution 2: Development Proxy (Quick Fix)**

### **Option A: React Proxy (package.json)**

Add this to your `package.json`:

```json
{
  "name": "dashboard",
  "version": "0.1.0",
  "proxy": "http://3.108.10.206:8080",
  "dependencies": {
    // ... existing dependencies
  }
}
```

**Then update API_BASE_URL in `src/services/api.ts`:**

```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
```

### **Option B: Custom Proxy Server**

Create `setupProxy.js` in `src/` folder:

```javascript
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://3.108.10.206:8080",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
    })
  );
};
```

---

## 🛠️ **Solution 3: Browser Extension (Development Only)**

Install "CORS Unblock" or "CORS Everywhere" browser extension for Chrome/Firefox.

**⚠️ Warning: Only for development. Never use in production!**

---

## 🔍 **URL Encoding Issue Fix**

I noticed the URL shows `calorie-tracker%233` instead of `calorie-tracker_3`. Let's verify our format:

### **Current extractPrId Function:**

```typescript
extractPrId(url: string): string | null {
  const repoInfo = this.parseRepositoryFromUrl(url);
  if (repoInfo) {
    return `${repoInfo.repo}_${repoInfo.number}`; // Should return calorie-tracker_3
  }
  return null;
}
```

### **Debug Steps:**

1. Clear browser cache and hard refresh (Cmd/Ctrl + Shift + R)
2. Check browser Network tab to see actual request URLs
3. Verify console logs show correct PR_ID format

---

## 🧪 **Testing CORS Fix**

### **Test Commands:**

```bash
# Test CORS with curl
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://3.108.10.206:8080/api/v1/summary/retrieve/calorie-tracker_3

# Should return CORS headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### **Browser Console Test:**

```javascript
// Run in browser console to test
fetch("http://3.108.10.206:8080/api/v1/summary/retrieve/calorie-tracker_3", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => console.log("✅ CORS working!"))
  .catch((error) => console.log("❌ CORS error:", error));
```

---

## 🚀 **Quick Implementation Steps**

### **Backend Team (Recommended):**

1. Add CORS configuration to your Spring Boot/Node.js application
2. Allow origins: `http://localhost:3000`, `http://localhost:3001`
3. Allow methods: `GET`, `POST`, `OPTIONS`
4. Allow headers: `Content-Type`, `Authorization`
5. Restart your EC2 backend service

### **Frontend Team (Temporary):**

1. Add proxy configuration to `package.json`
2. Update API_BASE_URL to use relative paths
3. Restart React development server

---

## 📊 **Expected Results After Fix**

### **Before (CORS Error):**

```
❌ CORS policy blocked
❌ No API response
❌ Shows mock data only
```

### **After (CORS Fixed):**

```
✅ API calls successful
✅ Real data from EC2 server
✅ Network tab shows 200/500 responses (not CORS errors)
```

---

## 🎯 **Verification Checklist**

- [ ] Backend CORS headers configured
- [ ] Browser shows network requests (not CORS blocked)
- [ ] Console logs show actual API responses
- [ ] PR_ID format shows `calorie-tracker_3` (not `%233`)
- [ ] Both POST and GET endpoints working
- [ ] Error handling shows API errors (not CORS errors)

---

## 📞 **If Still Not Working**

### **Check These:**

1. **Firewall**: EC2 security groups allow port 8080
2. **Service Status**: Backend service running on 3.108.10.206:8080
3. **Network**: Can you curl the EC2 server directly?
4. **Browser**: Try different browser or incognito mode

### **Debugging Commands:**

```bash
# Test if server is reachable
curl http://3.108.10.206:8080/api/v1/summary/retrieve/test

# Test CORS specifically
curl -I -H "Origin: http://localhost:3000" http://3.108.10.206:8080/api/v1/summary/retrieve/test
```

---

## 💡 **Production Considerations**

For production deployment, configure CORS to allow your actual domain:

```java
// Production CORS (Spring Boot)
configuration.setAllowedOrigins(Arrays.asList(
    "https://your-domain.com",
    "https://dashboard.your-domain.com"
));
```

**Never use `*` for origins in production with credentials enabled!**
