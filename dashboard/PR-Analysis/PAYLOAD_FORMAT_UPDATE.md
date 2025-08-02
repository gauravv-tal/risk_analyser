# 🔄 Payload Format Update

## ✅ **COMPLETED**: Updated API Payload Format

The `/api/v1/retrieve` endpoint payload format has been updated as requested.

---

## 🔄 **Changes Made**

### **Before:**

```json
{
  "PR_ID": "calorie-tracker_3"
}
```

### **After (Current):**

```json
{
  "prId": "calorie-tracker_3"
}
```

---

## 🎯 **API Endpoint Details**

### **POST /api/v1/retrieve**

**Request:**

```bash
POST http://3.108.10.206:8080/api/v1/retrieve
Content-Type: application/json

{
  "prId": "calorie-tracker_3"
}
```

**Response (Success):**

```json
{
  "status": "success",
  "message": "Code files retrieved successfully",
  "data": [
    {
      "id": "PaymentProcessor.java",
      "test_cases": "// ... test code ..."
    }
  ]
}
```

**Response (Error):**

```json
{
  "status": "error",
  "message": "No data found for prId: calorie-tracker_3",
  "data": null
}
```

---

## 📊 **URL → Payload Examples**

| **Input URL**                                         | **Extracted prId**  | **API Payload**                 |
| ----------------------------------------------------- | ------------------- | ------------------------------- |
| `https://github.com/SayaliTal/calorie-tracker/pull/3` | `calorie-tracker_3` | `{"prId": "calorie-tracker_3"}` |
| `https://github.com/facebook/react/pull/123`          | `react_123`         | `{"prId": "react_123"}`         |
| `https://github.com/microsoft/vscode/pull/4567`       | `vscode_4567`       | `{"prId": "vscode_4567"}`       |

---

## 🔧 **Files Updated**

- **`src/services/api.ts`** - Updated API call payload
- **`test-pr-id-extraction.js`** - Updated test output format
- **`test-api-call.js`** - Updated mock API call payload
- **`test-api-call-node.js`** - Updated test payload format
- **`test-cors-fix.js`** - Updated test payload format

---

## 🧪 **Testing Results**

### **PR_ID Extraction Test:**

```bash
🧪 Testing PR_ID Extraction:
1. URL: https://github.com/SayaliTal/calorie-tracker/pull/3
   PR_ID: calorie-tracker_3
   API Request Body: {"prId":"calorie-tracker_3"}
✅ API receives: { "prId": "calorie-tracker_123" } (repository name + _ + PR number)
```

### **API Call Flow:**

```bash
1. User enters: https://github.com/SayaliTal/calorie-tracker/pull/3
2. Frontend extracts: calorie-tracker_3
3. API call made to: POST /api/v1/retrieve
4. Payload sent: {"prId": "calorie-tracker_3"}
5. Response received: Success or Error JSON
```

---

## 🚀 **Summary**

✅ **Payload Format**: Changed from `"PR_ID"` to `"prId"`  
✅ **API Endpoint**: `/api/v1/retrieve` (unchanged)  
✅ **Request Method**: POST (unchanged)  
✅ **prId Format**: `repository_number` (e.g., `calorie-tracker_3`)  
✅ **Response Format**: Same as before (unchanged)  
✅ **All Tests**: Updated and passing

### 🎯 **Current Status:**

**Your React frontend now sends the correct payload format to your backend API!**

**Example API call:**

```bash
POST http://3.108.10.206:8080/api/v1/retrieve
Content-Type: application/json

{
  "prId": "calorie-tracker_3"
}
```

**The payload format is now exactly as requested.** 🚀
