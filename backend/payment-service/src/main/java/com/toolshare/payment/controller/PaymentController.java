package com.toolshare.payment.controller;

import com.toolshare.payment.dto.ApiResponse;
import com.toolshare.payment.dto.PaymentRequest;
import com.toolshare.payment.dto.PaymentResponse;
import com.toolshare.payment.security.CurrentUser;
import com.toolshare.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Payments")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @Operation(summary = "Create test payment")
    @PostMapping("/create")
    public ApiResponse<PaymentResponse> createPayment(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PaymentRequest request) {
        return ApiResponse.ok("Payment created", service.createMockPayment(request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "List payer and owner payments")
    @GetMapping
    public ApiResponse<List<PaymentResponse>> myPayments(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Payments loaded", service.myPayments(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get payment by ID")
    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPayment(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Payment loaded", service.getPayment(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Mock payment success")
    @PatchMapping("/{id}/mock-success")
    public ApiResponse<PaymentResponse> confirmMockPayment(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Payment successful", service.confirmMockPayment(id, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Mock payment failure")
    @PatchMapping("/{id}/mock-failure")
    public ApiResponse<PaymentResponse> failMockPayment(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Payment failed", service.failMockPayment(id, CurrentUser.from(jwt)));
    }
}
