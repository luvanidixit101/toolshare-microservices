package com.toolshare.tool_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price per day is required")
    @Positive(message = "Price must be positive")
    private BigDecimal pricePerDay;

    private BigDecimal depositAmount;
    private String location;
    private String imageUrl;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    private Boolean isAvailable;
    private LocalDateTime createdAt;
}
