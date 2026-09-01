package com.toolshare.payment.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public record CurrentUser(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String role
) {
    public static CurrentUser from(Jwt jwt) {
        return new CurrentUser(
                UUID.fromString(jwt.getSubject()),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("firstName"),
                jwt.getClaimAsString("lastName"),
                jwt.getClaimAsString("role")
        );
    }

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public String displayName() {
        return ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
    }
}
