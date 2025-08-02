# agents/github_content_fetcher.py
import requests
import base64

class GitHubContentFetcher:
    def __init__(self, token):
        self.token = token
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    def fetch_file(self, owner, repo, file_path):
        """Fetch file content from GitHub"""
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            content = response.json()
            if content.get("type") == "file":
                # Decode base64 content
                encoded_content = content.get("content", "")
                decoded_content = base64.b64decode(encoded_content).decode('utf-8')
                return decoded_content
        return None 