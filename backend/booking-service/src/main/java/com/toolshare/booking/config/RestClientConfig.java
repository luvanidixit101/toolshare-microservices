package com.toolshare.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    RestClient toolRestClient(RestClient.Builder builder, @Value("${toolshare.services.tool-url}") String toolServiceUrl) {
        return builder.baseUrl(toolServiceUrl).build();
    }
}

