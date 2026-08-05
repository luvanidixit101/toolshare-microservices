package com.toolshare.user_service.controller;

import com.toolshare.user_service.dto.UserProfileDTO;
import com.toolshare.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserProfileDTO> createOrUpdateProfile(@Valid @RequestBody UserProfileDTO dto) {
        UserProfileDTO saved = userService.createOrUpdateProfile(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllProfiles() {
        return ResponseEntity.ok(userService.getAllProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfileById(id));
    }

    @GetMapping("/user-id/{userId}")
    public ResponseEntity<UserProfileDTO> getProfileByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getProfileByUserId(userId));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserProfileDTO> getProfileByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getProfileByEmail(email));
    }
}
