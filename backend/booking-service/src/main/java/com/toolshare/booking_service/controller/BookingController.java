package com.toolshare.booking_service.controller;

import com.toolshare.booking_service.dto.BookingDTO;
import com.toolshare.booking_service.entity.BookingStatus;
import com.toolshare.booking_service.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingDTO dto) {
        BookingDTO created = bookingService.createBooking(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/borrower/{borrowerId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByBorrower(@PathVariable Long borrowerId) {
        return ResponseEntity.ok(bookingService.getBookingsByBorrower(borrowerId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(bookingService.getBookingsByOwner(ownerId));
    }

    @GetMapping("/tool/{toolId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByTool(@PathVariable Long toolId) {
        return ResponseEntity.ok(bookingService.getBookingsByTool(toolId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateStatus(id, status));
    }
}
