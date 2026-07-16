import os
import json
from typing import Dict, Any
from google import genai
from google.genai import types

from backend.app.prompts import review_prompts

class GeminiService:
    """
    Integrates with the modern server-side Google GenAI SDK to run
    highly analytical code reviews using the Gemini 2.5 Flash model.
    """
    def __init__(self):
        # Read API key from environment variable safely
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-2.5-flash"

    def analyze_diff(self, diff_text: str, custom_instructions: str = "") -> Dict[str, Any]:
        """
        Submits the PR diff context to Gemini 2.5 Flash, enforcing a structured JSON response.
        """
        # Format user prompt
        prompt = review_prompts.REVIEW_USER_PROMPT.format(
            diff_text=diff_text,
            custom_instructions=custom_instructions or "None provided."
        )

        try:
            # Enforce structured JSON output in Gemini
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction=review_prompts.SYSTEM_PROMPT,
                temperature=0.1  # Highly deterministic
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            
            # Parse response text directly into standard Python dict
            result = json.loads(response.text)
            return result
            
        except Exception as e:
            # Graceful error handling for invalid JSON returns or client connectivity issues
            return {
                "summary": f"Failed to complete AI automated review due to model execution failure: {str(e)}",
                "overall_score": 0.0,
                "maintainability_score": 0.0,
                "security_score": 0.0,
                "performance_score": 0.0,
                "readability_score": 0.0,
                "testing_score": 0.0,
                "recommendation": "Comment",
                "positive_observations": "None recorded due to model error.",
                "critical_issues_summary": f"Execution error: {str(e)}",
                "recommended_fixes": "Please re-trigger manual review or verify API credentials.",
                "issues": []
            }
        
    def estimate_token_cost(self, text: str) -> Dict[str, int]:
        """
        Calculates character-based token estimates before outbound transmission.
        """
        char_count = len(text)
        # 1 token is approximately 4 characters for standard English / code text
        estimated_tokens = int(char_count / 4)
        return {
            "estimated_tokens": estimated_tokens
        }
