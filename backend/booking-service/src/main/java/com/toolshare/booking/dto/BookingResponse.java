package com.toolshare.booking.dto;

import com.toolshare.booking.model.BookingStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID toolId,
        String toolName,
        String toolImage,
        UUID ownerId,
        String ownerName,
        UUID renterId,
        String renterName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalPrice,
        BigDecimal securityDeposit,
        BookingStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}

