package com.cis4000.examify.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.lang.NonNull;

import com.cis4000.examify.repositories.AssignmentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.cis4000.examify.models.Assignment;
import com.cis4000.examify.models.Course;
import com.cis4000.examify.models.Question;

import org.springframework.http.*;

@RestController
@RequestMapping("/api/canvas")
public class CanvasController extends BaseController {
    @Autowired
    private AssignmentRepository assignmentRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadQuiz(@CookieValue(name = "sessionId", required = false) String sessionCookie,@RequestBody Map<String, Object> payload) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        String name = (String) payload.get("name");
        String description = (String) payload.get("description");

        // Ensure assignmentId is included in the payload
        if (!payload.containsKey("assignmentId")) {
            System.err.println("Error: assignmentId is missing from the request payload.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: assignmentId is required.");
        }

        Assignment assignment;
        String courseId;
        String token;
        try {
            Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
            Optional<Assignment> assignmentOpt = assignmentRepository.findById(assignmentId);
            if (assignmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No assignment with id " + assignmentId);
            }
            assignment = assignmentOpt.get();

            Course course = assignment.getCourse();
                        if (!course.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("This account does not have access");
            }

            courseId = course.getCanvasCourseId().toString();
            token = course.getCanvasToken();
        } catch (NumberFormatException e) {
            System.err.println("Error parsing assignmentId: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid assignmentId format.");
        } catch (Exception e) {
            System.err.println("Error getting assignment: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to get assignment and its course info");
        }

        System.out.println("Uploading quiz: " + name + " to Canvas course " + courseId);

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://canvas.instructure.com/api/v1/courses/" + courseId + "/quizzes";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> quizData = new HashMap<>();
        quizData.put("title", name);
        quizData.put("description", description);
        quizData.put("quiz_type", "assignment");
        quizData.put("published", true);
        quizData.put("time_limit", 60);
        quizData.put("due_at", "2025-02-20T23:59:00Z");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("quiz", quizData);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            String responseBody = response.getBody();
            System.out.println("Successfully uploaded quiz to Canvas: " + responseBody);

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            if (!jsonResponse.has("id")) {
                System.err.println("Error: Quiz ID not found in Canvas response.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Quiz was created but no ID was returned.");
            }

            int quizId = jsonResponse.get("id").asInt();

            uploadQuestionsToQuiz(Long.parseLong(courseId), quizId, assignment);

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            System.err.println("Error uploading quiz: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload quiz to Canvas");
        }
    }

    public void uploadQuestionsToQuiz(Long canvasCourseId, int quizId, @NonNull Assignment assignment) {
        List<Question> questions = assignment.getQuestions();
    
        if (questions.isEmpty()) {
            System.out.println("No questions found for assignment ID: " + assignment.getId());
            return;
        }
    
        String questionUrl = "https://canvas.instructure.com/api/v1/courses/" + canvasCourseId + "/quizzes/" + quizId + "/questions";
        Course course = assignment.getCourse();
        String token = course.getCanvasToken();
    
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);
    
        RestTemplate restTemplate = new RestTemplate();
    
        for (Question q : questions) {
            Map<String, Object> questionData = new HashMap<>();
            questionData.put("question_name", q.getTitle());
            questionData.put("question_text", q.getText());
            questionData.put("points_possible", 10);
    
            switch (q.getQuestionType()) {
                case "multiple_choice_question":
                    questionData.put("question_type", "multiple_choice_question");
                    questionData.put("answers", formatMultipleChoiceAnswers(q));
                    break;
    
                case "true_false_question":
                    questionData.put("question_type", "true_false_question");
                    questionData.put("answers", formatTrueFalseAnswers(q));
                    break;
    
                case "essay_question":
                    questionData.put("question_type", "essay_question");
                    break;
    
                case "numerical_question":
                    questionData.put("question_type", "numerical_question");
                    questionData.put("answers", formatNumericalAnswers(q));
                    break;
    
                default:
                    System.err.println("Unknown question type: " + q.getQuestionType());
                    continue;
            }
    
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("question", questionData);
    
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
    
            try {
                restTemplate.exchange(questionUrl, HttpMethod.POST, entity, String.class);
                System.out.println("Uploaded Question: " + q.getTitle() + " as " + q.getQuestionType());
            } catch (Exception e) {
                System.err.println("Error uploading question: " + q.getTitle() + " -> " + e.getMessage());
            }
        }
    }    

    private List<Map<String, Object>> formatMultipleChoiceAnswers(Question q) {
        List<Map<String, Object>> answers = new ArrayList<>();
        
        for (String option : q.getOptions()) {
            Map<String, Object> answer = new HashMap<>();
            answer.put("answer_text", option);
            answer.put("answer_weight", option.equals(q.getCorrectAnswer()) ? 100 : 0);
            answers.add(answer);
        }
        return answers;
    }

    private List<Map<String, Object>> formatTrueFalseAnswers(Question q) {
        return List.of(
            Map.of("answer_text", "True", "answer_weight", "True".equals(q.getCorrectAnswer()) ? 100 : 0),
            Map.of("answer_text", "False", "answer_weight", "False".equals(q.getCorrectAnswer()) ? 100 : 0)
        );
    }

    private List<Map<String, Object>> formatNumericalAnswers(Question q) {
        List<Map<String, Object>> answers = new ArrayList<>();
        
        try {
            double exactAnswer = Double.parseDouble(q.getCorrectAnswer());
    
            Map<String, Object> exactAnswerMap = new HashMap<>();
            exactAnswerMap.put("answer_exact", exactAnswer);
            exactAnswerMap.put("answer_error_margin", 0);
            exactAnswerMap.put("answer_weight", 100);
            exactAnswerMap.put("numerical_answer_type", "exact_answer");  
            answers.add(exactAnswerMap);

            double rangeMargin = 0.0;
            Map<String, Object> rangeAnswerMap = new HashMap<>();
            rangeAnswerMap.put("answer_range_start", exactAnswer - rangeMargin);
            rangeAnswerMap.put("answer_range_end", exactAnswer + rangeMargin);
            rangeAnswerMap.put("answer_weight", 100);
            rangeAnswerMap.put("numerical_answer_type", "range_answer");
            answers.add(rangeAnswerMap);
    
            double approximateMargin = 0.0;
            Map<String, Object> approximateAnswerMap = new HashMap<>();
            approximateAnswerMap.put("answer_approximate", exactAnswer);
            approximateAnswerMap.put("answer_precision", approximateMargin);
            approximateAnswerMap.put("answer_weight", 100);
            approximateAnswerMap.put("numerical_answer_type", "precision_answer");
            answers.add(approximateAnswerMap);
    
        } catch (NumberFormatException e) {
            System.err.println("Invalid numerical answer format: " + q.getCorrectAnswer());
        }
        
        return answers;
    }
    

}
