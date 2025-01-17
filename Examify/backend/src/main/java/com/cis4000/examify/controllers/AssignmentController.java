package com.cis4000.examify.controllers;

import com.cis4000.examify.models.Assignment;
import com.cis4000.examify.models.Course;
import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.AssignmentRepository;
import com.cis4000.examify.repositories.QuestionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody AssignmentRequest request) {
        try {
            Assignment assignment = new Assignment();
            assignment.setName(request.getName());
            assignment.setComment(request.getComment() != null ? request.getComment() : "");
            assignment.setStatistics("{}");
            assignment.setSemesterYear("");

            Course course = new Course();
            course.setId(request.getCourseId());
            assignment.setCourse(course);

            List<Question> questions = questionRepository.findAllById(request.getQuestionIds());
            if (questions.isEmpty() && !request.getQuestionIds().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Some question IDs provided do not exist in the database.");
            }
            assignment.setQuestions(questions);

            Assignment savedAssignment = assignmentRepository.save(assignment);
            return ResponseEntity.ok(savedAssignment);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating assignment: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssignmentInfoById(@PathVariable("id") Long id) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
            // TODO: the following line exists because, if not, the fetching would have a
            // cycle (by fetching an assignment, which has a course, which has assignments
            // (including this one), etc.) leading to an infinitely long response
            // We should probably figure out a way for it to return the course id but not
            // the assignments of that course?
            assignment.setCourse(null);
            assignment.setQuestions(null);

            return ResponseEntity.ok(assignment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignment: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getQuestionsByAssignmentId(@PathVariable("id") Long id) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

            List<Question> questions = assignment.getQuestions();

            return ResponseEntity.ok(questions);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching questions for assignment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

            assignmentRepository.delete(assignment);

            return ResponseEntity.ok("Assignment deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting assignment: " + e.getMessage());
        }
    }

    public static class AssignmentRequest {
        private long courseId;
        private String name;
        private String comment;
        private List<Long> questionIds;

        public long getCourseId() {
            return courseId;
        }

        public void setCourseId(long courseId) {
            this.courseId = courseId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public List<Long> getQuestionIds() {
            return questionIds;
        }

        public void setQuestionIds(List<Long> questionIds) {
            this.questionIds = questionIds;
        }
    }
}
