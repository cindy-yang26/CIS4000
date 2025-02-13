package com.cis4000.examify.controllers;

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
        quizData.put("quiz_type", "assignment"); // Fix quiz_type
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

            // Extract quiz_id from response
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            if (!jsonResponse.has("id")) {
                System.err.println("Error: Quiz ID not found in Canvas response.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Quiz was created but no ID was returned.");
            }

            int quizId = jsonResponse.get("id").asInt();

            // Upload questions to the quiz
            uploadQuestionsToQuiz(Long.parseLong(courseId), quizId, assignment);

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            System.err.println("Error uploading quiz: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload quiz to Canvas");
        }
    }

    // Assumes that the current user is logged in and can access the course to which assignment belongs
    public void uploadQuestionsToQuiz(Long canvasCourseId, int quizId, @NonNull Assignment assignment) {
        List<Question> questions = assignment.getQuestions(); // Retrieve questions from assignment

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
            questionData.put("question_type", "essay_question");
            questionData.put("points_possible", 10);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("question", questionData);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            try {
                restTemplate.exchange(questionUrl, HttpMethod.POST, entity, String.class);
                System.out.println("Uploaded Question: " + q.getTitle());
            } catch (Exception e) {
                System.err.println("Error uploading question: " + e.getMessage());
            }
        }
    }

}
