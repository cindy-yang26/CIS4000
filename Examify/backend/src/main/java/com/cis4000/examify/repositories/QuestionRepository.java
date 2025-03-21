package com.cis4000.examify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cis4000.examify.models.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByOriginalQuestionId(Long originalQuestionId);
}

