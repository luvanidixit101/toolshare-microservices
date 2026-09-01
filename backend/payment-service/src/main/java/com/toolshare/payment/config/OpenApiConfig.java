package com.toolshare.payment.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "ToolShare Payment API",
                version = "1.0",
                description = "Mock payment APIs for test currency flows"
        )
)
public class OpenApiConfig {
}
