package com.cis4000.examify.controllers;

import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cis4000.examify.models.Image;
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
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.cis4000.examify.repositories.ImageRepository;

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

    @Autowired
    private ImageRepository imageRepository;

    private boolean belongsToUser(Question question, Long userId) {
        if (question == null || question.getCourseId() == null) {
            return false;
        }

        return courseRepository.findById(question.getCourseId()).map(course -> {
            return course.getUserId() != null && course.getUserId().equals(userId);
        }).orElse(false);
    }

    @PostMapping("{id}/create-variant")
    public ResponseEntity<?> createQuestionVariant(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
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

        ObfuscationResult obfuscationResult;
        try {
            obfuscationResult = generateObfuscatedText(originalQuestion.getText());
        } catch (IOException e) {
            System.out.println("Obfuscation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate obfuscated variant.");
        }

        Question variant = new Question();
        variant.setCourseId(originalQuestion.getCourseId());
        variant.setTitle(obfuscationResult.title);
        variant.setText(obfuscationResult.text);
        variant.setComment("");
        variant.setTags(new ArrayList<>(obfuscationResult.tags));
        variant.setQuestionType(obfuscationResult.questionType);
        variant.setCorrectAnswer(obfuscationResult.correctAnswer);
        variant.setStats(new com.cis4000.examify.models.Question.Stats());
        variant.setOriginalQuestionId(originalQuestion.getId());

        System.out.println("text:" + variant.getText());
        System.out.println("title:" + variant.getTitle());
        System.out.println("tags:" + variant.getTags());
        System.out.println("correct ans:" + variant.getCorrectAnswer());
        System.out.println("question type:" + variant.getQuestionType());

        if (originalQuestion.getOptions() != null) {
            variant.setOptions(new ArrayList<>(obfuscationResult.choices));
        } else {
            variant.setOptions(new ArrayList<>());
        }

        questionRepository.save(variant);

        return ResponseEntity.ok("Variant created successfully");
    }

    private ObfuscationResult generateObfuscatedText(String questionText) throws IOException {
        String prompt = """
                You are a question variant generator. Given a question, your goal is to create a new version that tests the **same core concept or skill**,
                but with as much variation as possible in its presentation.

                What to Change:
                - **Change the numerical values, units, or specific conditions** in the problem.
                - **Change the real-world context or scenario** (e.g., from a car on a hill to a box on a ramp).
                - **Change variable names or labels**.
                - **Reword the question structure** (don't just paraphrase — restructure it if possible).
                - Maintain mathematical integrity: all math should be valid and solvable.

                What to Keep:
                - The **underlying concept** (e.g., applying Pythagoras, solving for velocity, interpreting a graph).
                - If applicable, keep the structure of answer choices, but change their values and ordering.

                You must only create ONE variant.

                ⚠️ VERY IMPORTANT FORMATTING RULES ⚠️

                - You MUST wrap the **entire content** of each field (Question Type, Title, Tags, Question, Choices, Correct Answer) inside square brackets `[ ]`.
                - ❗ Do NOT use display-style labels like "Multiple Choice Question" — for Question Type you MUST use ONLY one of these exact values:
                  - multiple_choice_question
                  - true_false_question
                  - numerical_question
                  - essay_question
                - Tags and choices must be separated with `||`, but the full list must be wrapped in **one pair of brackets**.
                - Do NOT put individual brackets around each choice or tag.
                - The **Correct Answer** must exactly match one of the answer choices (or True/False/N/A depending on the question type).
                - You MUST include the following fields, and follow the format **EXACTLY** in both order and spacing:
                  - Question Type: [one_of_the_four_types]
                  - Title: [Your generated title]
                  - Tags: [Tag1 || Tag2 || Tag3]
                  - Question: [Your obfuscated question text]
                  - Choices: [Choice1 || Choice2 || Choice3 || Choice4]  ← Only for MCQ. Omit for essay.
                  - Correct Answer: [Correct Answer] ← Omit for essay.
                - Do NOT include any letter labels (A, B, etc.) in the choices.
                - For **True/False** questions, do NOT include "(True/False?)" in the question text.
                - For **essay** questions, omit the `Choices:` field entirely, but still include `Correct Answer: [N/A]`.

                ✅ Example — multiple_choice_question:
                Question Type: [multiple_choice_question]
                Title: [Physics of Gravity]
                Tags: [Physics || Gravity || Motion]
                Question: [What force causes an object to accelerate downward on Earth?]
                Choices: [Friction || Gravity || Magnetism || Inertia]
                Correct Answer: [Gravity]

                ---
                Original Question:
                %s
                """
                .formatted(questionText);

        ObjectMapper objectMapper = new ObjectMapper();
        String requestBody = objectMapper.writeValueAsString(
                new ChatCompletionRequest("gpt-3.5-turbo", "You are a helpful assistant.", prompt));

        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url("https://api.openai.com/v1/chat/completions")
                .post(okhttp3.RequestBody.create(requestBody, MediaType.parse("application/json")))
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code: " + response);
            }

            String content = objectMapper.readTree(response.body().string())
                    .get("choices").get(0).get("message").get("content").asText();

            System.out.println("=====================\n" + content + "\n=============");

            ObfuscationResult result = new ObfuscationResult();
            result.questionType = extractBracketValue(content, "Question Type:");
            result.title = extractBracketValue(content, "Title:");
            result.tags = extractList(content, "Tags:");
            result.text = extractBracketValue(content, "Question:");
            result.choices = extractList(content, "Choices:");
            result.correctAnswer = extractBracketValue(content, "Correct Answer:");
            return result;
        }
    }

    private String extractBracketValue(String content, String label) {
        String pattern = label + "\\s*\\[([^\\]]+)\\]";
        java.util.regex.Pattern regex = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher matcher = regex.matcher(content);

        if (matcher.find()) {
            String value = matcher.group(1).trim();
            System.out.println(label + " " + value);
            return value;
        }

        return "";
    }

    private List<String> extractList(String content, String label) {
        String value = extractBracketValue(content, label);
        if (value.isEmpty())
            return new ArrayList<>();

        return Arrays.stream(value.split("\\|\\|"))
                .map(s -> s.trim().replaceAll("^[A-D]\\)", ""))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private static class ObfuscationResult {
        public String questionType;
        public String title;
        public List<String> tags;
        public String text;
        public List<String> choices;
        public String correctAnswer;
    }

    @PostMapping
    public ResponseEntity<?> createQuestion(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @RequestBody QuestionRequest questionRequest) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            if (userId == null) {
                return notLoggedInResponse();
            }

            // Verify that the user has access to the course
            if (!courseRepository.findById(questionRequest.getCourseId())
                    .map(course -> userId.equals(course.getUserId()))
                    .orElse(false)) {
                return userDoesntHaveAccessResponse();
            }

            // Create the question
            Question question = new Question();
            question.setCourseId(questionRequest.getCourseId());
            question.setTitle(questionRequest.getTitle());
            question.setText(questionRequest.getText());
            question.setComment(questionRequest.getComment());
            question.setTags(questionRequest.getTags());
            question.setQuestionType(questionRequest.getQuestionType());
            question.setCorrectAnswer(questionRequest.getCorrectAnswer());
            question.setOptions(questionRequest.getOptions());

            if (questionRequest.getStats() != null) {
                Question.Stats stats = new Question.Stats();
                stats.setMean(questionRequest.getStats().getMean());
                stats.setMedian(questionRequest.getStats().getMedian());
                stats.setStdDev(questionRequest.getStats().getStdDev());
                stats.setMin(questionRequest.getStats().getMin());
                stats.setMax(questionRequest.getStats().getMax());
                question.setStats(stats);
            }

            // Associate images with the question
            if (questionRequest.getImageIds() != null) {
                Set<Image> images = new HashSet<>();
                for (Long imageId : questionRequest.getImageIds()) {
                    imageRepository.findById(imageId).ifPresent(images::add);
                }
                question.setImages(images);
            }

            // Save the question
            Question savedQuestion = questionRepository.save(question);

            return ResponseEntity.ok(savedQuestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating question: " + e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> editQuestion(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id,
            @RequestBody QuestionRequest questionRequest) {
        try {
            Long userId = getUserIdFromSessionCookie(sessionCookie);
            if (userId == null) {
                return notLoggedInResponse();
            }

            // Retrieve the existing question
            Optional<Question> questionOptional = questionRepository.findById(id);
            if (questionOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found");
            }

            Question question = questionOptional.get();

            // Verify that the user has access to this question
            if (!belongsToUser(question, userId)) {
                return userDoesntHaveAccessResponse();
            }

            // Update the question fields
            question.setTitle(questionRequest.getTitle());
            question.setText(questionRequest.getText());
            question.setComment(questionRequest.getComment());
            question.setTags(questionRequest.getTags());
            question.setQuestionType(questionRequest.getQuestionType());
            question.setOptions(questionRequest.getOptions());
            question.setCorrectAnswer(questionRequest.getCorrectAnswer());

            // Update the stats
            if (questionRequest.getStats() != null) {
                Question.Stats stats = new Question.Stats();
                stats.setMean(questionRequest.getStats().getMean());
                stats.setMedian(questionRequest.getStats().getMedian());
                stats.setStdDev(questionRequest.getStats().getStdDev());
                stats.setMin(questionRequest.getStats().getMin());
                stats.setMax(questionRequest.getStats().getMax());
                question.setStats(stats);
            }

            // Update the associated images
            if (questionRequest.getImageIds() != null) {
                Set<Image> images = new HashSet<>();
                for (Long imageId : questionRequest.getImageIds()) {
                    imageRepository.findById(imageId).ifPresent(images::add);
                }
                question.setImages(images); // Set the new images
            } else {
                question.setImages(new HashSet<>()); // Clear images if no IDs are provided
            }

            // Save the updated question
            questionRepository.save(question);

            return ResponseEntity.ok("Question updated successfully");
        } catch (Exception e) {
            System.err.println("Error updating question: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating question: " + e.getMessage());
        }
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
    public ResponseEntity<?> getQuestionVariants(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
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
        private Long courseId;
        private String title;
        private String text;
        private String comment;
        private List<String> tags;
        private Stats stats;
        private String questionType;
        private String correctAnswer;
        private List<String> options;
        private List<Long> imageIds; // Use List<String> for image URLs

        // Getters and Setters
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

        public String getCorrectAnswer() {
            return correctAnswer;
        }

        public void setCorrectAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer;
        }

        public List<String> getOptions() {
            return options;
        }

        public void setOptions(List<String> options) {
            this.options = options;
        }

        public List<Long> getImageIds() {
            return imageIds;
        }

        public void setImageIds(List<Long> imageIds) {
            this.imageIds = imageIds;
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
            this.messages = new Message[] {
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