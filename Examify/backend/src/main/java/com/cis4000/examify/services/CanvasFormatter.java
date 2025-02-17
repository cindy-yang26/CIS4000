package com.cis4000.examify.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.cis4000.examify.models.Question;

public class CanvasFormatter {
    public static Map<String, Object> convertToCanvasFormat(Question question) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("question_name", question.getTitle());
        payload.put("question_text", question.getText());
        payload.put("points_possible", 1);

        switch (question.getQuestionType()) {
            case "multiple_choice_question":
                payload.put("question_type", "multiple_choice_question");
                List<Map<String, Object>> answers = new ArrayList<>();
                for (String option : question.getOptions()) {
                    Map<String, Object> answer = new HashMap<>();
                    answer.put("answer_text", option);
                    answer.put("answer_weight", option.equals(question.getCorrectAnswer()) ? 100 : 0);
                    answers.add(answer);
                }
                payload.put("answers", answers);
                break;

            case "true_false_question":
                payload.put("question_type", "true_false_question");
                List<Map<String, Object>> tfAnswers = new ArrayList<>();
                tfAnswers.add(Map.of("answer_text", "True", "answer_weight", "True".equals(question.getCorrectAnswer()) ? 100 : 0));
                tfAnswers.add(Map.of("answer_text", "False", "answer_weight", "False".equals(question.getCorrectAnswer()) ? 100 : 0));
                payload.put("answers", tfAnswers);
                break;

            case "essay_question":
                payload.put("question_type", "essay_question");
                break;

            case "numerical_question":
                payload.put("question_type", "numerical_question");
                payload.put("answers", List.of(Map.of("answer_text", question.getCorrectAnswer())));
                break;

            default:
                throw new IllegalArgumentException("Invalid question type");
        }
        return payload;
    }
}
