package com.cis4000.examify.repositories;

import com.cis4000.examify.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
