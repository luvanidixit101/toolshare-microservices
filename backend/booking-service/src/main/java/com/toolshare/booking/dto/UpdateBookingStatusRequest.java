package com.toolshare.booking.dto;

import com.toolshare.booking.model.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingStatusRequest(@NotNull BookingStatus status) {
}

