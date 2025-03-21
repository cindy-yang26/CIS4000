package com.cis4000.examify.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "question")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = true, name = "question_type")
    private String questionType;

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")  
    private List<String> options;

    @Column(name = "correct_answer")
    private String correctAnswer;

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    @Column(name = "original_question_id", nullable = true)
    private Long originalQuestionId;

    public Long getOriginalQuestionId() {
        return originalQuestionId;
    }

    public void setOriginalQuestionId(Long originalQuestionId) {
        this.originalQuestionId = originalQuestionId;
    }


    @ElementCollection
    @CollectionTable(name = "question_tags", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Embedded
    private Stats stats;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

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

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    @Embeddable
    public static class Stats {

        private String mean;
        private String median;
        private String stdDev;
        private String min;
        private String max;

        public Stats() {
            this.mean = "N/A";
            this.median = "N/A";
            this.stdDev = "N/A";
            this.min = "N/A";
            this.max = "N/A";
        }

        public Stats(String mean, String median, String stdDev, String min, String max) {
            this.mean = mean;
            this.median = median;
            this.stdDev = stdDev;
            this.min = min;
            this.max = max;
        }

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
