package com.toolshare.tool_service.controller;

import com.toolshare.tool_service.dto.ToolDTO;
import com.toolshare.tool_service.service.ToolService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tools")
@CrossOrigin(origins = "*")
public class ToolController {

    private final ToolService toolService;

    public ToolController(ToolService toolService) {
        this.toolService = toolService;
    }

    @PostMapping
    public ResponseEntity<ToolDTO> createTool(@Valid @RequestBody ToolDTO dto) {
        ToolDTO created = toolService.createTool(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ToolDTO>> getAllTools(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(toolService.getAllTools(category, query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ToolDTO> getToolById(@PathVariable Long id) {
        return ResponseEntity.ok(toolService.getToolById(id));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ToolDTO>> getToolsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(toolService.getToolsByOwner(ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ToolDTO> updateTool(@PathVariable Long id, @RequestBody ToolDTO dto) {
        return ResponseEntity.ok(toolService.updateTool(id, dto));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<ToolDTO> toggleAvailability(@PathVariable Long id, @RequestParam boolean available) {
        return ResponseEntity.ok(toolService.toggleAvailability(id, available));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTool(@PathVariable Long id) {
        toolService.deleteTool(id);
        return ResponseEntity.ok(Map.of("message", "Tool deleted successfully"));
    }
}
