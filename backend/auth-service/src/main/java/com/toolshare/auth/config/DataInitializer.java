package com.toolshare.auth.config;

import com.toolshare.auth.model.AppUser;
import com.toolshare.auth.model.Role;
import com.toolshare.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("dixit@gmail.com", "Dixit@123", "Dixit", "Luvani", "+919876543210", Role.ADMIN);
        seedUser("alex.morgan@example.com", "password123", "Alex", "Morgan", "+919876543211", Role.USER);
        seedUser("aarav.sharma@example.com", "Password123", "Aarav", "Sharma", "+919876543212", Role.USER);
    }

    private void seedUser(String email, String rawPassword, String firstName, String lastName, String phone, Role role) {
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            AppUser user = new AppUser();
            user.setEmail(email.toLowerCase().trim());
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhone(phone);
            user.setRole(role);
            user.setEnabled(true);
            userRepository.save(user);
            log.info("Seeded demo user {} ({})", email, role);
        }
    }
}
