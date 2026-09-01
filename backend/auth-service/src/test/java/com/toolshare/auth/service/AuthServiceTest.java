package com.toolshare.auth.service;

import com.toolshare.auth.dto.LoginRequest;
import com.toolshare.auth.dto.RegisterRequest;
import com.toolshare.auth.exception.ApiException;
import com.toolshare.auth.model.AppUser;
import com.toolshare.auth.model.Role;
import com.toolshare.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final JwtDecoder jwtDecoder = mock(JwtDecoder.class);
    private final AuthService authService = new AuthService(userRepository, passwordEncoder, jwtService, jwtDecoder);

    @Test
    void registerHashesPasswordAndReturnsTokens() {
        when(userRepository.existsByEmailIgnoreCase("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(jwtService.createAccessToken(any(AppUser.class))).thenReturn("access");
        when(jwtService.createRefreshToken(any(AppUser.class))).thenReturn("refresh");

        var response = authService.register(new RegisterRequest("Alex", "Morgan", "alex@example.com", "+911234567890", "password123"));

        assertThat(response.token()).isEqualTo("access");
        assertThat(response.refreshToken()).isEqualTo("refresh");
        assertThat(response.role()).isEqualTo(Role.USER);
    }

    @Test
    void loginRejectsInvalidPassword() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setEmail("alex@example.com");
        user.setPasswordHash("hashed");
        user.setEnabled(true);

        when(userRepository.findByEmailIgnoreCase("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("alex@example.com", "bad")))
                .isInstanceOf(ApiException.class)
                .hasMessage("Invalid login ID or password");
    }

    @Test
    void googleLoginCreatesNewUserIfNotFound() {
        when(userRepository.findByEmailIgnoreCase("gtest@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(jwtService.createAccessToken(any(AppUser.class))).thenReturn("access-token");
        when(jwtService.createRefreshToken(any(AppUser.class))).thenReturn("refresh-token");

        var response = authService.googleLogin(new com.toolshare.auth.dto.GoogleLoginRequest("mock_google_gtest"));

        assertThat(response.token()).isEqualTo("access-token");
        assertThat(response.email()).isEqualTo("gtest@gmail.com");
    }

    @Test
    void googleLoginAuthenticatesExistingUser() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setEmail("existing@gmail.com");
        user.setFirstName("Existing");
        user.setLastName("User");
        user.setRole(Role.USER);
        user.setEnabled(true);

        when(userRepository.findByEmailIgnoreCase("existing@gmail.com")).thenReturn(Optional.of(user));
        when(jwtService.createAccessToken(any(AppUser.class))).thenReturn("access-token");
        when(jwtService.createRefreshToken(any(AppUser.class))).thenReturn("refresh-token");

        var response = authService.googleLogin(new com.toolshare.auth.dto.GoogleLoginRequest("mock_google_existing"));

        assertThat(response.token()).isEqualTo("access-token");
        assertThat(response.email()).isEqualTo("existing@gmail.com");
    }
}


