package com.luxzera.server.admin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Component
public class AdminAuditSanitizer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> SENSITIVE_KEYS = Set.of(
            "password", "passwordhash", "password_hash",
            "token", "rawtoken", "invitationtoken", "invitation_token", "invitationtokenhash",
            "otp", "otphash", "otp_hash",
            "sessiontoken", "session_token", "sessiontokenhash",
            "secret", "jwt", "authorization", "apikey", "api_key"
    );

    private static final Pattern SENSITIVE_KEY_PATTERN = Pattern.compile(
            ".*(password|token|otp|secret|hash|jwt|credential|authorization).*",
            Pattern.CASE_INSENSITIVE
    );

    public String sanitizeChangesJson(String json) {
        if (json == null || json.isBlank()) {
            return "{}";
        }
        try {
            JsonNode root = objectMapper.readTree(json);
            sanitizeNode(root);
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            log.debug("Could not parse JSON for audit redaction; applying regex mask: {}", e.getMessage());
            return applyRegexMask(json);
        }
    }

    private void sanitizeNode(JsonNode node) {
        if (node == null) return;
        if (node.isObject()) {
            ObjectNode obj = (ObjectNode) node;
            Iterator<Map.Entry<String, JsonNode>> fields = obj.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String key = entry.getKey().toLowerCase().replace("-", "").replace("_", "");
                if (SENSITIVE_KEYS.contains(key) || SENSITIVE_KEY_PATTERN.matcher(key).matches()) {
                    entry.setValue(new TextNode("[REDACTED]"));
                } else {
                    sanitizeNode(entry.getValue());
                }
            }
        } else if (node.isArray()) {
            ArrayNode arr = (ArrayNode) node;
            for (int i = 0; i < arr.size(); i++) {
                sanitizeNode(arr.get(i));
            }
        }
    }

    private String applyRegexMask(String text) {
        if (text == null) return null;
        return text.replaceAll("(?i)(\"(?:password|token|otp|secret|hash)[^\"]*\":\\s*\")[^\"]*(\")", "$1[REDACTED]$2");
    }
}
