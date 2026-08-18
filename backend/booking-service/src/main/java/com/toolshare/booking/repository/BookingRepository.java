package com.toolshare.booking.repository;

import com.toolshare.booking.model.Booking;
import com.toolshare.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByRenterIdOrOwnerIdOrderByCreatedAtDesc(UUID renterId, UUID ownerId);

    List<Booking> findByRenterIdOrderByCreatedAtDesc(UUID renterId);

    List<Booking> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    boolean existsByToolIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID toolId,
            Collection<BookingStatus> statuses,
            LocalDate endDate,
            LocalDate startDate
    );
}

