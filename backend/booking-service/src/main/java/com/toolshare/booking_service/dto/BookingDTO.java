package com.toolshare.booking_service.dto;

import com.toolshare.booking_service.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {

    private Long id;

    @NotNull(message = "Tool ID is required")
    private Long toolId;

    @NotNull(message = "Borrower ID is required")
    private Long borrowerId;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Total price is required")
    @Positive(message = "Total price must be positive")
    private BigDecimal totalPrice;

    private BookingStatus status;
    private LocalDateTime createdAt;
}
