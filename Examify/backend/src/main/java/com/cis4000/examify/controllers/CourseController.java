package com.cis4000.examify.controllers;

import com.cis4000.examify.models.Assignment;
import com.cis4000.examify.models.Course;
import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.CourseRepository;
import com.cis4000.examify.repositories.SessionsRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SessionsRepository sessionsRepository;

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest request) {
        try {
            Course course = new Course();
            // TODO: set user/user_id so that only particular users can access this course
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
    public ResponseEntity<?> getCourseInfoById(@PathVariable("id") Long id) {
        try {
            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
            course.setUser(null);
            course.setAssignments(null);
            course.setQuestions(null);

            return ResponseEntity.ok(course);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching course: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<?> getAssignmentsByCourseId(@PathVariable("id") Long id) {
        try {
            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

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
    public ResponseEntity<?> getQuestionsByCourseId(@PathVariable("id") Long id) {
        try {
            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

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
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("course not found with id: " + id));

            courseRepository.delete(course);

            return ResponseEntity.ok("course deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting course: " + e.getMessage());
        }
    }

    @GetMapping("/")
    public ResponseEntity<?> getAllCourses(@RequestBody GetAllCoursesRequest request) {
        try {
            List<Course> courses = courseRepository.findCoursesByCookie(request.getCookie());
            for (Course c : courses) {
                c.setAssignments(null);
                c.setUser(null);
                c.setSessions(null);
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

    public static class GetAllCoursesRequest {
        private String cookie;

        public void setCookie(String cookie) {
            this.cookie = cookie;
        }

        public String getCookie() {
            return cookie;
        }
    }
}
