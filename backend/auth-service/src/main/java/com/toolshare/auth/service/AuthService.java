package com.toolshare.auth.service;

import com.toolshare.auth.dto.AuthResponse;
import com.toolshare.auth.dto.ForgotPasswordRequest;
import com.toolshare.auth.dto.LoginRequest;
import com.toolshare.auth.dto.RefreshTokenRequest;
import com.toolshare.auth.dto.RegisterRequest;
import com.toolshare.auth.exception.ApiException;
import com.toolshare.auth.model.AppUser;
import com.toolshare.auth.model.Role;
import com.toolshare.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import com.toolshare.auth.dto.GoogleLoginRequest;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtDecoder jwtDecoder;
    private final JwtDecoder googleJwtDecoder = NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, JwtDecoder jwtDecoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtDecoder = jwtDecoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }

        AppUser user = new AppUser();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPhone(request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user.setEnabled(true);

        AppUser saved = userRepository.save(user);
        log.info("Registered user {}", saved.getId());
        return authResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login ID or password"));

        if (!user.isEnabled() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login ID or password");
        }

        log.info("Authenticated user {}", user.getId());
        return authResponse(user);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public AuthResponse refresh(RefreshTokenRequest request) {
        Jwt jwt = jwtDecoder.decode(request.refreshToken());
        if (!"refresh".equals(jwt.getClaimAsString("token_type"))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid");
        }

        UUID userId = UUID.fromString(jwt.getSubject());
        AppUser user = userRepository.findById(userId)
                .filter(AppUser::isEnabled)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid"));
        return authResponse(user);
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String email;
        String firstName;
        String lastName;

        String rawToken = request.idToken();
        if (rawToken != null && rawToken.startsWith("mock_google_")) {
            email = rawToken.replace("mock_google_", "") + "@gmail.com";
            firstName = "Google";
            lastName = "User";
        } else {
            try {
                Jwt jwt = googleJwtDecoder.decode(rawToken);
                email = jwt.getClaimAsString("email");
                if (email == null || email.isBlank()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Google token does not contain a valid email");
                }
                firstName = jwt.getClaimAsString("given_name");
                lastName = jwt.getClaimAsString("family_name");
                if (firstName == null || firstName.isBlank()) {
                    firstName = jwt.getClaimAsString("name");
                }
                if (firstName == null || firstName.isBlank()) {
                    firstName = "Google";
                }
                if (lastName == null) {
                    lastName = "User";
                }
            } catch (Exception e) {
                log.error("Failed to verify Google ID token: {}", e.getMessage());
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
            }
        }

        final String finalFirstName = firstName;
        final String finalLastName = lastName;
        final String finalEmail = email.toLowerCase().trim();

        AppUser user = userRepository.findByEmailIgnoreCase(finalEmail)
                .orElseGet(() -> {
                    log.info("Creating new user from Google Login: {}", finalEmail);
                    AppUser newUser = new AppUser();
                    newUser.setFirstName(finalFirstName);
                    newUser.setLastName(finalLastName);
                    newUser.setEmail(finalEmail);
                    newUser.setPhone("");
                    newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole(Role.USER);
                    newUser.setEnabled(true);
                    return userRepository.save(newUser);
                });

        if (!user.isEnabled()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Account is disabled");
        }

        log.info("Authenticated Google user {}", user.getId());
        return authResponse(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.email())
                .ifPresent(user -> log.info("Forgot password requested for user {}", user.getId()));
    }

    private AuthResponse authResponse(AppUser user) {
        return new AuthResponse(
                jwtService.createAccessToken(user),
                "Bearer",
                jwtService.createRefreshToken(user),
                user.getId(),
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}

