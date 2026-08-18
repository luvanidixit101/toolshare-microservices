package com.toolshare.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI gatewayOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ToolShare API Gateway")
                        .version("0.0.1")
                        .description("Gateway routes for the ToolShare microservices. Use downstream service Swagger pages for operation-level schemas."))
                .servers(List.of(new Server().url("http://localhost:8080").description("Local API Gateway")));
    }
}

