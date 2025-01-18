package com.cis4000.examify.controllers;

import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.QuestionRepository;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionsController {

    private final QuestionRepository questionRepository;

    public QuestionsController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Question>> fetchQuestions() {
        List<Question> questions = questionRepository.findAll();
        return ResponseEntity.ok(questions);
    }

    @PostMapping
    public ResponseEntity<String> createQuestion(@RequestBody Question question) {
        try {
            questionRepository.save(question);
            return ResponseEntity.ok("Question created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating question: " + e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<String> editQuestion(@PathVariable Long id, @RequestBody QuestionRequest questionRequest) {
        Optional<Question> questionOptional = questionRepository.findById(id);

        if (questionOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found");
        }

        Question question = questionOptional.get();

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
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id) {
        Optional<Question> questionOptional = questionRepository.findById(id);

        if (questionOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found");
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
