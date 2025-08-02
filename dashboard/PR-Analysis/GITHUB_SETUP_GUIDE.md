# 🔑 GitHub Personal Access Token Setup Guide

## 🚫 Current Issue

You're seeing: `"GitHub API rate limit exceeded. Please wait 5 minutes..."`

**Current Limits:**

- ❌ **Without Token**: 60 requests/hour
- ✅ **With Token**: 5,000 requests/hour (83x increase!)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings**

   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**

   - Click **"Generate new token (classic)"**
   - Give it a descriptive name: `Risk Analyzer Dashboard`

3. **Select Required Scopes**

   - ✅ **`public_repo`** - Access public repositories (minimum required)
   - ✅ **`repo`** - Full repository access (if you need private repos)
   - ✅ **`read:org`** - Read organization data (optional, for better user info)

4. **Set Expiration**

   - Choose **"90 days"** or **"No expiration"** for development
   - Click **"Generate token"**

5. **Copy Your Token**
   - ⚠️ **IMPORTANT**: Copy the token immediately - you won't see it again!
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Configure Your Application

1. **Create .env file** in your project root (`dashboard/PR-Analysis/.env`):

   ```bash
   # GitHub API Configuration
   REACT_APP_GITHUB_TOKEN=ghp_your_token_here

   # Optional: Backend API URL
   REACT_APP_API_BASE_URL=
   ```

2. **Replace `ghp_your_token_here`** with your actual token

3. **Restart the application**:
   ```bash
   npm start
   ```

---

## 📋 Complete .env File Example

Create `dashboard/PR-Analysis/.env` with:

```bash
# GitHub API Configuration - REQUIRED
REACT_APP_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API Configuration - OPTIONAL
REACT_APP_API_BASE_URL=

# If using EC2 server backend (uncomment if needed)
# REACT_APP_API_BASE_URL=http://3.108.10.206:8080

# Application Configuration - OPTIONAL
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
```

---

## ✅ Verification Steps

1. **Start the application**: `npm start`

2. **Check the console** for:

   ```
   📊 Rate limit status: 4,999 requests remaining
   ✅ GitHub API Success: getPullRequests - Found X PRs
   ```

3. **Dashboard should show**:
   - ✅ Real GitHub data instead of "Using sample data"
   - ✅ No rate limit warnings
   - ✅ Repository information loads correctly

---

## 🔒 Security Best Practices

### ✅ DO:

- Keep your token private and secure
- Use environment variables (`.env` file)
- Add `.env` to your `.gitignore` file
- Use minimal required scopes
- Rotate tokens periodically

### ❌ DON'T:

- Commit tokens to version control
- Share tokens in screenshots or documentation
- Use overly broad scopes
- Store tokens in code files

---

## 🛠️ Troubleshooting

### Problem: Token not working

**Solution**: Verify the token format starts with `ghp_` and has correct scopes

### Problem: Still getting rate limits

**Solution**:

1. Check if `.env` file is in correct location
2. Restart the application completely
3. Verify token hasn't expired

### Problem: Private repo access denied

**Solution**: Use `repo` scope instead of just `public_repo`

### Problem: Organization data not loading

**Solution**: Add `read:org` scope to your token

---

## 📊 Rate Limit Comparison

| Authentication     | Requests/Hour | Best For                 |
| ------------------ | ------------- | ------------------------ |
| **None**           | 60            | Quick testing only       |
| **Personal Token** | 5,000         | Development & Production |
| **GitHub App**     | 15,000        | Enterprise applications  |

---

## 🎯 Expected Results

After setup, you should see:

- ✅ **5,000 requests/hour** instead of 60
- ✅ **Real repository data** from GitHub
- ✅ **No rate limit errors** during normal usage
- ✅ **Faster performance** with cached data
- ✅ **Access to private repositories** (if using `repo` scope)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify your token hasn't expired at https://github.com/settings/tokens
3. Ensure `.env` file is in the correct location: `dashboard/PR-Analysis/.env`
4. Restart the application after making changes

---

**🚀 Ready to go? Your GitHub API limits will increase from 60 to 5,000 requests/hour!**
