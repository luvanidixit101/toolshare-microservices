package com.toolshare.payment.service;

import com.toolshare.payment.dto.PaymentRequest;
import com.toolshare.payment.model.Payment;
import com.toolshare.payment.model.PaymentStatus;
import com.toolshare.payment.repository.PaymentRepository;
import com.toolshare.payment.security.CurrentUser;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PaymentServiceTest {

    private final PaymentRepository paymentRepository = mock(PaymentRepository.class);
    private final PaymentService service = new PaymentService(paymentRepository);

    @Test
    @SuppressWarnings("null")
    void createPaymentCreatesPendingPayment() {
        UUID userId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();

        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.createMockPayment(
                new PaymentRequest(bookingId, new BigDecimal("1500.00"), "INR"),
                new CurrentUser(userId, "renter@example.com", "Renter", "User", "USER")
        );

        assertThat(response.amount()).isEqualByComparingTo("1500.00");
        assertThat(response.currency()).isEqualTo("INR");
        assertThat(response.status()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    @SuppressWarnings("null")
    void confirmPaymentRequiresOwnerOrPayerAccess() {
        UUID bookingId = UUID.randomUUID();
        UUID payerId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();

        Payment payment = new Payment();
        payment.setId(paymentId);
        payment.setBookingId(bookingId);
        payment.setPayerId(payerId);
        payment.setOwnerId(ownerId);
        payment.setAmount(new BigDecimal("1500.00"));
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.PENDING);

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> service.confirmMockPayment(paymentId, new CurrentUser(otherUserId, "other@example.com", "Other", "User", "USER")))
                .hasMessageContaining("access");
    }
}
