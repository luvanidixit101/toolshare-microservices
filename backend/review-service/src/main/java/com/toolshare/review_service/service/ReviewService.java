package com.toolshare.review_service.service;

import com.toolshare.review_service.dto.ReviewDTO;
import com.toolshare.review_service.entity.Review;
import com.toolshare.review_service.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository repository;

    public ReviewService(ReviewRepository repository) {
        this.repository = repository;
    }

    public ReviewDTO createReview(ReviewDTO dto) {
        Review review = Review.builder()
                .toolId(dto.getToolId())
                .reviewerId(dto.getReviewerId())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        Review saved = repository.save(review);
        return mapToDTO(saved);
    }

    public List<ReviewDTO> getReviewsByTool(Long toolId) {
        return repository.findByToolId(toolId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Double getAverageRatingByTool(Long toolId) {
        Double avg = repository.findAverageRatingByToolId(toolId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public List<ReviewDTO> getReviewsByReviewer(Long reviewerId) {
        return repository.findByReviewerId(reviewerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .toolId(review.getToolId())
                .reviewerId(review.getReviewerId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
