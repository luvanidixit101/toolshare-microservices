package com.toolshare.tool_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal pricePerDay;

    private BigDecimal depositAmount;
    private String location;
    private String imageUrl;

    @Column(nullable = false)
    private Long ownerId;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isAvailable == null) {
            this.isAvailable = true;
        }
    }
}
