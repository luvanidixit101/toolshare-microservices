package com.toolshare.review_service.repository;

import com.toolshare.review_service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByToolId(Long toolId);
    List<Review> findByReviewerId(Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.toolId = :toolId")
    Double findAverageRatingByToolId(Long toolId);
}
