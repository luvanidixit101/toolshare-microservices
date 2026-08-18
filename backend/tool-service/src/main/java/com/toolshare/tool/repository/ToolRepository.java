package com.toolshare.tool.repository;

import com.toolshare.tool.model.Tool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface ToolRepository extends JpaRepository<Tool, UUID>, JpaSpecificationExecutor<Tool> {
    List<Tool> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}

