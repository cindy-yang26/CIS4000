package com.cis4000.examify.controllers;

import com.cis4000.examify.models.Assignment;
import com.cis4000.examify.models.Course;
import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.AssignmentRepository;
import com.cis4000.examify.repositories.CourseRepository;
import com.cis4000.examify.repositories.QuestionRepository;
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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.ArrayList;
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
                // TODO: As in AssignmentController.getAssignmentInfoById, the following line
                // exists because, if not, the fetching would have a cycle (by fetching an
                // assignment, which has a course, which has assignments (including this one),
                // etc.) leading to an infinitely long response
                // We should probably figure out a way for it to return the course id but not
                // the assignments of that course?
                a.setCourse(null);
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
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (payload.containsKey("courseCode")) {
            course.setCourseCode(payload.get("courseCode"));
        }

        courseRepository.save(course);
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
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        // Verify user is logged in to access course
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
            return ResponseEntity.internalServerError().body("failed to get current course info");
        }

        // Canvas course information must have been set already in order to call this
        // API endpoint
        Long canvasCourseId = course.getCanvasCourseId();
        String canvasToken = course.getCanvasToken();
        if (canvasCourseId == null || canvasToken == null) {
            return ResponseEntity.badRequest().body("Link a Canvas course and provide its token first");
        }

        // Query Canvas API to get questions, statistics, etc.
        RestTemplate restTemplate = new RestTemplate();
        final String url = "https://canvas.instructure.com/api/v1/courses/{canvasCourseId}/quizzes/{quizId}/questions";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + canvasToken);

        // The following is for testing purposes:
        // return restTemplate.exchange(url,
        // HttpMethod.GET, new HttpEntity<>(headers), String.class,
        // canvasCourseId, quizId);

        // The following code is for a version that uses /statistics instead of
        // /questions
        // CanvasQuizStatisticsResponse quizStatisticsResponse;
        // try {
        // ResponseEntity<CanvasQuizStatisticsResponseWrapper> res =
        // restTemplate.exchange(url,
        // HttpMethod.GET, new HttpEntity<>(headers),
        // CanvasQuizStatisticsResponseWrapper.class,
        // canvasCourseId, quizId);
        // if (!res.getStatusCode().is2xxSuccessful()) {
        // System.err.println(restTemplate.exchange(url,
        // HttpMethod.GET, new HttpEntity<>(headers), String.class,
        // canvasCourseId, quizId).getBody());
        // return ResponseEntity.status(res.getStatusCode()).body("error retrieving quiz
        // from Canvas API");
        // }
        // if (!res.hasBody()) {
        // return ResponseEntity.internalServerError().body("response from Canvas API
        // had no body");
        // }

        // Optional<CanvasQuizStatisticsResponse> quizStatisticsResponseOpt =
        // res.getBody().getData();
        // if (quizStatisticsResponseOpt.isEmpty()) {
        // System.err.println(restTemplate.exchange(url,
        // HttpMethod.GET, new HttpEntity<>(headers), String.class,
        // canvasCourseId, quizId).getBody());
        // return ResponseEntity.internalServerError().body("unexpected format returned
        // by Canvas API");
        // }

        // quizStatisticsResponse = quizStatisticsResponseOpt.get();
        // } catch (HttpStatusCodeException e) {
        // return ResponseEntity.status(e.getStatusCode()).body("error retrieving quiz
        // from Canvas API");
        // } catch (RestClientException e) {
        // System.err.println("couldn't retrieve quiz: " + e.getMessage());
        // return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        // .body("{\"message\": \"error retrieving quiz from Canvas API\"}");
        // } catch (Exception e) {
        // return ResponseEntity.internalServerError().body("failed to get current
        // course info");
        // }

        // Get questions from Canvas API
        List<CanvasQuizQuestion> canvasQuestions;
        try {
            ResponseEntity<List<CanvasQuizQuestion>> response = restTemplate.exchange(url, HttpMethod.GET,
                    new HttpEntity<>(headers), new ParameterizedTypeReference<List<CanvasQuizQuestion>>() {
                    }, canvasCourseId, quizId);
            canvasQuestions = response.getBody();
            if (canvasQuestions == null) {
                return ResponseEntity.internalServerError().body("response from Canvas API had no body");
            }
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body("error retrieving quiz from Canvas API");
        } catch (RestClientException e) {
            System.err.println("couldn't retrieve quiz: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"message\": \"error retrieving quiz from Canvas API\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("failed to get current course info");
        }

        // Import questions
        List<Question> assignmentQuestions = new ArrayList<>();

        try {
            // TODO: for the /submissions endpoint, use quizStatisticsResponse.questions
            for (CanvasQuizQuestion question : canvasQuestions) {
                if (question != null) {
                    Question savedQuestion = questionRepository.save(question.toQuestion(id));
                    assignmentQuestions.add(savedQuestion);
                }
            }
        } catch (Exception e) {
            // TODO: remove questions already created?
            System.err.println("Error creating questions: " + e.getMessage());
            return ResponseEntity.internalServerError().body("failed to import some questions");
        }

        // Create assignment
        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setName("Canvas Quiz " + quizId); // TODO: figure out if we can get the name from Canvas
        // assignment.setStatistics(quizStatisticsResponse.statistics);
        assignment.setQuestions(assignmentQuestions);
        assignment.setSemesterYear("25A");
        try {
            assignmentRepository.save(assignment);
        } catch (Exception e) {
            System.err.println("Error creating assignment: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("failed to create assignment with newly imported questions");
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

    // private static class CanvasQuizStatisticsResponseWrapper {
    //     @JsonProperty("quiz_statistics")
    //     private List<CanvasQuizStatisticsResponse> quizzes;

    //     Optional<CanvasQuizStatisticsResponse> getData() {
    //         if (quizzes.isEmpty()) {
    //             return Optional.empty();
    //         } else {
    //             return Optional.ofNullable(quizzes.get(0));
    //         }
    //     }
    // }

    // private static class CanvasQuizStatisticsResponse {
    //     @JsonProperty("question_statistics")
    //     List<CanvasQuizQuestion> questions;
    //     // @JsonProperty("submission_statistics")
    //     // private CanvasOverallStatistics statistics;
    // }

    private static class CanvasQuizQuestion {
        @JsonProperty("id")
        String id;
        @JsonProperty("question_type")
        String type;
        @JsonProperty("question_text")
        String text;
        // TODO: statistics?

        protected Question toQuestion(Long courseId) {
            Question q = new Question();
            q.setCourseId(courseId);
            q.setText(text);
            q.setTitle("Canvas question " + id);
            q.setText(text);
            return q;
        }
    }

    // private static class CanvasOverallStatistics {
    // @JsonProperty("score_average")
    // Double average;
    // @JsonProperty("score_high")
    // Double high;
    // @JsonProperty("score_low")
    // Double low;
    // @JsonProperty("score_stdev")
    // Double stdev;
    // }
}
