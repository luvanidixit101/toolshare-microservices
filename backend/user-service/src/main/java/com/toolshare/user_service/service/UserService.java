package com.toolshare.user_service.service;

import com.toolshare.user_service.dto.UserProfileDTO;
import com.toolshare.user_service.entity.UserProfile;
import com.toolshare.user_service.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserProfileRepository repository;

    public UserService(UserProfileRepository repository) {
        this.repository = repository;
    }

    public UserProfileDTO createOrUpdateProfile(UserProfileDTO dto) {
        UserProfile profile = repository.findByEmail(dto.getEmail())
                .orElse(new UserProfile());

        if (profile.getId() == null) {
            profile.setUserId(dto.getUserId() != null ? dto.getUserId() : System.currentTimeMillis());
            profile.setEmail(dto.getEmail());
        }

        profile.setFullName(dto.getFullName());
        profile.setPhone(dto.getPhone());
        profile.setAddress(dto.getAddress());
        profile.setBio(dto.getBio());
        profile.setAvatarUrl(dto.getAvatarUrl());

        UserProfile saved = repository.save(profile);
        return mapToDTO(saved);
    }

    public UserProfileDTO getProfileById(Long id) {
        UserProfile profile = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
        return mapToDTO(profile);
    }

    public UserProfileDTO getProfileByUserId(Long userId) {
        UserProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for userId: " + userId));
        return mapToDTO(profile);
    }

    public UserProfileDTO getProfileByEmail(String email) {
        UserProfile profile = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found for email: " + email));
        return mapToDTO(profile);
    }

    public List<UserProfileDTO> getAllProfiles() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private UserProfileDTO mapToDTO(UserProfile entity) {
        return UserProfileDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .bio(entity.getBio())
                .avatarUrl(entity.getAvatarUrl())
                .rating(entity.getRating())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
