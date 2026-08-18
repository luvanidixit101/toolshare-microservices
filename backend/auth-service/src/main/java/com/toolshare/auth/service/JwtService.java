package com.toolshare.auth.service;

import com.toolshare.auth.model.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final long accessTokenMinutes;
    private final long refreshTokenDays;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${toolshare.security.access-token-minutes}") long accessTokenMinutes,
            @Value("${toolshare.security.refresh-token-days}") long refreshTokenDays
    ) {
        this.jwtEncoder = jwtEncoder;
        this.accessTokenMinutes = accessTokenMinutes;
        this.refreshTokenDays = refreshTokenDays;
    }

    public String createAccessToken(AppUser user) {
        return encode(user, "access", Instant.now().plus(accessTokenMinutes, ChronoUnit.MINUTES));
    }

    public String createRefreshToken(AppUser user) {
        return encode(user, "refresh", Instant.now().plus(refreshTokenDays, ChronoUnit.DAYS));
    }

    private String encode(AppUser user, String tokenType, Instant expiresAt) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("toolshare-auth-service")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("token_type", tokenType)
                .claim("email", user.getEmail())
                .claim("firstName", user.getFirstName())
                .claim("lastName", user.getLastName())
                .claim("role", user.getRole().name())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }
}

