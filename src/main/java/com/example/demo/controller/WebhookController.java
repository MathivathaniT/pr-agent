package com.example.demo.controller;

import com.example.demo.service.MasterAgentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhook")
public class WebhookController {

    private final MasterAgentService masterAgentService;

    public WebhookController(MasterAgentService masterAgentService) {
        this.masterAgentService = masterAgentService;
    }

    @PostMapping("/github")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-GitHub-Event", required = false) String eventType) {

        System.out.println("Received event: " + eventType);

        if (!"pull_request".equals(eventType)) {
            return ResponseEntity.ok("ignored: " + eventType);
        }

        masterAgentService.handlePullRequestEvent(payload);
        return ResponseEntity.ok("processing");
    }
}
