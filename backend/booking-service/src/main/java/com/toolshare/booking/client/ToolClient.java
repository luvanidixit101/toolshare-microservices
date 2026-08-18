package com.toolshare.booking.client;

import com.toolshare.booking.dto.ApiResponse;
import com.toolshare.booking.dto.ToolDetails;
import com.toolshare.booking.exception.ApiException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

@Component
public class ToolClient {

    private final RestClient toolRestClient;

    public ToolClient(RestClient toolRestClient) {
        this.toolRestClient = toolRestClient;
    }

    public ToolDetails getTool(UUID toolId, String bearerToken) {
        try {
            ApiResponse<ToolDetails> response = toolRestClient.get()
                    .uri("/api/tools/{id}", toolId)
                    .headers(headers -> {
                        if (bearerToken != null && !bearerToken.isBlank()) {
                            headers.set(HttpHeaders.AUTHORIZATION, bearerToken);
                        }
                    })
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null || response.data() == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Tool Service returned an empty response");
            }
            return response.data();
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Tool not found");
            }
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Tool Service is unavailable");
        }
    }
}

