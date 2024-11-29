package com.cis4000.examify.controllers;

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
        questionRepository.save(question);
        return ResponseEntity.ok("Question created successfully");
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
