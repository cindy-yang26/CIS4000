package com.cis4000.examify.services;

import com.cis4000.examify.models.Question;

public class QuestionService {
    public static boolean validateQuestion(Question question) {
        switch (question.getQuestionType()) {
            case "multiple_choice_question":
                return question.getOptions() != null && !question.getOptions().isEmpty();
            case "true_false_question":
                return question.getCorrectAnswer() != null && (question.getCorrectAnswer().equals("True") || question.getCorrectAnswer().equals("False"));
            case "essay_question":
                return true;
            case "numerical_question":
                return question.getCorrectAnswer() != null;
            default:
                return false;
        }
    }
    
}
