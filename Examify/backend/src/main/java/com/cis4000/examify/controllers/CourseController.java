package com.cis4000.examify.controllers;

import com.cis4000.examify.models.Assignment;
import com.cis4000.examify.models.Course;
import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.AssignmentRepository;
import com.cis4000.examify.repositories.CourseRepository;
import com.cis4000.examify.repositories.QuestionRepository;
import com.cis4000.examify.services.StatisticsExtractor;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
public class CourseController extends BaseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @PostMapping
    public ResponseEntity<?> createCourse(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @RequestBody CourseRequest request) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            // User needs to log in first
            if (userId == null) {
                return notLoggedInResponse();
            }

            Course course = new Course();
            course.setUserId(userId);
            course.setCourseCode(request.getCourseCode());
            course.setProfessor(request.getProfessor());

            Course savedCourse = courseRepository.save(course);
            savedCourse.setAssignments(null);
            savedCourse.setQuestions(null);
            return ResponseEntity.ok(savedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating course: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseInfoById(@CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            // User needs to log in first
            if (userId == null) {
                return notLoggedInResponse();
            }

            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
            course.setAssignments(null);
            course.setQuestions(null);

            // Verify that this course belongs to the user
            if (!course.getUserId().equals(userId)) {
                return userDoesntHaveAccessResponse();
            }

            return ResponseEntity.ok(course);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching course: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<?> getAssignmentsByCourseId(
            @CookieValue(name = "sessionId", required = false) String sessionCookie, @PathVariable Long id) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            // User needs to log in first
            if (userId == null) {
                return notLoggedInResponse();
            }

            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

            // Verify that this course belongs to the user
            if (!course.getUserId().equals(userId)) {
                return userDoesntHaveAccessResponse();
            }

            List<Assignment> assignments = course.getAssignments();
            for (Assignment a : assignments) {
                a.setCourse(null);
                a.setQuestions(null);
            }
            return ResponseEntity.ok(assignments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignments for course: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getQuestionsByCourseId(
            @CookieValue(name = "sessionId", required = false) String sessionCookie, @PathVariable Long id) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            // User needs to log in first
            if (userId == null) {
                return notLoggedInResponse();
            }

            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

            // Verify that this course belongs to the user
            if (!course.getUserId().equals(userId)) {
                return userDoesntHaveAccessResponse();
            }

            List<Question> questions = course.getQuestions();
            return ResponseEntity.ok(questions);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignments for course: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/tags")
    public ResponseEntity<?> getQuestionTagsByCourseId(
            @CookieValue(name = "sessionId", required = false) String sessionCookie, @PathVariable Long id) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            // User needs to log in first
            if (userId == null) {
                return notLoggedInResponse();
            }

            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

            // Verify that this course belongs to the user
            if (!userId.equals(course.getUserId())) {
                return userDoesntHaveAccessResponse();
            }

            List<Question> questions = course.getQuestions();
            HashSet<String> tags = new HashSet<>();
            for (Question q : questions) {
                tags.addAll(q.getTags());
            }

            return ResponseEntity.ok(tags);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignments for course: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            // User needs to log in first
            if (userId == null) {
                return notLoggedInResponse();
            }

            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("course not found with id: " + id));

            // Verify that this course belongs to the user
            if (!course.getUserId().equals(userId)) {
                return userDoesntHaveAccessResponse();
            }

            courseRepository.delete(course);

            return ResponseEntity.ok("course deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting course: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/link-canvas")
    public ResponseEntity<?> linkCanvasCourse(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Verify that this course belongs to the user
        if (!course.getUserId().equals(userId)) {
            return userDoesntHaveAccessResponse();
        }

        if (!payload.containsKey("canvasCourseId") || !payload.containsKey("canvasToken")) {
            return ResponseEntity.badRequest().body("Canvas Course ID and Token are required.");
        }

        Long canvasCourseId = Long.valueOf(payload.get("canvasCourseId").toString());
        String canvasToken = payload.get("canvasToken").toString();

        course.setCanvasCourseId(canvasCourseId);
        course.setCanvasToken(canvasToken);
        courseRepository.save(course);

        System.out.println("Linked Canvas Course ID " + canvasCourseId + " to Course " + course.getId());

        return ResponseEntity.ok("Canvas course linked successfully.");
    }

    @PutMapping("/{id}/rename")
    public ResponseEntity<?> updateCourse(@CookieValue(name = "sessionId", required = false) String sessionCookie, @PathVariable Long id, @RequestBody Map<String, String> payload) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        Optional<Course> courseOpt = courseRepository.findById(id);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Course course = courseOpt.get();

        // Verify that this course belongs to the user
        if (!userId.equals(course.getUserId())) {
            return userDoesntHaveAccessResponse();
        }

        if (payload.containsKey("courseCode")) {
            course.setCourseCode(payload.get("courseCode"));
        }

        course = courseRepository.save(course);
        course.setAssignments(null);
        course.setQuestions(null);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/")
    public ResponseEntity<?> getAllCourses(@CookieValue(name = "sessionId", required = false) String sessionCookie) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        try {
            List<Course> courses = courseRepository.findByUserId(userId);
            for (Course c : courses) {
                c.setAssignments(null);
                c.setQuestions(null);
            }
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting all courses: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/import-canvas-quiz/{quizId}")
    public ResponseEntity<String> importFromCanvasQuiz(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id, @PathVariable Long quizId) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        if (userId == null) {
            return notLoggedInResponse();
        }

        Course course;
        try {
            Optional<Course> courseOpt = courseRepository.findById(id);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            course = courseOpt.get();
            if (!userId.equals(course.getUserId())) {
                return userDoesntHaveAccessResponse();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to get current course info");
        }

        Long canvasCourseId = course.getCanvasCourseId();
        String canvasToken = course.getCanvasToken();
        if (canvasCourseId == null || canvasToken == null) {
            return ResponseEntity.badRequest().body("Link a Canvas course and provide its token first");
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + canvasToken);

        // Fetch questions from Canvas
        String questionsUrl = "https://canvas.instructure.com/api/v1/courses/{canvasCourseId}/quizzes/{quizId}/questions";
        List<CanvasQuizQuestion> canvasQuestions;
        try {
            ResponseEntity<List<CanvasQuizQuestion>> response = restTemplate.exchange(
                    questionsUrl, HttpMethod.GET, new HttpEntity<>(headers),
                    new ParameterizedTypeReference<List<CanvasQuizQuestion>>() {
                    }, canvasCourseId, quizId);

            canvasQuestions = response.getBody();
            if (canvasQuestions == null) {
                return ResponseEntity.internalServerError().body("Response from Canvas API had no body");
            }
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body("{\"message\": \"error when querying Canvas API\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"message\": \"Error retrieving quiz questions from Canvas API\"}");
        }

        // Fetch statistics from Canvas
        String statsUrl = "https://canvas.instructure.com/api/v1/courses/" + canvasCourseId + "/quizzes/" + quizId
                + "/statistics";
        Map<Long, Question.Stats> questionStatsMap = new HashMap<>();
        try {
            ResponseEntity<Map> response = restTemplate.exchange(statsUrl, HttpMethod.GET, new HttpEntity<>(headers),
                    Map.class);
            if (response.getBody() != null && response.getBody().containsKey("quiz_statistics")) {
                List<Map<String, Object>> quizStatisticsList = (List<Map<String, Object>>) response.getBody()
                        .get("quiz_statistics");

                if (!quizStatisticsList.isEmpty()) {
                    List<Map<String, Object>> questionStats = (List<Map<String, Object>>) quizStatisticsList.get(0)
                            .get("question_statistics");

                    for (Map<String, Object> questionStat : questionStats) {
                        Long questionId = Long.parseLong(questionStat.get("id").toString());
                        Question.Stats stats = StatisticsExtractor.extractStatistics(questionStat);

                        System.out.println("Retrieved Stats for Question ID: " + questionId);
                        System.out.println("Mean: " + stats.getMean() + ", Median: " + stats.getMedian() +
                                ", StdDev: " + stats.getStdDev() + ", Min: " + stats.getMin() + ", Max: "
                                + stats.getMax());

                        questionStatsMap.put(questionId, stats);
                    }
                }
            }
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body("{\"message\": \"Failed to retrieve quiz statistics from Canvas\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to retrieve quiz statistics from Canvas");
        }

        // Import questions with statistics
        List<Question> assignmentQuestions = new ArrayList<>();
        for (CanvasQuizQuestion question : canvasQuestions) {
            if (question != null) {
                Question newQuestion = question.toQuestion(id);
                newQuestion.setText(stripHtmlTags(newQuestion.getText()));
                newQuestion.setCorrectAnswer(getCorrectAnswer(question));

                try {
                    Long questionId = Long.parseLong(question.id);

                    if (questionStatsMap.containsKey(questionId)) {
                        newQuestion.setStats(questionStatsMap.get(questionId));
                        System.out.println("Setting stats for Question ID: " + questionId);
                    }
                } catch (NumberFormatException e) {
                    System.err.println("Error parsing question ID: " + question.id);
                }

                Question savedQuestion = questionRepository.save(newQuestion);
                assignmentQuestions.add(savedQuestion);
            }
        }

        // Get Canvas Quiz Name
        String quizTitle = getQuizTitle(canvasCourseId, quizId, canvasToken);

        // Create assignment
        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setName(quizTitle);
        assignment.setQuestions(assignmentQuestions);
        assignment.setSemesterYear("25A");
        try {
            assignmentRepository.save(assignment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to create assignment with newly imported questions");
        }

        return ResponseEntity.ok().body("Successfully imported quiz from Canvas");
    }

    public static class CourseRequest {
        private long userId;
        private String courseCode;
        private String professor;

        public long getUserId() {
            return userId;
        }

        public void setUserId(long userId) {
            this.userId = userId;
        }

        public String getCourseCode() {
            return courseCode;
        }

        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }

        public String getProfessor() {
            return professor;
        }

        public void setProfessor(String professor) {
            this.professor = professor;
        }
    }

    private static String getQuizTitle(Long courseId, Long quizId, String canvasToken) {
        String url = "https://canvas.instructure.com/api/v1/courses/" + courseId + "/quizzes/" + quizId;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + canvasToken);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers),
                    Map.class);

            if (response.getBody() != null && response.getBody().containsKey("title")) {
                return response.getBody().get("title").toString();
            } else {
                return "Unknown Quiz Title";
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch quiz title: " + e.getMessage());
            return "Error Fetching Title";
        }
    }

    private static String stripHtmlTags(String text) {
        if (text == null)
            return "";
        return text.replaceAll("<p>", "").replaceAll("</p>", "").trim();
    }

    private static String getCorrectAnswer(CanvasQuizQuestion question) {
        if (question.answers == null || question.answers.isEmpty()) {
            return "N/A";
        }

        switch (question.type) {
            case "multiple_choice_question":
                return getMCQCorrectAnswer(question.answers);
            case "true_false_question":
                return getTrueFalseCorrectAnswer(question.answers);
            case "numerical_question":
                return getNumericalCorrectAnswer(question.answers);
            default:
                return "N/A";
        }
    }

    private static String getMCQCorrectAnswer(List<Map<String, Object>> answers) {
        for (Map<String, Object> answer : answers) {
            Object weightObj = answer.get("weight");
            String text = (String) answer.get("text");

            int weight = getWeightAsInteger(weightObj);

            if (weight == 100 && text != null && !text.isEmpty()) {
                return text;
            }
        }
        return "N/A";
    }

    private static String getTrueFalseCorrectAnswer(List<Map<String, Object>> answers) {
        for (Map<String, Object> answer : answers) {
            Object weightObj = answer.get("weight");
            String text = (String) answer.get("text");

            int weight = getWeightAsInteger(weightObj);

            if (weight == 100 && text != null) {
                return text;
            }
        }
        return "N/A";
    }

    private static String getNumericalCorrectAnswer(List<Map<String, Object>> answers) {
        for (Map<String, Object> answer : answers) {
            if (answer.containsKey("exact")) {
                return answer.get("exact").toString();
            }
        }
        return "N/A";
    }

    private static int getWeightAsInteger(Object weightObj) {
        if (weightObj instanceof Integer) {
            return (Integer) weightObj;
        } else if (weightObj instanceof Double) {
            return ((Double) weightObj).intValue();
        } else {
            return 0;
        }
    }

    private static class CanvasQuizQuestion {
        @JsonProperty("id")
        String id;
        @JsonProperty("question_type")
        String type;
        @JsonProperty("question_text")
        String text;
        @JsonProperty("question_name")
        String name;
        @JsonProperty("answers")
        List<Map<String, Object>> answers;

        protected Question toQuestion(Long assignmentId) {
            Question q = new Question();
            q.setCourseId(assignmentId);
            q.setText(stripHtmlTags(text));
            q.setTitle(name != null ? name : "Canvas question " + id);
            q.setQuestionType(determineQuestionType(type));

            // Extracting correct answer(s) and options
            if (answers != null && !answers.isEmpty()) {
                extractAnswers(q, answers);
            }

            return q;
        }

        private String determineQuestionType(String canvasType) {
            switch (canvasType) {
                case "multiple_choice_question":
                    return "multiple_choice_question";
                case "true_false_question":
                    return "true_false_question";
                case "essay_question":
                    return "essay_question";
                case "numerical_question":
                    return "numerical_question";
                default:
                    return "essay_question";
            }
        }

        private void extractAnswers(Question q, List<Map<String, Object>> answers) {
            List<String> choices = new ArrayList<>();
            String correctAnswer = null;

            for (Map<String, Object> answer : answers) {
                String text = (String) answer.get("text");
                Object weightObj = answer.get("weight");
                int weight = getWeightAsInteger(weightObj);

                if (text != null && !text.trim().isEmpty()) {
                    choices.add(text);
                }

                if (weight == 100 && text != null && !text.trim().isEmpty()) {
                    correctAnswer = text;
                }
            }

            q.setOptions(choices);
            q.setCorrectAnswer(correctAnswer != null ? correctAnswer : "N/A");
        }
    }
}
