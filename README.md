# Risk Analyser

AI-powered risk analysis system for GitHub Pull Requests with comprehensive dashboards and analysis tools.

## Projects

### 📊 Dashboard (New)

**Location**: `dashboard/`
**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS

A modern, responsive dashboard for analyzing GitHub Pull Requests with AI-powered insights.

**Features:**

- PR URL input with validation
- AI-Generated Test Recommendations (UTS)
- Overall Risk Assessment with scoring
- Impacted Modules Analysis
- Code Complexity Metrics
- Historical Risk Patterns
- Real-time Dashboard Statistics

**Quick Start:**

```bash
cd dashboard
npm install
npm run dev
```

Open `http://localhost:5173` to view the dashboard.

### 🔍 Impact & Risk Dashboard (Existing)

**Location**: `Impact & Risk Dashboard/`
**Tech Stack**: React + Material-UI + Spring Boot

The original dashboard implementation with comprehensive analysis features.

### 🧪 Other Analysis Tools

- **Diff Analyser**: `diff-analyser/`
- **LLM Integration**: `llm/`
- **Core Hackathon Code**: `hackathon/`

## Getting Started

1. **Choose your dashboard**:

   - **New Dashboard** (Recommended): Modern React with Tailwind CSS
   - **Existing Dashboard**: Material-UI based implementation

2. **Set up the backend API**:
   The dashboards expect a single endpoint for PR analysis:

   ```
   POST /api/pr/analyze
   Body: { "prUrl": "https://github.com/owner/repo/pull/123" }
   ```

3. **Run the frontend**:

   ```bash
   # For new dashboard
   cd dashboard && npm run dev

   # For existing dashboard
   cd "Impact & Risk Dashboard" && npm start
   ```

## API Integration

Both dashboards are designed to work with a single AI-powered API endpoint that provides:

- Pull Request metadata extraction
- Risk scoring and analysis
- Impacted modules identification
- AI-generated test recommendations
- Code complexity analysis
- Historical risk data

See `dashboard/src/data/sampleData.ts` for the expected API response format.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
