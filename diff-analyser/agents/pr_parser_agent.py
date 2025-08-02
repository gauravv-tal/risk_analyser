# agents/pr_parser_agent.py
import requests

class PRParserAgent:
    def __init__(self, token):
        self.token = token
        self.headers = {"Authorization": f"token {self.token}"}

    def get_changed_files(self, owner, repo, pr_number):
        url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch PR files: {response.status_code} {response.text}")
        files = response.json()
        return [file["filename"] for file in files if file["status"] != "removed"] 