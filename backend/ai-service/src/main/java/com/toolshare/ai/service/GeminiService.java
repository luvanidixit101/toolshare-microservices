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

            ToolShare is a peer-to-peer tool sharing and rental platform where users list and rent tools.
            
            Platform Tool Listings and Rental Rates:
            - Hammer: Listed at ₹30 / day (Security Deposit: ₹50).
            - DeWalt 20V MAX Cordless Drill: Listed at ₹25 / day (Security Deposit: ₹80).
            - Makita Circular Saw 7-1/4": Listed at ₹30 / day (Security Deposit: ₹100).
            - Stihl MS 170 Chainsaw: Listed at ₹35 / day (Security Deposit: ₹120).
            - Bosch Laser Distance Measure: Listed at ₹15 / day (Security Deposit: ₹50).

            CRITICAL DIRECT INSTRUCTION FOR "HAMMER PRICE" OR TOOL COST QUERIES:
            - If the user asks "what is hammer price" or asks for tool prices, they are asking for the rental cost of the Hammer tool on ToolShare!
            - Do NOT discuss auctions, bidding, or auction terminology.
            - Answer DIRECTLY: "The Hammer on ToolShare is available for rent at ₹30 / day (Security Deposit: ₹50)."
            - For any tool inquiry, state the daily rental rate directly and concisely!
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

    @SuppressWarnings("null")
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