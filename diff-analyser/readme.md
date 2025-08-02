# PR Impact Analyzer

A CrewAI-based tool that analyzes GitHub pull requests to assess impact, generate test cases, and provide risk scores.

## Features

- 🔍 **PR Analysis**: Fetches and analyzes changed files from GitHub PRs
- 📊 **Dependency Analysis**: Identifies impacted modules and dependencies
- 🧪 **Test Generation**: Generates complete test code for impacted modules
- ⚠️ **Risk Assessment**: Provides risk scores (1-10) with explanations
- 🔗 **GitHub Integration**: Direct integration with GitHub API

## Prerequisites

- Python 3.8+
- GitHub Personal Access Token (PAT)
- OpenAI API Key

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Export your GitHub Personal Access Token:

```bash
export GITHUB_PAT="your_github_personal_access_token"
```

Export your OpenAI API Key:

```bash
export OPENAI_API_KEY="your_openai_api_key"
```

### 3. Configure Repository Settings

Edit `main.py` to set your repository details:

```python
owner = "your-github-username"
repo = "your-repository-name"
pr_number = 1  # Replace with your PR number
```

### 4. Run the Analyzer

```bash
python main.py
```

## Output

The tool will provide:

1. **Dependency Analysis**: List of impacted modules
2. **Test Code Generation**: Complete test files with assertions
3. **Risk Assessment**: Risk score with detailed explanation
4. **Test Advisor Summary**: Dedicated section with generated test code

## Project Structure

```
diff-analyser/
├── main.py                 # Main execution script
├── requirements.txt        # Python dependencies
├── agents/                # Agent implementations
│   ├── pr_parser_agent.py
│   ├── dependency_analyzer_agent.py
│   ├── test_advisor_agent.py
│   ├── risk_scorer_agent.py
│   └── github_content_fetcher.py
├── tools/                 # Tool implementations
│   ├── github_tool.py
│   ├── context_lookup_tool.py
│   └── context_builder.py
└── data/                  # Data files
    └── context.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_PAT` | GitHub Personal Access Token | Yes |
| `OPENAI_API_KEY` | OpenAI API Key | Yes |

## Troubleshooting

- **GitHub PAT Error**: Ensure your token has `repo` permissions
- **OpenAI API Error**: Verify your API key is valid and has credits
- **Import Errors**: Run `pip install -r requirements.txt` again
- **No Test Output**: Check if the PR has actual code changes to test

## Example Output

```
--- Final AI Output ---
[Complete analysis results]

================================================================================
🧪 TEST ADVISOR OUTPUT
================================================================================
def test_calculate_calories():
    # Test implementation
    assert calculate_calories(100, 4) == 400

================================================================================
✅ Task Completion Summary
================================================================================
✅ Dependency Analysis Task: Completed
✅ Test Generation Task: Completed
✅ Risk Assessment Task: Completed
```
