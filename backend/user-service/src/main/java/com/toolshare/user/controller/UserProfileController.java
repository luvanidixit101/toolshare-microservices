package com.toolshare.user.controller;

import com.toolshare.user.dto.ApiResponse;
import com.toolshare.user.dto.ChangePasswordRequest;
import com.toolshare.user.dto.PreferencesRequest;
import com.toolshare.user.dto.UpdateProfileRequest;
import com.toolshare.user.dto.UserProfileResponse;
import com.toolshare.user.security.CurrentUser;
import com.toolshare.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Users")
@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService service;

    public UserProfileController(UserProfileService service) {
        this.service = service;
    }

    @Operation(summary = "Get current user's profile")
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Profile loaded", service.getMe(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Get user profile by ID")
    @GetMapping("/{id}")
    public ApiResponse<UserProfileResponse> getById(@PathVariable UUID id) {
        return ApiResponse.ok("Profile loaded", service.getById(id));
    }

    @Operation(summary = "Replace current user's editable profile fields")
    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateMe(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("Profile updated", service.updateMe(CurrentUser.from(jwt), request));
    }

    @Operation(summary = "Patch current user's editable profile fields")
    @PatchMapping("/me")
    public ApiResponse<UserProfileResponse> patchMe(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("Profile updated", service.patchMe(CurrentUser.from(jwt), request));
    }

    @Operation(summary = "Request password change")
    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        service.changePassword(request);
        return ApiResponse.ok("Password changed");
    }

    @Operation(summary = "Delete current user's profile")
    @DeleteMapping("/me")
    public ApiResponse<Void> deleteMe(@AuthenticationPrincipal Jwt jwt) {
        service.deleteMe(CurrentUser.from(jwt));
        return ApiResponse.ok("Profile deleted");
    }

    @Operation(summary = "Get current user's preferences")
    @GetMapping("/me/preferences")
    public ApiResponse<Map<String, String>> preferences(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok("Preferences loaded", service.getPreferences(CurrentUser.from(jwt)));
    }

    @Operation(summary = "Replace current user's preferences")
    @PutMapping("/me/preferences")
    public ApiResponse<Map<String, String>> updatePreferences(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PreferencesRequest request) {
        return ApiResponse.ok("Preferences updated", service.updatePreferences(CurrentUser.from(jwt), request));
    }
}

