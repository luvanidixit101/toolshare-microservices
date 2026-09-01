package com.toolshare.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentRequest(
        @NotNull UUID bookingId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String currency
) {
}
