package com.toolshare.tool.dto;

import com.toolshare.tool.model.ToolCondition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ToolRequest(
        @NotBlank @Size(max = 140) String name,
        @NotBlank @Size(max = 80) String category,
        @NotBlank @Size(max = 3000) String description,
        @NotNull ToolCondition condition,
        @NotNull @DecimalMin("0.00") BigDecimal pricePerDay,
        @NotNull @DecimalMin("0.00") BigDecimal securityDeposit,
        @NotBlank @Size(max = 160) String location,
        Double latitude,
        Double longitude,
        Boolean available,
        Map<String, String> specifications,
        List<String> images
) {
}

