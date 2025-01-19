package com.cis4000.examify.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cis4000.examify.models.Course;
import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.CourseRepository;
import com.cis4000.examify.repositories.QuestionRepository;

import jakarta.servlet.http.HttpSession;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionsController extends BaseController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CourseRepository courseRepository;

    private boolean questionBelongsToUser(Question question, long userId) {
        Optional<Course> courseOptional = courseRepository.findById(question.getCourseId());
        if (courseOptional.isEmpty()) {
            return false;
        }

        Course course = courseOptional.get();
        Long courseUserIdObj = course.getUserId();
        if (courseUserIdObj == null) {
            return false;
        }
        long courseUserId = courseUserIdObj;
        return courseUserId == userId;
    }

    @PostMapping
    public ResponseEntity<String> createQuestion(@RequestBody Question question, HttpSession session) {
        try {
            Long userId = getUserIdOfSession(session);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Error creating assignment: no user associated with current session");
            }

            if (!questionBelongsToUser(question, userId)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User does not have access to current course");
            }

            questionRepository.save(question);
            return ResponseEntity.ok("Question created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating question: " + e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<String> editQuestion(@PathVariable Long id, @RequestBody QuestionRequest questionRequest,
            HttpSession session) {
        Long userId = getUserIdOfSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error creating assignment: no user associated with current session");
        }

        Optional<Question> questionOptional = questionRepository.findById(id);

        if (questionOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found");
        }

        Question question = questionOptional.get();
        if (!questionBelongsToUser(question, userId)) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User does not have access to current question");
        }

        question.setTitle(questionRequest.getTitle());
        question.setText(questionRequest.getText());
        question.setComment(questionRequest.getComment());
        question.setTags(questionRequest.getTags());

        Question.Stats stats = question.getStats();

        stats.setMean(questionRequest.getStats().getMean());
        stats.setMedian(questionRequest.getStats().getMedian());
        stats.setStdDev(questionRequest.getStats().getStdDev());
        stats.setMin(questionRequest.getStats().getMin());
        stats.setMax(questionRequest.getStats().getMax());

        question.setStats(stats);

        questionRepository.save(question);

        return ResponseEntity.ok("Question updated successfully");
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id, HttpSession session) {
        Long userId = getUserIdOfSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error creating assignment: no user associated with current session");
        }

        Optional<Question> questionOptional = questionRepository.findById(id);

        if (questionOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found");
        }

        if (!questionBelongsToUser(questionOptional.get(), userId)) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User does not have access to current question");
        }

        questionRepository.deleteById(id);
        return ResponseEntity.ok("Question deleted successfully");
    }

    public static class QuestionRequest {
        private String title;
        private String text;
        private String comment;
        private List<String> tags;
        private Stats stats;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
        }

        public Stats getStats() {
            return stats;
        }

        public void setStats(Stats stats) {
            this.stats = stats;
        }

        public static class Stats {
            private String mean;
            private String median;
            private String stdDev;
            private String min;
            private String max;

            public String getMean() {
                return mean;
            }

            public void setMean(String mean) {
                this.mean = mean;
            }

            public String getMedian() {
                return median;
            }

            public void setMedian(String median) {
                this.median = median;
            }

            public String getStdDev() {
                return stdDev;
            }

            public void setStdDev(String stdDev) {
                this.stdDev = stdDev;
            }

            public String getMin() {
                return min;
            }

            public void setMin(String min) {
                this.min = min;
            }

            public String getMax() {
                return max;
            }

            public void setMax(String max) {
                this.max = max;
            }
        }
    }
}
