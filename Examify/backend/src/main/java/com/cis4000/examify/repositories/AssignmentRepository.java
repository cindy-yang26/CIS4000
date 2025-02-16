package com.cis4000.examify.repositories;

import com.cis4000.examify.models.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Assignment findByName(String name);
}