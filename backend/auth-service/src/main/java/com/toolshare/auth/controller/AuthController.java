package com.toolshare.auth.controller;

import com.toolshare.auth.dto.ApiResponse;
import com.toolshare.auth.dto.AuthResponse;
import com.toolshare.auth.dto.ForgotPasswordRequest;
import com.toolshare.auth.dto.LoginRequest;
import com.toolshare.auth.dto.RefreshTokenRequest;
import com.toolshare.auth.dto.RegisterRequest;
import com.toolshare.auth.dto.TokenValidationResponse;
import com.toolshare.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Authentication")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Registration successful", authService.register(request));
    }

    @Operation(summary = "Login and receive JWT tokens")
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }

    @Operation(summary = "Refresh JWT tokens")
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.ok("Token refreshed", authService.refresh(request));
    }

    @Operation(summary = "Start forgot-password flow")
    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.ok("If the email exists, password reset instructions will be sent");
    }

    @Operation(summary = "Invalidate client-side session")
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok("Logout successful");
    }

    @Operation(summary = "Validate current JWT")
    @GetMapping("/validate")
    public ApiResponse<TokenValidationResponse> validate(@AuthenticationPrincipal Jwt jwt) {
        TokenValidationResponse response = new TokenValidationResponse(
                true,
                UUID.fromString(jwt.getSubject()),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("role"),
                jwt.getExpiresAt()
        );
        return ApiResponse.ok("Token is valid", response);
    }
}

