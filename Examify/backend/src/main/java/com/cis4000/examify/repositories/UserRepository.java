package com.cis4000.examify.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cis4000.examify.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
}
