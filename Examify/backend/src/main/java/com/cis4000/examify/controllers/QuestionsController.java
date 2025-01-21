package com.cis4000.examify.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.QuestionRepository;
import com.cis4000.examify.repositories.CourseRepository;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionsController extends BaseController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CourseRepository courseRepository;

    private boolean belongsToUser(Question question, Long userId) {
        if (question == null || question.getCourseId() == null) {
            return false;
        }

        return courseRepository.findById(question.getCourseId()).map(course -> {
            return course.getUserId() != null && course.getUserId().equals(userId);
        }).orElse(false);
    }

    @PostMapping
    public ResponseEntity<?> createQuestion(@CookieValue(name = "sessionId", required = false) String sessionCookie,
            @RequestBody Question question) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            // User needs to log in first
            if (userId == null) {
                return notLoggedInResponse();
            }

            // Verify that the user has access to this question
            if (!belongsToUser(question, userId)) {
                return userDoesntHaveAccessResponse();
            }

            questionRepository.save(question);
            return ResponseEntity.ok("Question created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating question: " + e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> editQuestion(@CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id, @RequestBody QuestionRequest questionRequest) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        Optional<Question> questionOptional = questionRepository.findById(id);

        if (questionOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found");
        }

        Question question = questionOptional.get();

        // Verify that the user has access to this question
        if (!belongsToUser(question, userId)) {
            return userDoesntHaveAccessResponse();
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
    public ResponseEntity<?> deleteQuestion(@CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        Optional<Question> questionOptional = questionRepository.findById(id);

        if (questionOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found");
        }

        // Verify that the user has access to this question
        if (!belongsToUser(questionOptional.get(), userId)) {
            return userDoesntHaveAccessResponse();
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
