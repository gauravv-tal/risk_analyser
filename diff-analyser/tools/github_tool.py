# tools/github_tool.py

import requests
import json
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

class PRNumberInput(BaseModel):
    pr_number: int = Field(description="The pull request number to fetch files from", default=1)

class GitHubPRTool(BaseTool):
    def __init__(self, pat, repo_owner, repo_name):
        super().__init__()
        self._pat = pat
        self._repo_owner = repo_owner
        self._repo_name = repo_name
        self._base_url = "https://api.github.com"
        self._headers = {
            "Authorization": f"token {pat}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    def get_pr_files(self, pr_number):
        """Get changed files for a PR"""
        url = f"{self._base_url}/repos/{self._repo_owner}/{self._repo_name}/pulls/{pr_number}/files"
        response = requests.get(url, headers=self._headers)
        if response.status_code == 200:
            return response.json()
        return []
    
    def get_commit_history(self, file_path):
        """Get recent commit history for a file"""
        url = f"{self._base_url}/repos/{self._repo_owner}/{self._repo_name}/commits"
        params = {"path": file_path, "per_page": 5}
        response = requests.get(url, headers=self._headers, params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def _run(self, pr_number: int):
        """Required method for CrewAI tools"""
        return self.get_pr_files(pr_number)
    
    @property
    def name(self):
        return "GitHub PR Tool"
    
    @property
    def description(self):
        return "Fetches changed files from a GitHub pull request"
    
    @property
    def args_schema(self):
        return PRNumberInput 