package com.toolshare.auth.repository;

import com.toolshare.auth.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmailIgnoreCase(String email);

<<<<<<< HEAD
    Optional<AppUser> findByGoogleSubject(String googleSubject);
=======
    Optional<AppUser> findByGoogleSub(String googleSub);
>>>>>>> 767f69e70fc64b6ba2f026ffdfff0e96ea20779e

    boolean existsByEmailIgnoreCase(String email);
}
