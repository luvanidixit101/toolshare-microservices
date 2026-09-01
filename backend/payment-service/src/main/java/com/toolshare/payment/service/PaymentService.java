package com.toolshare.payment.service;

import com.toolshare.payment.dto.PaymentRequest;
import com.toolshare.payment.dto.PaymentResponse;
import com.toolshare.payment.exception.ApiException;
import com.toolshare.payment.model.Payment;
import com.toolshare.payment.model.PaymentStatus;
import com.toolshare.payment.repository.PaymentRepository;
import com.toolshare.payment.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public PaymentResponse createMockPayment(PaymentRequest request, CurrentUser currentUser) {
        Payment payment = new Payment();
        payment.setBookingId(request.bookingId());
        payment.setPayerId(currentUser.id());
        payment.setOwnerId(UUID.randomUUID());
        payment.setAmount(request.amount());
        payment.setCurrency(request.currency().toUpperCase());
        payment.setStatus(PaymentStatus.PENDING);

        return toResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> myPayments(CurrentUser currentUser) {
        return paymentRepository.findByPayerIdOrOwnerIdOrderByCreatedAtDesc(currentUser.id(), currentUser.id())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public PaymentResponse getPayment(UUID paymentId, CurrentUser currentUser) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (!payment.getPayerId().equals(currentUser.id()) && !payment.getOwnerId().equals(currentUser.id()) && !currentUser.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment");
        }

        return toResponse(payment);
    }

    @Transactional
    @SuppressWarnings("null")
    public PaymentResponse confirmMockPayment(UUID paymentId, CurrentUser currentUser) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (!payment.getPayerId().equals(currentUser.id()) && !payment.getOwnerId().equals(currentUser.id()) && !currentUser.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment");
        }

        if (payment.getStatus() == PaymentStatus.TEST_SUCCESS) {
            return toResponse(payment);
        }

        payment.setStatus(PaymentStatus.TEST_SUCCESS);
        payment.setTransactionRef("MOCK_TXN_" + System.currentTimeMillis());
        return toResponse(paymentRepository.save(payment));
    }

    @Transactional
    @SuppressWarnings("null")
    public PaymentResponse failMockPayment(UUID paymentId, CurrentUser currentUser) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (!payment.getPayerId().equals(currentUser.id()) && !payment.getOwnerId().equals(currentUser.id()) && !currentUser.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment");
        }

        payment.setStatus(PaymentStatus.FAILED);
        return toResponse(paymentRepository.save(payment));
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBookingId(),
                payment.getPayerId(),
                payment.getOwnerId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getTransactionRef(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}
