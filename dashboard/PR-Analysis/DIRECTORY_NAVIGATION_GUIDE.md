# 📁 Directory Navigation Guide

## 🚨 **Current Problem:**

You're running `npm start` from the **wrong directory**!

### ❌ **Where You Are (Wrong):**

```bash
/Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/
# ↑ This is the ROOT project directory - NO package.json here!
```

### ✅ **Where You Need to Be (Correct):**

```bash
/Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/dashboard/PR-Analysis/
# ↑ This is where the React app lives - package.json is HERE!
```

---

## 🎯 **Solution: Navigate to Correct Directory**

### **Copy and paste these exact commands:**

```bash
# Navigate to the correct directory
cd /Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/dashboard/PR-Analysis/

# Verify you're in the right place (should show package.json)
ls -la package.json

# Now start the React server
npm start
```

### **Alternative (step by step):**

```bash
# Start from anywhere
cd /Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/

# Go into the dashboard folder
cd dashboard/

# Go into the PR-Analysis folder
cd PR-Analysis/

# Verify you're in the right place
pwd
# Should show: /Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/dashboard/PR-Analysis

# Now start the server
npm start
```

---

## 🔍 **How to Know You're in the Right Place:**

### **When you run `ls -la`, you should see:**

```bash
✅ package.json          # React app configuration
✅ src/                  # Source code folder
✅ public/               # Public assets folder
✅ node_modules/         # Dependencies folder
✅ build/                # Built app folder
✅ tsconfig.json         # TypeScript configuration
```

### **When you run `pwd`, you should see:**

```bash
/Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/dashboard/PR-Analysis
```

---

## 🚨 **Quick Fix Commands:**

**Copy this entire block and paste into your terminal:**

```bash
cd /Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/dashboard/PR-Analysis/ && pwd && ls -la package.json && npm start
```

**This command will:**

1. Navigate to the correct directory
2. Show you where you are (`pwd`)
3. Confirm package.json exists (`ls -la package.json`)
4. Start the React server (`npm start`)

---

## 📊 **Project Structure Reminder:**

```
risk_analyser/                           ← Root project (NO package.json)
├── README.md
├── dashboard/                           ← Folder
│   └── PR-Analysis/                     ← React app folder (HAS package.json)
│       ├── package.json                 ← ✅ THIS is what npm needs!
│       ├── src/
│       ├── public/
│       └── node_modules/
├── diff-analyser/
└── llm/
```

---

## 🎯 **After Starting Successfully:**

1. ✅ Server will start on `http://localhost:3000`
2. ✅ Browser should open automatically
3. ✅ You'll see the PR Analysis Dashboard
4. ✅ CORS proxy will route API calls to `3.108.10.206:8080`

---

## 💡 **Remember for Future:**

**Always run React commands from:**

```bash
/Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/dashboard/PR-Analysis/
```

**NOT from:**

```bash
/Users/deepika.chouhan/Desktop/Projects/Hackathon_1.0/risk_analyser/  ← Wrong!
```
