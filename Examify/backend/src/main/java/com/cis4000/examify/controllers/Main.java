// package com.cis4000.examify.controllers;

// import java.io.IOException;

// public class Main {
//     public static void main(String[] args) {
//         String apiKey = "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";
//         LlmController openAIService = new LlmController(apiKey);

//         String exampleText = """
//                 Question 1: Solve the integral of sin(x). 
//                 Part a: From 0 to pi.
//                 Part b: From -pi to pi.
                
//                 Question 2: Find the derivative of x^2.
//                 """;

//         try {
//             String groupedQuestions = openAIService.splitTextIntoQuestions(exampleText);
//             System.out.println("Grouped Questions:\n" + groupedQuestions);
//         } catch (IOException e) {
//             System.err.println("Error: " + e.getMessage());
//         }
//     }
// }
