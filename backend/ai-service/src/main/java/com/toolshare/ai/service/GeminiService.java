package com.toolshare.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.toolshare.ai.config.GeminiProperties;
import com.toolshare.ai.entity.AiMessage;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final String GEMINI_BASE_URL =
            "https://generativelanguage.googleapis.com";

    private static final String GEMINI_PATH =
            "/v1beta/models/{model}:generateContent";

    private static final String TOOLSHARE_SYSTEM_INSTRUCTION = """
            You are the AI assistant for the ToolShare platform.

            ToolShare is a platform where users can:
            - Find tools and equipment.
            - Rent tools from other users.
            - List their own tools for rental.
            - Book available tools.
            - Communicate with other users.
            - Get assistance finding suitable tools.

            When answering questions about ToolShare:
            - Give clear and useful answers.
            - Use only known ToolShare functionality.
            - Do not invent features, prices, users, tools, policies, or database information.
            - If you do not have enough information, clearly say that you do not have that information.
            - Keep answers relevant to the user's question.
            - Do not claim that you performed an action unless the system actually performed it.
            """;

    private final WebClient webClient;
    private final GeminiProperties properties;
    private final ObjectMapper objectMapper;

    public GeminiService(
            WebClient.Builder webClientBuilder,
            GeminiProperties properties,
            ObjectMapper objectMapper
    ) {
        this.webClient = webClientBuilder
                .baseUrl(GEMINI_BASE_URL)
                .build();

        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public String generateResponse(List<AiMessage> history) {

        List<Map<String, Object>> contents = new ArrayList<>();

        for (AiMessage message : history) {

            String role = message.getRole() == AiMessage.Role.USER
                    ? "user"
                    : "model";

            Map<String, Object> part = Map.of(
                    "text",
                    message.getContent()
            );

            Map<String, Object> content = new HashMap<>();

            content.put("role", role);
            content.put("parts", List.of(part));

            contents.add(content);
        }

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(
                                Map.of(
                                        "text",
                                        TOOLSHARE_SYSTEM_INSTRUCTION
                                )
                        )
                ),
                "contents", contents
        );

        String response = webClient
                .post()
                .uri(uriBuilder -> uriBuilder
                        .path(GEMINI_PATH)
                        .build(properties.model()))
                .header(
                        "x-goog-api-key",
                        properties.apiKey()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        clientResponse -> clientResponse
                                .bodyToMono(String.class)
                                .map(errorBody ->
                                        new IllegalStateException(
                                                "Gemini API error: "
                                                        + clientResponse.statusCode()
                                                        + " - "
                                                        + errorBody
                                        )
                                )
                )
                .bodyToMono(String.class)
                .block();

        return extractText(response);
    }

    private String extractText(String response) {

        try {
            JsonNode root = objectMapper.readTree(response);

            JsonNode textNode = root
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode()
                    || textNode.asText().isBlank()) {

                throw new IllegalStateException(
                        "Gemini returned an empty response: " + response
                );
            }

            return textNode.asText();

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Failed to parse Gemini response: " + response,
                    exception
            );
        }
    }
}