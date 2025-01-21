package com.cis4000.examify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cis4000.examify.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
    public List<Course> findByUserId(Long userId);
}
