package com.toolshare.review_service.controller;

import com.toolshare.review_service.dto.ReviewDTO;
import com.toolshare.review_service.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@Valid @RequestBody ReviewDTO dto) {
        ReviewDTO created = reviewService.createReview(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/tool/{toolId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByTool(@PathVariable Long toolId) {
        return ResponseEntity.ok(reviewService.getReviewsByTool(toolId));
    }

    @GetMapping("/tool/{toolId}/rating")
    public ResponseEntity<Map<String, Object>> getToolAverageRating(@PathVariable Long toolId) {
        Double avgRating = reviewService.getToolAverageRating(toolId);
        return ResponseEntity.ok(Map.of(
                "toolId", toolId,
                "averageRating", avgRating
        ));
    }

    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByReviewer(@PathVariable Long reviewerId) {
        return ResponseEntity.ok(reviewService.getReviewsByReviewer(reviewerId));
    }
}
