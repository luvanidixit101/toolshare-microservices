package com.toolshare.booking.controller;

import com.toolshare.booking.dto.ApiResponse;
import com.toolshare.booking.dto.BookingResponse;
import com.toolshare.booking.dto.CreateBookingRequest;
import com.toolshare.booking.dto.UpdateBookingStatusRequest;
import com.toolshare.booking.security.CurrentUser;
import com.toolshare.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Bookings")
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @Operation(summary = "Create booking request")
    @PostMapping
    public ApiResponse<BookingResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String bearerToken,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return ApiResponse.ok("Booking created", service.create(request, CurrentUser.from(jwt), bearerToken));
    }

    @Operation(summary = "List visible bookings")
    @GetMapping
    public ApiResponse<List<BookingResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Bookings loaded", service.list(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get booking by ID")
    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> get(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Booking loaded", service.get(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get bookings made by current user")
    @GetMapping("/my-bookings")
    public ApiResponse<List<BookingResponse>> myBookings(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Bookings loaded", service.myBookings(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get bookings for tools owned by current user")
    @GetMapping("/owner")
    public ApiResponse<List<BookingResponse>> ownerBookings(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Bookings loaded", service.ownerBookings(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Approve booking")
    @PatchMapping("/{id}/approve")
    public ApiResponse<BookingResponse> approve(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Booking approved", service.approve(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Reject booking")
    @PatchMapping("/{id}/reject")
    public ApiResponse<BookingResponse> reject(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Booking rejected", service.reject(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Cancel booking")
    @PatchMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancel(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Booking cancelled", service.cancel(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Complete booking")
    @PatchMapping("/{id}/complete")
    public ApiResponse<BookingResponse> complete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Booking completed", service.complete(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Cancel booking compatibility route")
    @PutMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancelCompat(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return cancel(id, jwt);
    }

    @Operation(summary = "Update booking status compatibility route")
    @PutMapping("/{id}/status")
    public ApiResponse<BookingResponse> updateStatus(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateBookingStatusRequest request) {
        return ApiResponse.ok("Booking status updated", service.updateStatus(id, request, CurrentUser.from(jwt)));
    }
}

