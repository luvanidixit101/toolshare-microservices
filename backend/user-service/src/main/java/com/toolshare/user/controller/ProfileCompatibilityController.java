package com.toolshare.user.controller;

import com.toolshare.user.dto.ApiResponse;
import com.toolshare.user.dto.ChangePasswordRequest;
import com.toolshare.user.dto.UpdateProfileRequest;
import com.toolshare.user.dto.UserProfileResponse;
import com.toolshare.user.security.CurrentUser;
import com.toolshare.user.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileCompatibilityController {

    private final UserProfileService service;

    public ProfileCompatibilityController(UserProfileService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<UserProfileResponse> getProfile(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Profile loaded", service.getMe(CurrentUser.from(jwt)));
    }

    @PutMapping
    public ApiResponse<UserProfileResponse> updateProfile(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("Profile updated", service.updateMe(CurrentUser.from(jwt), request));
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        service.changePassword(request);
        return ApiResponse.ok("Password changed");
    }

    @DeleteMapping
    public ApiResponse<Void> deleteAccount(@AuthenticationPrincipal Jwt jwt) {
        service.deleteMe(CurrentUser.from(jwt));
        return ApiResponse.ok("Profile deleted");
    }
}

