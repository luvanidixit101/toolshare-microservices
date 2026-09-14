package com.toolshare.booking.repository;

import com.toolshare.booking.model.Booking;
import com.toolshare.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    @Query(value = "select pg_advisory_xact_lock(hashtextextended(cast(:toolId as text), 0))", nativeQuery = true)
    Object lockToolForBooking(@Param("toolId") UUID toolId);

    @Modifying
    @Query("update Booking b set b.status = com.toolshare.booking.model.BookingStatus.EXPIRED " +
            "where b.status = com.toolshare.booking.model.BookingStatus.PENDING and b.expiresAt < :now")
    int expirePendingBookings(@Param("now") Instant now);

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
