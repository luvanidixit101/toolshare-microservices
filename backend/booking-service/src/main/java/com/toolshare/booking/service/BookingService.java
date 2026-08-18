package com.toolshare.booking.service;

import com.toolshare.booking.client.ToolClient;
import com.toolshare.booking.dto.BookingResponse;
import com.toolshare.booking.dto.CreateBookingRequest;
import com.toolshare.booking.dto.ToolDetails;
import com.toolshare.booking.dto.UpdateBookingStatusRequest;
import com.toolshare.booking.event.NotificationEvent;
import com.toolshare.booking.event.NotificationPublisher;
import com.toolshare.booking.exception.ApiException;
import com.toolshare.booking.model.Booking;
import com.toolshare.booking.model.BookingStatus;
import com.toolshare.booking.repository.BookingRepository;
import com.toolshare.booking.security.CurrentUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private static final EnumSet<BookingStatus> CONFLICTING_STATUSES = EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.ACTIVE);

    private final BookingRepository repository;
    private final ToolClient toolClient;
    private final NotificationPublisher notificationPublisher;

    public BookingService(BookingRepository repository, ToolClient toolClient, NotificationPublisher notificationPublisher) {
        this.repository = repository;
        this.toolClient = toolClient;
        this.notificationPublisher = notificationPublisher;
    }

    @Transactional
    public BookingResponse create(CreateBookingRequest request, CurrentUser currentUser, String bearerToken) {
        validateDates(request);
        ToolDetails tool = toolClient.getTool(request.toolId(), bearerToken);
        validateToolIsBookable(tool, currentUser);
        validateNoConflict(request);

        long days = ChronoUnit.DAYS.between(request.startDate(), request.endDate());
        BigDecimal totalPrice = tool.pricePerDay().multiply(BigDecimal.valueOf(days));

        Booking booking = new Booking();
        booking.setToolId(tool.id());
        booking.setToolName(tool.name());
        booking.setToolImage(tool.firstImage());
        booking.setOwnerId(tool.ownerId());
        booking.setOwnerName(tool.ownerName() == null ? "Tool owner" : tool.ownerName());
        booking.setRenterId(currentUser.id());
        booking.setRenterName(currentUser.displayName().isBlank() ? currentUser.email() : currentUser.displayName());
        booking.setStartDate(request.startDate());
        booking.setEndDate(request.endDate());
        booking.setTotalPrice(totalPrice);
        booking.setSecurityDeposit(tool.securityDeposit());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = repository.save(booking);
        notificationPublisher.publish(NotificationEvent.booking("BOOKING_CREATED", currentUser.id(), saved.getOwnerId(), saved.getId()));
        log.info("Created booking {} for tool {}", saved.getId(), saved.getToolId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> list(CurrentUser currentUser) {
        List<Booking> bookings = currentUser.isAdmin()
                ? repository.findAll()
                : repository.findByRenterIdOrOwnerIdOrderByCreatedAtDesc(currentUser.id(), currentUser.id());
        return bookings.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse get(UUID id, CurrentUser currentUser) {
        Booking booking = find(id);
        requireParticipantOrAdmin(booking, currentUser);
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> myBookings(CurrentUser currentUser) {
        return repository.findByRenterIdOrderByCreatedAtDesc(currentUser.id()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> ownerBookings(CurrentUser currentUser) {
        return repository.findByOwnerIdOrderByCreatedAtDesc(currentUser.id()).stream().map(this::toResponse).toList();
    }

    @Transactional
    public BookingResponse approve(UUID id, CurrentUser currentUser) {
        Booking booking = find(id);
        requireOwnerOrAdmin(booking, currentUser);
        requireStatus(booking, BookingStatus.PENDING);
        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = repository.save(booking);
        notificationPublisher.publish(NotificationEvent.booking("BOOKING_APPROVED", currentUser.id(), saved.getRenterId(), saved.getId()));
        return toResponse(saved);
    }

    @Transactional
    public BookingResponse reject(UUID id, CurrentUser currentUser) {
        Booking booking = find(id);
        requireOwnerOrAdmin(booking, currentUser);
        requireStatus(booking, BookingStatus.PENDING);
        booking.setStatus(BookingStatus.REJECTED);
        Booking saved = repository.save(booking);
        notificationPublisher.publish(NotificationEvent.booking("BOOKING_REJECTED", currentUser.id(), saved.getRenterId(), saved.getId()));
        return toResponse(saved);
    }

    @Transactional
    public BookingResponse cancel(UUID id, CurrentUser currentUser) {
        Booking booking = find(id);
        requireParticipantOrAdmin(booking, currentUser);
        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking cannot be cancelled from status " + booking.getStatus());
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = repository.save(booking);
        UUID recipient = currentUser.id().equals(saved.getRenterId()) ? saved.getOwnerId() : saved.getRenterId();
        notificationPublisher.publish(NotificationEvent.booking("BOOKING_CANCELLED", currentUser.id(), recipient, saved.getId()));
        return toResponse(saved);
    }

    @Transactional
    public BookingResponse complete(UUID id, CurrentUser currentUser) {
        Booking booking = find(id);
        requireOwnerOrAdmin(booking, currentUser);
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.ACTIVE) {
            throw new ApiException(HttpStatus.CONFLICT, "Only approved or active bookings can be completed");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        Booking saved = repository.save(booking);
        notificationPublisher.publish(NotificationEvent.booking("BOOKING_COMPLETED", currentUser.id(), saved.getRenterId(), saved.getId()));
        return toResponse(saved);
    }

    @Transactional
    public BookingResponse updateStatus(UUID id, UpdateBookingStatusRequest request, CurrentUser currentUser) {
        return switch (request.status()) {
            case APPROVED -> approve(id, currentUser);
            case REJECTED -> reject(id, currentUser);
            case CANCELLED -> cancel(id, currentUser);
            case COMPLETED -> complete(id, currentUser);
            case ACTIVE -> setActive(id, currentUser);
            case PENDING -> throw new ApiException(HttpStatus.CONFLICT, "Booking cannot be moved back to PENDING");
        };
    }

    @Transactional
    public BookingResponse setActive(UUID id, CurrentUser currentUser) {
        Booking booking = find(id);
        requireOwnerOrAdmin(booking, currentUser);
        requireStatus(booking, BookingStatus.APPROVED);
        booking.setStatus(BookingStatus.ACTIVE);
        return toResponse(repository.save(booking));
    }

    private void validateDates(CreateBookingRequest request) {
        if (!request.endDate().isAfter(request.startDate())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "End date must be after start date");
        }
    }

    private void validateToolIsBookable(ToolDetails tool, CurrentUser currentUser) {
        if (tool.ownerId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.CONFLICT, "Users cannot book their own tool");
        }
        if (!tool.available() || !"ACTIVE".equals(tool.status())) {
            throw new ApiException(HttpStatus.CONFLICT, "Tool is not available for booking");
        }
    }

    private void validateNoConflict(CreateBookingRequest request) {
        boolean conflict = repository.existsByToolIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                request.toolId(),
                CONFLICTING_STATUSES,
                request.endDate(),
                request.startDate()
        );
        if (conflict) {
            throw new ApiException(HttpStatus.CONFLICT, "Tool is already booked for the selected dates");
        }
    }

    private Booking find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private void requireParticipantOrAdmin(Booking booking, CurrentUser currentUser) {
        if (!currentUser.isAdmin() && !booking.getRenterId().equals(currentUser.id()) && !booking.getOwnerId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this booking");
        }
    }

    private void requireOwnerOrAdmin(Booking booking, CurrentUser currentUser) {
        if (!currentUser.isAdmin() && !booking.getOwnerId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the owner or an admin can update this booking");
        }
    }

    private void requireStatus(Booking booking, BookingStatus expected) {
        if (booking.getStatus() != expected) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking must be " + expected + " before this action");
        }
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getToolId(),
                booking.getToolName(),
                booking.getToolImage(),
                booking.getOwnerId(),
                booking.getOwnerName(),
                booking.getRenterId(),
                booking.getRenterName(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getTotalPrice(),
                booking.getSecurityDeposit(),
                booking.getStatus(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}

