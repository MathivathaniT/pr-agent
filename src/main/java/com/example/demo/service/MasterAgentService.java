package com.example.demo.service;

import com.example.demo.model.ReviewComment;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MasterAgentService {

    private final GitHubApiService gitHubApiService;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MasterAgentService(GitHubApiService gitHubApiService, GeminiClient geminiClient) {
        this.gitHubApiService = gitHubApiService;
        this.geminiClient = geminiClient;
    }

    public void handlePullRequestEvent(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String action = root.path("action").asText();

            if (!action.equals("opened") && !action.equals("synchronize")) {
                System.out.println("Ignoring PR action: " + action);
                return;
            }

            String owner = root.path("repository").path("owner").path("login").asText();
            String repo = root.path("repository").path("name").asText();
            int prNumber = root.path("pull_request").path("number").asInt();
            String commitId = root.path("pull_request").path("head").path("sha").asText();

            System.out.println("Processing PR #" + prNumber + " in " + owner + "/" + repo);

            String diffFilesJson = gitHubApiService.fetchDiffFiles(owner, repo, prNumber);
            JsonNode filesArray = objectMapper.readTree(diffFilesJson);

            StringBuilder combinedDiff = new StringBuilder();
            for (JsonNode file : filesArray) {
                String filename = file.path("filename").asText();
                String patch = file.path("patch").asText("");
                if (patch.isEmpty()) continue;
                combinedDiff.append("File: ").append(filename).append("\n");
                combinedDiff.append(patch).append("\n\n");
            }

            if (combinedDiff.isEmpty()) {
                System.out.println("No reviewable changes found.");
                return;
            }

            List<ReviewComment> comments = geminiClient.reviewDiff(combinedDiff.toString());

            if (comments.isEmpty()) {
                gitHubApiService.postGeneralComment(owner, repo, prNumber,
                        "**Code Review Agent**: No issues found in this diff.");
                return;
            }

            for (ReviewComment c : comments) {
                String label = "**[" + c.getSeverity().toUpperCase() + "] Code Review Agent**\n\n" + c.getComment();
                gitHubApiService.postInlineComment(owner, repo, prNumber, commitId, c.getFile(), c.getLine(), label);

                if ("bug".equalsIgnoreCase(c.getSeverity())) {
                    String explanation = geminiClient.explainBug(c.getFile() + " line " + c.getLine() + ": " + c.getComment());
                    String debugLabel = "**[Debug Agent]**\n\n" + explanation;
                    gitHubApiService.postInlineComment(owner, repo, prNumber, commitId, c.getFile(), c.getLine(), debugLabel);
                }
            }

        } catch (Exception e) {
            System.err.println("Error processing PR event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
