package com.toolshare.review_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {

    private Long id;

    @NotNull(message = "Tool ID is required")
    private Long toolId;

    @NotNull(message = "Reviewer ID is required")
    private Long reviewerId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;

    private String comment;
    private LocalDateTime createdAt;
}
