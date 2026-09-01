package com.toolshare.user.service;

import com.toolshare.user.dto.UpdateProfileRequest;
import com.toolshare.user.model.UserProfile;
import com.toolshare.user.repository.UserProfileRepository;
import com.toolshare.user.security.CurrentUser;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserProfileServiceTest {

    private final UserProfileRepository repository = mock(UserProfileRepository.class);
    private final UserProfileService service = new UserProfileService(repository);

    @Test
    @SuppressWarnings("null")
    void patchMeUpdatesOnlyProvidedFields() {
        UUID userId = UUID.randomUUID();
        UserProfile profile = new UserProfile();
        profile.setId(userId);
        profile.setEmail("alex@example.com");
        profile.setFirstName("Alex");
        profile.setLastName("Morgan");

        when(repository.findById(userId)).thenReturn(Optional.of(profile));
        when(repository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.patchMe(new CurrentUser(userId, "alex@example.com", "Alex", "Morgan", "USER"),
                new UpdateProfileRequest(null, null, null, "Delhi", null, null));

        assertThat(response.firstName()).isEqualTo("Alex");
        assertThat(response.location()).isEqualTo("Delhi");
    }
}

