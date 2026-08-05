package com.toolshare.tool_service.repository;

import com.toolshare.tool_service.entity.Tool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToolRepository extends JpaRepository<Tool, Long> {
    List<Tool> findByCategory(String category);
    List<Tool> findByOwnerId(Long ownerId);
    List<Tool> findByIsAvailable(Boolean isAvailable);
    List<Tool> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
}
