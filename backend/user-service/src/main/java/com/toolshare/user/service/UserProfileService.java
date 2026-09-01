package com.toolshare.user.service;

import com.toolshare.user.dto.ChangePasswordRequest;
import com.toolshare.user.dto.PreferencesRequest;
import com.toolshare.user.dto.UpdateProfileRequest;
import com.toolshare.user.dto.UserProfileResponse;
import com.toolshare.user.exception.ApiException;
import com.toolshare.user.model.UserProfile;
import com.toolshare.user.repository.UserProfileRepository;
import com.toolshare.user.security.CurrentUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    private final UserProfileRepository repository;

    public UserProfileService(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public UserProfileResponse getMe(CurrentUser currentUser) {
        return toResponse(getOrCreate(currentUser));
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public UserProfileResponse getById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User profile not found"));
    }

    @Transactional
    public UserProfileResponse updateMe(CurrentUser currentUser, UpdateProfileRequest request) {
        UserProfile profile = getOrCreate(currentUser);
        applyUpdate(profile, request, false);
        log.info("Updated profile {}", profile.getId());
        return toResponse(repository.save(profile));
    }

    @Transactional
    public UserProfileResponse patchMe(CurrentUser currentUser, UpdateProfileRequest request) {
        UserProfile profile = getOrCreate(currentUser);
        applyUpdate(profile, request, true);
        log.info("Patched profile {}", profile.getId());
        return toResponse(repository.save(profile));
    }

    @Transactional
    @SuppressWarnings("null")
    public void deleteMe(CurrentUser currentUser) {
        repository.deleteById(currentUser.id());
        log.info("Deleted profile {}", currentUser.id());
    }

    @Transactional
    public Map<String, String> updatePreferences(CurrentUser currentUser, PreferencesRequest request) {
        UserProfile profile = getOrCreate(currentUser);
        profile.setPreferences(new HashMap<>(request.preferences()));
        repository.save(profile);
        return profile.getPreferences();
    }

    @Transactional
    public Map<String, String> getPreferences(CurrentUser currentUser) {
        return getOrCreate(currentUser).getPreferences();
    }

    public void changePassword(ChangePasswordRequest request) {
        throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Password changes must be completed through the Auth Service credentials flow");
    }

    @SuppressWarnings("null")
    private UserProfile getOrCreate(CurrentUser currentUser) {
        return repository.findById(currentUser.id()).orElseGet(() -> {
            UserProfile profile = new UserProfile();
            profile.setId(currentUser.id());
            profile.setEmail(currentUser.email());
            profile.setFirstName(defaultString(currentUser.firstName(), "ToolShare"));
            profile.setLastName(defaultString(currentUser.lastName(), "User"));
            profile.setPreferences(defaultPreferences());
            log.info("Created profile shell for user {}", currentUser.id());
            return repository.save(profile);
        });
    }

    private void applyUpdate(UserProfile profile, UpdateProfileRequest request, boolean partial) {
        if (!partial || request.firstName() != null) {
            profile.setFirstName(defaultString(request.firstName(), profile.getFirstName()));
        }
        if (!partial || request.lastName() != null) {
            profile.setLastName(defaultString(request.lastName(), profile.getLastName()));
        }
        if (!partial || request.phone() != null) {
            profile.setPhone(request.phone());
        }
        if (!partial || request.location() != null) {
            profile.setLocation(request.location());
        }
        if (!partial || request.bio() != null) {
            profile.setBio(request.bio());
        }
        if (!partial || request.avatarUrl() != null) {
            profile.setAvatarUrl(request.avatarUrl());
        }
    }

    private UserProfileResponse toResponse(UserProfile profile) {
        return new UserProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getEmail(),
                profile.getPhone(),
                profile.getLocation(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getRating(),
                profile.getReviewCount(),
                profile.getMemberSince(),
                profile.getPreferences()
        );
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private Map<String, String> defaultPreferences() {
        Map<String, String> preferences = new HashMap<>();
        preferences.put("emailNotifications", "true");
        preferences.put("bookingUpdates", "true");
        preferences.put("messageNotifications", "true");
        return preferences;
    }
}

