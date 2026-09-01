package com.toolshare.tool.controller;

import com.toolshare.tool.dto.ApiResponse;
import com.toolshare.tool.dto.CreateReviewRequest;
import com.toolshare.tool.dto.PagedResponse;
import com.toolshare.tool.dto.ReviewResponse;
import com.toolshare.tool.dto.ToolPatchRequest;
import com.toolshare.tool.dto.ToolRequest;
import com.toolshare.tool.dto.ToolResponse;
import com.toolshare.tool.dto.ToolStatusRequest;
import com.toolshare.tool.security.CurrentUser;
import com.toolshare.tool.service.ToolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Tag(name = "Tools")
@RestController
@RequestMapping("/api/tools")
public class ToolController {

    private final ToolService service;

    public ToolController(ToolService service) {
        this.service = service;
    }

    @Operation(summary = "Browse, search, and filter tools")
    @GetMapping
    public PagedResponse<ToolResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal rating,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort
    ) {
        return service.search(keyword, search, category, location, minPrice, maxPrice, rating, minRating, available, availableOnly, page, size, sort);
    }

    @Operation(summary = "Search tools")
    @GetMapping("/search")
    public PagedResponse<ToolResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal rating,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort
    ) {
        return service.search(keyword, search, category, location, minPrice, maxPrice, rating, minRating, available, availableOnly, page, size, sort);
    }

    @Operation(summary = "Get distinct categories")
    @GetMapping("/categories")
    public ApiResponse<List<String>> categories() {
        return ApiResponse.ok("Categories loaded", service.categories());
    }

    @Operation(summary = "Get current user's tools")
    @GetMapping({"/my-tools", "/my"})
    public ApiResponse<List<ToolResponse>> myTools(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Tools loaded", service.myTools(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get tool details")
    @GetMapping("/{id}")
    public ApiResponse<ToolResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok("Tool loaded", service.get(id));
    }

    @Operation(summary = "Create a tool")
    @PostMapping
    public ApiResponse<ToolResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ToolRequest request) {
        return ApiResponse.ok("Tool created", service.create(request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Replace a tool")
    @PutMapping("/{id}")
    public ApiResponse<ToolResponse> update(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ToolRequest request) {
        return ApiResponse.ok("Tool updated", service.update(id, request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Patch a tool")
    @PatchMapping("/{id}")
    public ApiResponse<ToolResponse> patch(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ToolPatchRequest request) {
        return ApiResponse.ok("Tool updated", service.patch(id, request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Delete a tool")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        service.delete(id, CurrentUser.from(jwt));
        return ApiResponse.ok("Tool deleted");
    }

    @Operation(summary = "Change tool availability")
    @PatchMapping("/{id}/status")
    public ApiResponse<ToolResponse> status(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ToolStatusRequest request) {
        return ApiResponse.ok("Tool status updated", service.updateStatus(id, request, CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get tool reviews")
    @GetMapping("/{id}/reviews")
    public ApiResponse<List<ReviewResponse>> reviews(@PathVariable UUID id) {
        return ApiResponse.ok("Reviews loaded", service.reviews(id));
    }

    @Operation(summary = "Add a review/comment to a tool")
    @PostMapping("/{id}/reviews")
    public ApiResponse<ReviewResponse> addReview(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.ok("Review added successfully", service.addReview(id, request, CurrentUser.from(jwt)));
    }
}

