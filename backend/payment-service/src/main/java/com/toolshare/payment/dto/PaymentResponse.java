package com.toolshare.payment.dto;

import com.toolshare.payment.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID bookingId,
        UUID payerId,
        UUID ownerId,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        String transactionRef,
        Instant createdAt,
        Instant updatedAt
) {
}
