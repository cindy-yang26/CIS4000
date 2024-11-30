package com.cis4000.examify.repositories;

import java.util.Optional;
import com.cis4000.examify.models.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByName(String name);
}
