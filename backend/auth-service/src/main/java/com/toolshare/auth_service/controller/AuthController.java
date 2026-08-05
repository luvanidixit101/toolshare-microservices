package com.toolshare.auth_service.controller;

import com.toolshare.auth_service.dto.AuthResponse;
import com.toolshare.auth_service.dto.LoginRequest;
import com.toolshare.auth_service.dto.RegisterRequest;
import com.toolshare.auth_service.dto.UserDTO;
import com.toolshare.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/user")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(authService.getUserByEmail(email));
    }
}
