package com.cis4000.examify.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.QuestionRepository;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import okhttp3.OkHttpClient;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.Response;

import com.cis4000.examify.repositories.CourseRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionsController extends BaseController {

    @Value("${openai.api.key}")
    private String apiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-3.5-turbo";

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

    @PostMapping("{id}/create-variant")
public ResponseEntity<?> createQuestionVariant(@CookieValue(name = "sessionId", required = false) String sessionCookie,
                                               @PathVariable Long id) {
    Long userId = getUserIdFromSessionCookie(sessionCookie);
    if (userId == null) {
        return notLoggedInResponse();
    }

    Optional<Question> originalQuestionOpt = questionRepository.findById(id);
    if (originalQuestionOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Original question not found");
    }

    Question originalQuestion = originalQuestionOpt.get();

    if (!belongsToUser(originalQuestion, userId)) {
        return userDoesntHaveAccessResponse();
    }

    // ✅ Directly call the internal obfuscation method (no API request needed!)
    String obfuscatedText;
    try {
        obfuscatedText = generateObfuscatedText(originalQuestion.getText());
    } catch (IOException e) {
        System.out.println("Obfuscation failed: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate obfuscated variant.");
    }

    Question variant = new Question();
    variant.setCourseId(originalQuestion.getCourseId());
    variant.setTitle(originalQuestion.getTitle() + " (Variant)");
    variant.setText(obfuscatedText);
    variant.setComment(originalQuestion.getComment());
    variant.setTags(new ArrayList<>(originalQuestion.getTags())); 
    variant.setQuestionType(originalQuestion.getQuestionType());
    variant.setCorrectAnswer(originalQuestion.getCorrectAnswer());
    variant.setOriginalQuestionId(originalQuestion.getId());
    variant.setStats(new com.cis4000.examify.models.Question.Stats());

    if (originalQuestion.getOptions() != null) {
        variant.setOptions(new ArrayList<>(originalQuestion.getOptions()));
    } else {
        variant.setOptions(new ArrayList<>()); 
    }

    questionRepository.save(variant);

    return ResponseEntity.ok("Variant created successfully");
}

private String generateObfuscatedText(String questionText) throws IOException {
    String prompt = """
            Transform the following question into a new version while ensuring it remains logically equivalent. 
            - **Modify numerical values** (e.g., 5 → 7, 10 → 12) while keeping calculations consistent.
            - **Change variables or labels** (e.g., "X" → "Y", "velocity" → "speed").
            - **Rephrase some wording** but ensure the question remains natural and clear.
            - **Mathematical notations and equations should remain valid**.
            - **Do NOT alter the question type** (e.g., multiple-choice remains multiple-choice).
            
            %s
            """.formatted(questionText);

    ObjectMapper objectMapper = new ObjectMapper();
    String requestBody = objectMapper.writeValueAsString(
            new ChatCompletionRequest("gpt-3.5-turbo", "You are a helpful assistant.", prompt)
    );

    OkHttpClient client = new OkHttpClient();
    Request request = new Request.Builder()
            .url("https://api.openai.com/v1/chat/completions")
            .post(okhttp3.RequestBody.create(requestBody, okhttp3.MediaType.get("application/json")))
            .addHeader("Authorization", "Bearer " + apiKey)
            .addHeader("Content-Type", "application/json")
            .build();

    try (Response response = client.newCall(request).execute()) {
        if (!response.isSuccessful()) {
            throw new IOException("Unexpected code: " + response);
        }

        // ✅ Read response body only ONCE and store it in a variable
        String responseBodyString = response.body().string();
        System.out.println("Obfuscation API Response: " + responseBodyString);

        JsonNode responseBody = objectMapper.readTree(responseBodyString);
        return responseBody.get("choices").get(0).get("message").get("content").asText().trim();
    }
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
        question.setQuestionType(questionRequest.getQuestionType());
        question.setOptions(questionRequest.getOptions());
        question.setCorrectAnswer(questionRequest.getCorrectAnswer());

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

    @GetMapping("{id}/variants")
    public ResponseEntity<?> getQuestionVariants(@CookieValue(name = "sessionId", required = false) String sessionCookie,
                                                 @PathVariable Long id) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        if (userId == null) {
            return notLoggedInResponse();
        }

        Optional<Question> originalQuestionOpt = questionRepository.findById(id);
        if (originalQuestionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Original question not found");
        }

        Question originalQuestion = originalQuestionOpt.get();
        if (!belongsToUser(originalQuestion, userId)) {
            return userDoesntHaveAccessResponse();
        }

        List<Question> variants = questionRepository.findByOriginalQuestionId(id);
        return ResponseEntity.ok(variants);
    }

    

    public static class QuestionRequest {
        private String title;
        private String text;
        private String comment;
        private List<String> tags;
        private Stats stats;
        private String questionType;
        private String correctAnswer;
        private List<String> options;

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

        public String getQuestionType() {
            return questionType;
        }

        public void setQuestionType(String questionType) {
            this.questionType = questionType;
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

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class ChatCompletionRequest {
        @JsonProperty("model")
        private String model;

        @JsonProperty("messages")
        private Message[] messages;

        public ChatCompletionRequest(String model, String systemMessage, String userMessage) {
            this.model = model;
            this.messages = new Message[]{
                    new Message("system", systemMessage),
                    new Message("user", userMessage)
            };
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public Message[] getMessages() {
            return messages;
        }

        public void setMessages(Message[] messages) {
            this.messages = messages;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class Message {
        @JsonProperty("role")
        private String role;

        @JsonProperty("content")
        private String content;

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
