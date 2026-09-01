package com.toolshare.tool.repository;

import com.toolshare.tool.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByToolIdOrderByCreatedAtDesc(UUID toolId);
}
