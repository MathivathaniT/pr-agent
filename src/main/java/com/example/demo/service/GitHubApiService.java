package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class GitHubApiService {

    private final RestClient restClient;

    @Value("${github.token}")
    private String token;

    public GitHubApiService(RestClient restClient) {
        this.restClient = restClient;
    }

    public String fetchDiffFiles(String owner, String repo, int prNumber) {
        return restClient.get()
                .uri("https://api.github.com/repos/{owner}/{repo}/pulls/{pr}/files", owner, repo, prNumber)
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/vnd.github+json")
                .retrieve()
                .body(String.class);
    }

    public void postInlineComment(String owner, String repo, int prNumber,
                                   String commitId, String path, int line, String body) {
        Map<String, Object> payload = Map.of(
                "body", body,
                "commit_id", commitId,
                "path", path,
                "line", line
        );
        try {
            restClient.post()
                    .uri("https://api.github.com/repos/{owner}/{repo}/pulls/{pr}/comments", owner, repo, prNumber)
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/vnd.github+json")
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Failed to post comment on " + path + ":" + line + " -> " + e.getMessage());
        }
    }

    public void postGeneralComment(String owner, String repo, int prNumber, String body) {
        Map<String, Object> payload = Map.of("body", body);
        try {
            restClient.post()
                    .uri("https://api.github.com/repos/{owner}/{repo}/issues/{pr}/comments", owner, repo, prNumber)
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/vnd.github+json")
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Failed to post general comment -> " + e.getMessage());
        }
    }
}
