package com.toolshare.booking_service.repository;

import com.toolshare.booking_service.entity.Booking;
import com.toolshare.booking_service.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBorrowerId(Long borrowerId);
    List<Booking> findByOwnerId(Long ownerId);
    List<Booking> findByToolId(Long toolId);
    List<Booking> findByToolIdAndStatus(Long toolId, BookingStatus status);
}
