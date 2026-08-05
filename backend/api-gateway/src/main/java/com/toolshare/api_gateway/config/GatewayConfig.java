package com.toolshare.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.util.Arrays;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

@Configuration
public class GatewayConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(Arrays.asList("*"));
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsFilter(source);
    }

    @Bean
    public RouterFunction<ServerResponse> authServiceRoute() {
        return route("auth-service")
                .route(path("/api/auth/**"), http())
                .filter(lb("AUTH-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> userServiceRoute() {
        return route("user-service")
                .route(path("/api/users/**"), http())
                .filter(lb("USER-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> toolServiceRoute() {
        return route("tool-service")
                .route(path("/api/tools/**"), http())
                .filter(lb("TOOL-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> bookingServiceRoute() {
        return route("booking-service")
                .route(path("/api/bookings/**"), http())
                .filter(lb("BOOKING-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> reviewServiceRoute() {
        return route("review-service")
                .route(path("/api/reviews/**"), http())
                .filter(lb("REVIEW-SERVICE"))
                .build();
    }
}
