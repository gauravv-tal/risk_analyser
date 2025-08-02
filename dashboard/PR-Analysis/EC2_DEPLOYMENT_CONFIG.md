# 🚀 EC2 Deployment Configuration

## 📋 Backend API Configuration

The React frontend is configured to call your EC2 backend server for the `/api/v1/retrieve` endpoint.

### 🔧 Environment Configuration

Create a `.env` file in the root of your React project:

```bash
# .env file
REACT_APP_API_BASE_URL=http://your-ec2-server.amazonaws.com
```

### 🌐 Example EC2 Configurations

#### 1. **Public EC2 Instance**

```bash
REACT_APP_API_BASE_URL=http://ec2-123-456-789-012.compute-1.amazonaws.com
```

#### 2. **EC2 with Custom Domain**

```bash
REACT_APP_API_BASE_URL=https://api.yourcompany.com
```

#### 3. **EC2 with Load Balancer**

```bash
REACT_APP_API_BASE_URL=https://your-alb-123456789.us-east-1.elb.amazonaws.com
```

#### 4. **Development/Testing**

```bash
REACT_APP_API_BASE_URL=http://localhost:8080
```

---

## 🎯 API Endpoint Structure

With your EC2 configuration, the frontend will call:

```
${REACT_APP_API_BASE_URL}/api/v1/retrieve
```

**Examples:**

- Production: `http://ec2-123-456-789-012.compute-1.amazonaws.com/api/v1/retrieve`
- Custom Domain: `https://api.yourcompany.com/api/v1/retrieve`
- Development: `http://localhost:8080/api/v1/retrieve`

---

## 📦 Request/Response Format

### Request to EC2:

```json
POST /api/v1/retrieve
Content-Type: application/json

{
  "PR_ID": "123"
}
```

### Expected Response from EC2:

```json
{
  "status": "success",
  "message": "Code files retrieved successfully",
  "data": [
    {
      "id": "filename.java",
      "test_cases": "Java test code here"
    }
  ]
}
```

---

## 🛠️ Deployment Steps

### 1. **Configure Environment**

```bash
# Create .env file
echo "REACT_APP_API_BASE_URL=http://your-ec2-server.amazonaws.com" > .env
```

### 2. **Build for Production**

```bash
npm run build
```

### 3. **Deploy Frontend**

```bash
# Option 1: Serve static files
npx serve -s build -p 3000

# Option 2: Copy build/ to S3/CloudFront
aws s3 sync build/ s3://your-frontend-bucket/

# Option 3: Deploy to EC2 with nginx
sudo cp -r build/* /var/www/html/
```

### 4. **Configure CORS on EC2 Backend**

Your EC2 backend should allow CORS for the frontend domain:

```java
// Spring Boot example
@CrossOrigin(origins = {"http://your-frontend-domain.com", "http://localhost:3000"})
@RestController
public class APIController {
    @PostMapping("/api/v1/retrieve")
    public ResponseEntity<?> retrieve(@RequestBody Map<String, String> request) {
        // Your API logic
    }
}
```

---

## 🧪 Testing the Integration

### 1. **Test API Endpoint**

```bash
curl -X POST http://your-ec2-server.amazonaws.com/api/v1/retrieve \
  -H "Content-Type: application/json" \
  -d '{"PR_ID": "123"}'
```

### 2. **Test Frontend Connection**

1. Start your React app: `npm start`
2. Open browser console
3. Enter a PR URL and click "Analyze PR"
4. Check console logs for API call attempts

### 3. **Monitor Network Requests**

- Open browser Developer Tools → Network tab
- Look for POST requests to `/api/v1/retrieve`
- Verify request payload and response format

---

## 🔍 Troubleshooting

### Common Issues:

#### 1. **CORS Errors**

```
Access to fetch at 'http://ec2-...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: Configure CORS headers on your EC2 backend

#### 2. **Connection Refused**

```
Failed to fetch: TypeError: Failed to fetch
```

**Solution**:

- Verify EC2 instance is running
- Check security groups allow inbound traffic on your API port
- Confirm the correct EC2 public DNS/IP address

#### 3. **SSL Certificate Issues**

```
Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint
```

**Solution**: Use HTTPS for production or configure SSL certificate on EC2

#### 4. **Wrong Endpoint**

**Check**: Ensure your EC2 backend serves `/api/v1/retrieve` endpoint

---

## 📊 Environment Variables Reference

| Variable                 | Description          | Example                                              |
| ------------------------ | -------------------- | ---------------------------------------------------- |
| `REACT_APP_API_BASE_URL` | EC2 backend base URL | `http://ec2-123-456-789-012.compute-1.amazonaws.com` |

**Note**: All `REACT_APP_*` variables are embedded into the build at compile time.

---

## 🚀 Production Checklist

- [ ] EC2 instance running and accessible
- [ ] Security groups configured for API port
- [ ] CORS headers configured on backend
- [ ] Environment variable set with correct EC2 URL
- [ ] Frontend built with production configuration
- [ ] SSL certificate configured (for HTTPS)
- [ ] API endpoint `/api/v1/retrieve` tested and working
- [ ] Error handling tested for API unavailability

**Your React app is ready to connect to your EC2 backend!** 🎉
