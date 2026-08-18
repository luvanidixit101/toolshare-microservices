package com.toolshare.tool.service;

import com.toolshare.tool.dto.PagedResponse;
import com.toolshare.tool.dto.ReviewResponse;
import com.toolshare.tool.dto.ToolPatchRequest;
import com.toolshare.tool.dto.ToolRequest;
import com.toolshare.tool.dto.ToolResponse;
import com.toolshare.tool.dto.ToolStatusRequest;
import com.toolshare.tool.exception.ApiException;
import com.toolshare.tool.model.Tool;
import com.toolshare.tool.model.ToolStatus;
import com.toolshare.tool.repository.ToolRepository;
import com.toolshare.tool.security.CurrentUser;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ToolService {

    private static final Logger log = LoggerFactory.getLogger(ToolService.class);

    private final ToolRepository repository;

    public ToolService(ToolRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ToolResponse> search(
            String keyword,
            String search,
            String category,
            String location,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal rating,
            BigDecimal minRating,
            Boolean available,
            Boolean availableOnly,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort(sort));
        BigDecimal effectiveRating = rating != null ? rating : minRating;
        Boolean effectiveAvailable = available != null ? available : availableOnly;
        String effectiveKeyword = keyword != null ? keyword : search;
        Page<Tool> result = repository.findAll(spec(effectiveKeyword, category, location, minPrice, maxPrice, effectiveRating, effectiveAvailable), pageable);
        return PagedResponse.of("Tools loaded", result.map(this::toResponse).toList(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public ToolResponse get(UUID id) {
        Tool tool = find(id);
        tool.setViews(tool.getViews() + 1);
        return toResponse(repository.save(tool));
    }

    @Transactional
    public ToolResponse create(ToolRequest request, CurrentUser currentUser) {
        Tool tool = new Tool();
        tool.setOwnerId(currentUser.id());
        tool.setOwnerName(currentUser.displayName().isBlank() ? currentUser.email() : currentUser.displayName());
        applyCreate(tool, request);
        Tool saved = repository.save(tool);
        log.info("Created tool {} for owner {}", saved.getId(), currentUser.id());
        return toResponse(saved);
    }

    @Transactional
    public ToolResponse update(UUID id, ToolRequest request, CurrentUser currentUser) {
        Tool tool = find(id);
        requireOwnerOrAdmin(tool, currentUser);
        applyCreate(tool, request);
        Tool saved = repository.save(tool);
        log.info("Updated tool {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public ToolResponse patch(UUID id, ToolPatchRequest request, CurrentUser currentUser) {
        Tool tool = find(id);
        requireOwnerOrAdmin(tool, currentUser);
        applyPatch(tool, request);
        Tool saved = repository.save(tool);
        log.info("Patched tool {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID id, CurrentUser currentUser) {
        Tool tool = find(id);
        requireOwnerOrAdmin(tool, currentUser);
        repository.delete(tool);
        log.info("Deleted tool {}", id);
    }

    @Transactional(readOnly = true)
    public List<ToolResponse> myTools(CurrentUser currentUser) {
        return repository.findByOwnerIdOrderByCreatedAtDesc(currentUser.id()).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ToolResponse updateStatus(UUID id, ToolStatusRequest request, CurrentUser currentUser) {
        Tool tool = find(id);
        requireOwnerOrAdmin(tool, currentUser);
        tool.setAvailable(request.available());
        tool.setStatus(request.available() ? ToolStatus.ACTIVE : ToolStatus.INACTIVE);
        return toResponse(repository.save(tool));
    }

    @Transactional(readOnly = true)
    public List<String> categories() {
        return repository.findAll().stream()
                .map(Tool::getCategory)
                .filter(category -> category != null && !category.isBlank())
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();
    }

    public List<ReviewResponse> reviews(UUID toolId) {
        find(toolId);
        return List.of();
    }

    private Tool find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tool not found"));
    }

    private Specification<Tool> spec(String keyword, String category, String location, BigDecimal minPrice, BigDecimal maxPrice, BigDecimal rating, Boolean available) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("category")), like)
                ));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.toLowerCase(Locale.ROOT)));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase(Locale.ROOT) + "%"));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerDay"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerDay"), maxPrice));
            }
            if (rating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), rating));
            }
            if (available != null) {
                predicates.add(cb.equal(root.get("available"), available));
            }
            predicates.add(cb.equal(root.get("status"), ToolStatus.ACTIVE));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort sort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sort) {
            case "price_asc", "price,asc" -> Sort.by(Sort.Direction.ASC, "pricePerDay");
            case "price_desc", "price,desc" -> Sort.by(Sort.Direction.DESC, "pricePerDay");
            case "rating_desc", "rating,desc" -> Sort.by(Sort.Direction.DESC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private void applyCreate(Tool tool, ToolRequest request) {
        tool.setName(request.name().trim());
        tool.setCategory(request.category().trim());
        tool.setDescription(request.description().trim());
        tool.setCondition(request.condition());
        tool.setPricePerDay(request.pricePerDay());
        tool.setSecurityDeposit(request.securityDeposit());
        tool.setLocation(request.location().trim());
        tool.setLatitude(request.latitude());
        tool.setLongitude(request.longitude());
        tool.setAvailable(request.available() == null || request.available());
        tool.setStatus(tool.isAvailable() ? ToolStatus.ACTIVE : ToolStatus.INACTIVE);
        tool.setSpecifications(request.specifications() == null ? new java.util.HashMap<>() : new java.util.HashMap<>(request.specifications()));
        tool.setImages(request.images() == null ? new java.util.ArrayList<>() : new java.util.ArrayList<>(request.images()));
    }

    private void applyPatch(Tool tool, ToolPatchRequest request) {
        if (request.name() != null) tool.setName(request.name().trim());
        if (request.category() != null) tool.setCategory(request.category().trim());
        if (request.description() != null) tool.setDescription(request.description().trim());
        if (request.condition() != null) tool.setCondition(request.condition());
        if (request.pricePerDay() != null) tool.setPricePerDay(request.pricePerDay());
        if (request.securityDeposit() != null) tool.setSecurityDeposit(request.securityDeposit());
        if (request.location() != null) tool.setLocation(request.location().trim());
        if (request.latitude() != null) tool.setLatitude(request.latitude());
        if (request.longitude() != null) tool.setLongitude(request.longitude());
        if (request.available() != null) {
            tool.setAvailable(request.available());
            tool.setStatus(tool.isAvailable() ? ToolStatus.ACTIVE : ToolStatus.INACTIVE);
        }
        if (request.specifications() != null) tool.setSpecifications(new java.util.HashMap<>(request.specifications()));
        if (request.images() != null) tool.setImages(new java.util.ArrayList<>(request.images()));
    }

    private void requireOwnerOrAdmin(Tool tool, CurrentUser currentUser) {
        if (!currentUser.isAdmin() && !tool.getOwnerId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the owner or an admin can manage this tool");
        }
    }

    private ToolResponse toResponse(Tool tool) {
        return new ToolResponse(
                tool.getId(),
                tool.getOwnerId(),
                tool.getOwnerName(),
                BigDecimal.ZERO,
                tool.getName(),
                tool.getCategory(),
                tool.getDescription(),
                tool.getCondition(),
                tool.getPricePerDay(),
                tool.getSecurityDeposit(),
                tool.getLocation(),
                tool.getLatitude(),
                tool.getLongitude(),
                tool.isAvailable(),
                tool.getStatus(),
                tool.getSpecifications(),
                tool.getImages(),
                tool.getRating(),
                tool.getReviewCount(),
                tool.getViews(),
                tool.getCreatedAt(),
                tool.getUpdatedAt()
        );
    }
}

