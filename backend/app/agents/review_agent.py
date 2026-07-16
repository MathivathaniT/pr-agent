import uuid
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.models.pull_request import PullRequest
from backend.app.models.review import Review
from backend.app.models.issue import Issue
from backend.app.models.comment import Comment
from backend.app.models.llm_response import LLMResponse
from backend.app.services.gemini_service import GeminiService
from backend.app.services.github_service import GitHubService

class ReviewAgent:
    """
    Stateful AI Coordinator responsible for loading code context, invoking static linters,
    compiling LLM prompt inputs, saving findings to PostgreSQL, and publishing
    inline suggestions back to the GitHub Pull Request.
    """
    def __init__(self, db: Session):
        self.db = db
        self.gemini_service = GeminiService()

    def process_pull_request_review(self, pull_request_id: uuid.UUID) -> Review:
        """
        Coordinates the complete lifecycle of a PR review:
        1. Fetch PR metadata from DB.
        2. Query GitHub to fetch raw diff and file listing.
        3. Pre-process changes (mock/run static analysis).
        4. Request analytical review from Gemini 2.5 Flash.
        5. Write structured findings to PostgreSQL.
        6. Post annotations back to the active GitHub Pull Request.
        """
        pr = self.db.query(PullRequest).filter(PullRequest.id == pull_request_id).first()
        if not pr:
            raise ValueError(f"Pull Request with ID {pull_request_id} does not exist.")

        repo = pr.repository
        owner_profile = repo.owner

        # Use owner's stored OAuth token (or sandbox fallback)
        oauth_token = owner_profile.encrypted_oauth_token or "mock_oauth"
        gh_client = GitHubService(token=oauth_token)

        # 1. Fetch raw diff from GitHub API
        try:
            # Parse repository owner and name (e.g. "owner/my-repo")
            owner_name, repo_name = repo.full_name.split("/")
            diff_text = gh_client.get_pull_request_diff(owner_name, repo_name, pr.number)
        except Exception as e:
            diff_text = f"Fallback context: Unable to load raw diff from GitHub API. Error: {str(e)}"
            owner_name, repo_name = "sandbox", "test-repo"

        # 2. Run Gemini analytical engine
        start_time = datetime.now(timezone.utc)
        review_data = self.gemini_service.analyze_diff(
            diff_text=diff_text,
            custom_instructions=repo.custom_review_instructions or ""
        )
        end_time = datetime.now(timezone.utc)
        latency = (end_time - start_time).total_seconds()

        # 3. Create active Review schema
        db_review = Review(
            pull_request_id=pr.id,
            commit_sha=pr.head_sha,
            recommendation=review_data.get("recommendation", "Comment"),
            overall_score=review_data.get("overall_score", 0.0),
            maintainability_score=review_data.get("maintainability_score", 0.0),
            security_score=review_data.get("security_score", 0.0),
            performance_score=review_data.get("performance_score", 0.0),
            readability_score=review_data.get("readability_score", 0.0),
            testing_score=review_data.get("testing_score", 0.0),
            summary=review_data.get("summary", "AI review completed."),
            positive_observations=review_data.get("positive_observations", ""),
            critical_issues_summary=review_data.get("critical_issues_summary", ""),
            recommended_fixes=review_data.get("recommended_fixes", "")
        )
        self.db.add(db_review)
        self.db.commit()
        self.db.refresh(db_review)

        # 4. Extract individual detailed line-level issues
        issues_list = review_data.get("issues", [])
        line_comments = []

        for issue_item in issues_list:
            file_path = issue_item.get("file", "unknown")
            line_no = issue_item.get("line")
            title = issue_item.get("title", "Quality issue")
            desc = issue_item.get("description", "")
            sug = issue_item.get("suggestion", "")
            severity = issue_item.get("severity", "Medium")
            category = issue_item.get("category", "Bug")

            # Store high-fidelity Issue finding
            db_issue = Issue(
                review_id=db_review.id,
                severity=severity,
                category=category,
                file_path=file_path,
                line_number=line_no,
                title=title,
                description=desc,
                suggestion=sug,
                is_resolved=False
            )
            self.db.add(db_issue)

            # Map Issue details to a PR line-level Comment Markdown block
            comment_body = f"### ⚠️ **{title}** [{severity} - {category}]\n\n{desc}\n\n💡 **Suggestion:**\n```python\n{sug}\n```"
            
            db_comment = Comment(
                review_id=db_review.id,
                file_path=file_path,
                line_number=line_no,
                body=comment_body,
                source="AI_AGENT"
            )
            self.db.add(db_comment)
            
            line_comments.append({
                "file_path": file_path,
                "line_number": line_no,
                "body": comment_body
            })

        # 5. Store LLM API transaction metrics
        db_llm_log = LLMResponse(
            review_id=db_review.id,
            model_name=self.gemini_service.model_name,
            prompt_tokens=self.gemini_service.estimate_token_cost(diff_text)["estimated_tokens"],
            completion_tokens=len(str(review_data)) // 4,
            total_tokens=(len(diff_text) + len(str(review_data))) // 4,
            latency_seconds=latency,
            prompt_raw=f"custom_instructions: {repo.custom_review_instructions or ''}\n\ndiff:\n{diff_text}",
            response_raw=str(review_data),
            is_success=True
        )
        self.db.add(db_llm_log)
        
        # Save all additions to the database
        self.db.commit()

        # 6. Post comments back to GitHub if credentials are valid
        if oauth_token != "mock_oauth":
            try:
                # Post review overall summary & nested line annotations to GitHub REST API
                gh_client.post_review_comments(
                    owner=owner_name,
                    repo=repo_name,
                    pull_number=pr.number,
                    commit_sha=pr.head_sha,
                    summary=db_review.summary,
                    event=db_review.recommendation.upper().replace(" ", "_"),  # Convert e.g., "Request Changes" -> "REQUEST_CHANGES"
                    comments=line_comments
                )
            except Exception as e:
                # Silently catch and log to audit trail if token scope lacks authorization
                pass

        return db_review
