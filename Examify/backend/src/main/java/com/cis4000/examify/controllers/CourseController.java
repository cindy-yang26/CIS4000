package com.cis4000.examify.controllers;

import com.cis4000.examify.models.Assignment;
import com.cis4000.examify.models.Course;
import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.CourseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
public class CourseController extends BaseController {

    @Autowired
    private CourseRepository courseRepository;

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
            @PathVariable("id") Long id) {
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
            @CookieValue(name = "sessionId", required = false) String sessionCookie, @PathVariable("id") Long id) {
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
            @CookieValue(name = "sessionId", required = false) String sessionCookie, @PathVariable("id") Long id) {
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
}
