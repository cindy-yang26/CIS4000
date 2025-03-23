package com.cis4000.examify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cis4000.examify.models.Image;

public interface ImageRepository extends JpaRepository<Image, Long> {
    public List<Image> findByCourseId(Long courseId);
}
