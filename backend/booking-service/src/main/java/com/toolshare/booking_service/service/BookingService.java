package com.toolshare.booking_service.service;

import com.toolshare.booking_service.dto.BookingDTO;
import com.toolshare.booking_service.entity.Booking;
import com.toolshare.booking_service.entity.BookingStatus;
import com.toolshare.booking_service.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository repository;

    public BookingService(BookingRepository repository) {
        this.repository = repository;
    }

    public BookingDTO createBooking(BookingDTO dto) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        Booking booking = Booking.builder()
                .toolId(dto.getToolId())
                .borrowerId(dto.getBorrowerId())
                .ownerId(dto.getOwnerId())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .totalPrice(dto.getTotalPrice())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = repository.save(booking);
        return mapToDTO(saved);
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return mapToDTO(booking);
    }

    public List<BookingDTO> getBookingsByBorrower(Long borrowerId) {
        return repository.findByBorrowerId(borrowerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByOwner(Long ownerId) {
        return repository.findByOwnerId(ownerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByTool(Long toolId) {
        return repository.findByToolId(toolId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        booking.setStatus(status);
        Booking updated = repository.save(booking);
        return mapToDTO(updated);
    }

    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .toolId(booking.getToolId())
                .borrowerId(booking.getBorrowerId())
                .ownerId(booking.getOwnerId())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
