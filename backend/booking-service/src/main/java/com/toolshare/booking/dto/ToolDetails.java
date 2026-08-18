package com.toolshare.booking.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ToolDetails(
        UUID id,
        UUID ownerId,
        String ownerName,
        String name,
        BigDecimal pricePerDay,
        BigDecimal securityDeposit,
        boolean available,
        String status,
        List<String> images
) {
    public String firstImage() {
        return images == null || images.isEmpty() ? null : images.getFirst();
    }
}

