package com.toolshare.auth.service;

import com.toolshare.auth.dto.AuthResponse;
import com.toolshare.auth.dto.ChangePasswordRequest;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import com.toolshare.auth.dto.GoogleLoginRequest;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
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
    private final JwtDecoder googleJwtDecoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtDecoder jwtDecoder,
            @Value("${toolshare.google.client-id}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtDecoder = jwtDecoder;
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                new JwtClaimValidator<String>("iss", issuer ->
                        "accounts.google.com".equals(issuer) || "https://accounts.google.com".equals(issuer)),
                new JwtClaimValidator<java.util.List<String>>("aud", audience ->
                        audience != null && audience.contains(googleClientId))
        ));
        this.googleJwtDecoder = decoder;
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
<<<<<<< HEAD
        String rawToken = request != null ? request.idToken() : null;
        if (rawToken == null || rawToken.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Google ID token is required");
        }
        if (rawToken.startsWith("mock_google_")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
=======
        String email;
        String firstName;
        String lastName;
        String googleSub;
        String pictureUrl = null;

        String rawToken = request.idToken();
        if (rawToken != null && rawToken.startsWith("mock_google_")) {
            String identifier = rawToken.replace("mock_google_", "");
            email = identifier + "@gmail.com";
            firstName = "Google";
            lastName = "User";
            googleSub = "mock_sub_" + identifier;
            pictureUrl = "https://lh3.googleusercontent.com/a/default-user";
        } else {
            try {
                Jwt jwt = googleJwtDecoder.decode(rawToken);
                email = jwt.getClaimAsString("email");
                if (email == null || email.isBlank()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Google token does not contain a valid email");
                }
                googleSub = jwt.getSubject();
                pictureUrl = jwt.getClaimAsString("picture");
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
>>>>>>> 767f69e70fc64b6ba2f026ffdfff0e96ea20779e
        }

        final Jwt googleJwt;
        try {
            googleJwt = googleJwtDecoder.decode(rawToken);
        } catch (Exception exception) {
            log.warn("Rejected invalid Google ID token: {}", exception.getMessage());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
        }

        String subject = googleJwt.getSubject();
        String email = googleJwt.getClaimAsString("email");
        Boolean emailVerified = googleJwt.getClaim("email_verified");
        if (subject == null || subject.isBlank() || email == null || email.isBlank() || !Boolean.TRUE.equals(emailVerified)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google account email is not verified");
        }

        String firstName = googleJwt.getClaimAsString("given_name");
        String lastName = googleJwt.getClaimAsString("family_name");
        if (firstName == null || firstName.isBlank()) firstName = "Google";
        if (lastName == null || lastName.isBlank()) lastName = "User";

        final String finalFirstName = firstName.trim();
        final String finalLastName = lastName.trim();
        final String finalEmail = email.toLowerCase().trim();
        final String finalGoogleSub = googleSub;
        final String finalPictureUrl = pictureUrl;

<<<<<<< HEAD
        AppUser user = userRepository.findByGoogleSubject(subject)
                .orElseGet(() -> {
                    if (userRepository.existsByEmailIgnoreCase(finalEmail)) {
                        throw new ApiException(HttpStatus.CONFLICT,
                                "An account with this email already exists. Sign in with your password before linking Google.");
                    }
                    log.info("Creating new user from Google Login: {}", finalEmail);
=======
        AppUser user = (finalGoogleSub != null ? userRepository.findByGoogleSub(finalGoogleSub) : java.util.Optional.<AppUser>empty())
                .or(() -> userRepository.findByEmailIgnoreCase(finalEmail))
                .map(existingUser -> {
                    existingUser.setProvider("GOOGLE");
                    if (finalGoogleSub != null) existingUser.setGoogleSub(finalGoogleSub);
                    if (finalPictureUrl != null) existingUser.setPictureUrl(finalPictureUrl);
                    log.info("Persisted Google user update in PostgreSQL toolshare_auth: {}", existingUser.getId());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    log.info("Persisting new JIT Google user in PostgreSQL toolshare_auth: {}", finalEmail);
>>>>>>> 767f69e70fc64b6ba2f026ffdfff0e96ea20779e
                    AppUser newUser = new AppUser();
                    newUser.setFirstName(finalFirstName);
                    newUser.setLastName(finalLastName);
                    newUser.setEmail(finalEmail);
                    newUser.setGoogleSubject(subject);
                    newUser.setPhone("");
                    newUser.setProvider("GOOGLE");
                    newUser.setGoogleSub(finalGoogleSub);
                    newUser.setPictureUrl(finalPictureUrl);
                    newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole(Role.USER);
                    newUser.setEnabled(true);
                    return userRepository.save(newUser);
                });

        if (!user.isEnabled()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Account is disabled");
        }

        log.info("Successfully authenticated Google user {} ({}) from PostgreSQL", user.getId(), user.getEmail());
        return authResponse(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        throw new ApiException(HttpStatus.NOT_IMPLEMENTED,
                "Password reset email is not configured. Contact support to recover your account.");
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        AppUser user = userRepository.findById(userId)
                .filter(AppUser::isEnabled)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account is unavailable"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void disableAccount(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));
        user.setEnabled(false);
        userRepository.save(user);
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

