import os
from typing import Dict, List, Any
import httpx

class GitHubService:
    """
    Stateless integration wrapper managing interactions with the GitHub REST API v3,
    including diff retrieval, PR content extraction, and posting line-by-line review comments.
    """
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }

    def get_pull_request_diff(self, owner: str, repo: str, pull_number: int) -> str:
        """
        Retrieves the raw diff text of a Pull Request.
        """
        diff_headers = {
            **self.headers,
            "Accept": "application/vnd.github.v3.diff"
        }
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pull_number}"
        response = httpx.get(url, headers=diff_headers)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch PR diff: {response.text}")
        return response.text

    def get_pull_request_files(self, owner: str, repo: str, pull_number: int) -> List[Dict[str, Any]]:
        """
        Returns the metadata and patch info for each file included in the Pull Request.
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pull_number}/files"
        response = httpx.get(url, headers=self.headers)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch PR files: {response.text}")
        return response.json()

    def post_review_comments(
        self, 
        owner: str, 
        repo: str, 
        pull_number: int, 
        commit_sha: str,
        summary: str, 
        event: str,  # "APPROVE", "COMMENT", "REQUEST_CHANGES"
        comments: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Submit a single aggregated review with inline code-level annotations.
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pull_number}/reviews"
        
        # Parse review comments to match GitHub's required schema:
        # [{"path": "file.py", "line": 42, "body": "Comment text"}]
        github_comments = []
        for c in comments:
            github_comments.append({
                "path": c["file_path"],
                "line": c["line_number"],
                "body": c["body"]
            })
            
        payload = {
            "commit_id": commit_sha,
            "body": summary,
            "event": event,
            "comments": github_comments
        }
        
        response = httpx.post(url, headers=self.headers, json=payload)
        if response.status_code not in [200, 201]:
            raise Exception(f"Failed to submit GitHub PR review: {response.text}")
        return response.json()
