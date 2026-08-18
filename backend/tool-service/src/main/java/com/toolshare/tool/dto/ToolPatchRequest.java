package com.toolshare.tool.dto;

import com.toolshare.tool.model.ToolCondition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ToolPatchRequest(
        @Size(max = 140) String name,
        @Size(max = 80) String category,
        @Size(max = 3000) String description,
        ToolCondition condition,
        @DecimalMin("0.00") BigDecimal pricePerDay,
        @DecimalMin("0.00") BigDecimal securityDeposit,
        @Size(max = 160) String location,
        Double latitude,
        Double longitude,
        Boolean available,
        Map<String, String> specifications,
        List<String> images
) {
}

