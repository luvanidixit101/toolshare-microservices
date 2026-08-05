package com.toolshare.tool_service.service;

import com.toolshare.tool_service.dto.ToolDTO;
import com.toolshare.tool_service.entity.Tool;
import com.toolshare.tool_service.repository.ToolRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ToolService {

    private final ToolRepository repository;

    public ToolService(ToolRepository repository) {
        this.repository = repository;
    }

    public ToolDTO createTool(ToolDTO dto) {
        Tool tool = Tool.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .pricePerDay(dto.getPricePerDay())
                .depositAmount(dto.getDepositAmount())
                .location(dto.getLocation())
                .imageUrl(dto.getImageUrl())
                .ownerId(dto.getOwnerId())
                .isAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true)
                .build();

        Tool saved = repository.save(tool);
        return mapToDTO(saved);
    }

    public List<ToolDTO> getAllTools(String category, String query) {
        List<Tool> tools;
        if (category != null && !category.isBlank()) {
            tools = repository.findByCategory(category);
        } else if (query != null && !query.isBlank()) {
            tools = repository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        } else {
            tools = repository.findAll();
        }
        return tools.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ToolDTO getToolById(Long id) {
        Tool tool = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tool not found with id: " + id));
        return mapToDTO(tool);
    }

    public List<ToolDTO> getToolsByOwner(Long ownerId) {
        return repository.findByOwnerId(ownerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ToolDTO updateTool(Long id, ToolDTO dto) {
        Tool tool = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tool not found with id: " + id));

        if (dto.getTitle() != null) tool.setTitle(dto.getTitle());
        if (dto.getDescription() != null) tool.setDescription(dto.getDescription());
        if (dto.getCategory() != null) tool.setCategory(dto.getCategory());
        if (dto.getPricePerDay() != null) tool.setPricePerDay(dto.getPricePerDay());
        if (dto.getDepositAmount() != null) tool.setDepositAmount(dto.getDepositAmount());
        if (dto.getLocation() != null) tool.setLocation(dto.getLocation());
        if (dto.getImageUrl() != null) tool.setImageUrl(dto.getImageUrl());
        if (dto.getIsAvailable() != null) tool.setIsAvailable(dto.getIsAvailable());

        Tool updated = repository.save(tool);
        return mapToDTO(updated);
    }

    public ToolDTO toggleAvailability(Long id, boolean available) {
        Tool tool = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tool not found with id: " + id));
        tool.setIsAvailable(available);
        return mapToDTO(repository.save(tool));
    }

    public void deleteTool(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Tool not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private ToolDTO mapToDTO(Tool tool) {
        return ToolDTO.builder()
                .id(tool.getId())
                .title(tool.getTitle())
                .description(tool.getDescription())
                .category(tool.getCategory())
                .pricePerDay(tool.getPricePerDay())
                .depositAmount(tool.getDepositAmount())
                .location(tool.getLocation())
                .imageUrl(tool.getImageUrl())
                .ownerId(tool.getOwnerId())
                .isAvailable(tool.getIsAvailable())
                .createdAt(tool.getCreatedAt())
                .build();
    }
}
