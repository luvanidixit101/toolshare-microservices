package com.toolshare.payment.repository;

import com.toolshare.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByPayerIdOrOwnerIdOrderByCreatedAtDesc(UUID payerId, UUID ownerId);
}
