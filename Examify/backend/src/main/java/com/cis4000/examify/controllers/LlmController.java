package com.cis4000.examify.controllers;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;

import okhttp3.*;


import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class LlmController {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-3.5-turbo";

    @Value("${OPENAPI_KEY}")
    private String apiKey;

    @PostMapping
    public ResponseEntity<?> splitTextIntoQuestions(@RequestBody Map<String, String> payload) {
        try {
            String text = payload.get("content");
            if (text == null || text.isEmpty()) {
                return ResponseEntity.badRequest().body("Content cannot be empty.");
            }

            String result = generateQuestions(text);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    private String generateQuestions(String text) throws IOException {
        String prompt = """
                Group the following text into distinct questions, ensuring sub-questions like 'Part a', 'Part b', etc., are grouped under their respective main question. Split it into as few main questions as possible. For each question, generate:
                - A title summarizing the main idea if one is not already provided.
                - 2-3 relevant tags that categorize the question.
                - Identify the **question type**: multiple_choice_question, true_false_question, numerical_question, or essay_question.
                - Extract answer choices for **MCQ** questions and enclose them in a **structured list format**.
                - Extract the **correct answer** if available, otherwise, set it to "N/A".
                - Remove any multiple-choice letter labels (A, B, C, D) and format choices **cleanly**.
                - Ensure true/false questions do **not** include "(True/False?)" in the text.

                Format each question as follows:

                Title: [Generated or provided title]  
                Tags: [Tag1, Tag2, Tag3]  
                Question Type: [multiple_choice_question | true_false_question | numerical_question | essay_question]  
                Question: [Question text]  
                Choices: [Choice 1 || Choice 2 || Choice 3 || Choice 4]  (Only for MCQ)  
                Correct Answer: [TRUE_FALSE || True] (Only for True/False)
                Correct Answer: [Answer] (For MCQ/Numerical)

                Important!: Add `===END===` at the end of each question to denote its end:

                %s
                """.formatted(text);

        ObjectMapper objectMapper = new ObjectMapper();
        String requestBody = objectMapper.writeValueAsString(
                new ChatCompletionRequest(MODEL, "You are a helpful assistant.", prompt)
        );

        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url(OPENAI_API_URL)
                .post(okhttp3.RequestBody.create(MediaType.parse("application/json"), requestBody))
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code: " + response);
            }

            JsonNode responseBody = objectMapper.readTree(response.body().string());
            return responseBody.get("choices").get(0).get("message").get("content").asText().trim();
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
