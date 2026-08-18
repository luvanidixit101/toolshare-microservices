package com.toolshare.booking.service;

import com.toolshare.booking.client.ToolClient;
import com.toolshare.booking.dto.CreateBookingRequest;
import com.toolshare.booking.dto.ToolDetails;
import com.toolshare.booking.event.NotificationPublisher;
import com.toolshare.booking.exception.ApiException;
import com.toolshare.booking.model.BookingStatus;
import com.toolshare.booking.repository.BookingRepository;
import com.toolshare.booking.security.CurrentUser;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BookingServiceTest {

    private final BookingRepository repository = mock(BookingRepository.class);
    private final ToolClient toolClient = mock(ToolClient.class);
    private final NotificationPublisher notificationPublisher = mock(NotificationPublisher.class);
    private final BookingService service = new BookingService(repository, toolClient, notificationPublisher);

    @Test
    void createRejectsConflictingBooking() {
        UUID toolId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID renterId = UUID.randomUUID();
        CreateBookingRequest request = new CreateBookingRequest(toolId, LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));
        when(toolClient.getTool(toolId, "Bearer token"))
                .thenReturn(new ToolDetails(toolId, ownerId, "Owner", "Drill", BigDecimal.TEN, BigDecimal.ONE, true, "ACTIVE", List.of()));
        when(repository.existsByToolIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                toolId,
                java.util.EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.ACTIVE),
                request.endDate(),
                request.startDate()
        )).thenReturn(true);

        assertThatThrownBy(() -> service.create(request, new CurrentUser(renterId, "renter@example.com", "Renter", "User", "USER"), "Bearer token"))
                .isInstanceOf(ApiException.class)
                .hasMessage("Tool is already booked for the selected dates");
    }
}

