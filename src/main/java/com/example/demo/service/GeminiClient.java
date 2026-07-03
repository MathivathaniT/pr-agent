package com.example.demo.service;

import com.example.demo.model.ReviewComment;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public List<ReviewComment> reviewDiff(String diffContent) {
        String prompt = """
                You are a code review assistant. Review the following GitHub pull request diff
                for bugs, style issues, and best practice violations.

                Return ONLY a JSON array, no markdown fences, no explanation text, in this exact format:
                [{"file": "path/to/file.java", "line": 12, "comment": "explanation here", "severity": "bug"}]

                Valid severity values: "bug", "style", "suggestion".
                If there are no issues, return an empty array: []

                Diff:
                %s
                """.formatted(diffContent);

        try {
            String rawResponse = callGemini(prompt);
            String cleaned = cleanJsonResponse(rawResponse);
            return objectMapper.readValue(cleaned,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ReviewComment.class));
        } catch (Exception e) {
            System.err.println("Gemini review failed: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public String explainBug(String diffHunk) {
        String prompt = """
                Explain the root cause of the bug in this code diff hunk, and suggest a fix.
                Keep it concise, 2-4 sentences.

                Diff hunk:
                %s
                """.formatted(diffHunk);

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            System.err.println("Gemini debug explanation failed: " + e.getMessage());
            return "Could not generate explanation due to an error.";
        }
    }

    private String callGemini(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        String response = restClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + response, e);
        }
    }

    private String cleanJsonResponse(String raw) {
        return raw.trim()
                .replaceAll("^```json", "")
                .replaceAll("^```", "")
                .replaceAll("```$", "")
                .trim();
    }
}
