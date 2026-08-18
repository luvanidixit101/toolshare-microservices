package com.toolshare.tool.dto;

import com.toolshare.tool.model.ToolCondition;
import com.toolshare.tool.model.ToolStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ToolResponse(
        UUID id,
        UUID ownerId,
        String ownerName,
        BigDecimal ownerRating,
        String name,
        String category,
        String description,
        ToolCondition condition,
        BigDecimal pricePerDay,
        BigDecimal securityDeposit,
        String location,
        Double latitude,
        Double longitude,
        boolean available,
        ToolStatus status,
        Map<String, String> specifications,
        List<String> images,
        BigDecimal rating,
        int reviewCount,
        long views,
        Instant createdAt,
        Instant updatedAt
) {
}

