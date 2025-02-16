package com.cis4000.examify.services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.cis4000.examify.models.Assignment;
import com.cis4000.examify.models.Question;
import com.cis4000.examify.repositories.AssignmentRepository;

@Service
public class LatexService {
    private final AssignmentRepository assignmentRepository;
    private final PdfService pdfService;

    public LatexService(AssignmentRepository assignmentRepository, PdfService pdfService) {
        this.assignmentRepository = assignmentRepository;
        this.pdfService = pdfService;
    }

    public String sayHello() {
        return "Hello from Latex Service Gang!";
    }

    // Not working at the moment -- need to install pdflatex on system
    public byte[] getPdf(String templateName, Long assignmentId) throws IOException {
        String latex = getLatex(templateName, assignmentId);
        try {
            return pdfService.generatePdf(latex);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    public String getLatex(String templateName, Long assignmentId) {
        try {
            // load latex template file
            Path templatePath = new ClassPathResource("templates/" + templateName + ".tex").getFile().toPath();
            String latexTemplate = Files.readString(templatePath, StandardCharsets.UTF_8);

            // fetch assignment
            Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));
            
            // replace template variables
            String courseCode = assignment.getCourse().getCourseCode();
            latexTemplate = latexTemplate.replace("{{course_code}}", courseCode);
            latexTemplate = latexTemplate.replace("{{exam_title}}", assignment.getName());
            latexTemplate = latexTemplate.replace("{{doc_title}}", assignment.getName());

            // Find positions of `%begin`, `%beginQuestion`, and `%endQuestion`
            int beginIndex = latexTemplate.indexOf("%begin");
            if (beginIndex == -1) {
                throw new RuntimeException("Error: %begin not found in template.");
            }

            int beginQuestionIndex = latexTemplate.indexOf("%beginQuestion", beginIndex);
            int endQuestionIndex = latexTemplate.indexOf("%endQuestion", beginQuestionIndex);
            if (beginQuestionIndex == -1 || endQuestionIndex == -1) {
                throw new RuntimeException("Error: %beginQuestion or %endQuestion not found.");
            }

            // Extract question template between `%beginQuestion` and `%endQuestion`
            String questionTemplate = latexTemplate.substring(beginQuestionIndex + "%beginQuestion".length(), endQuestionIndex).trim();

            // Generate content for each question
            StringBuilder questionsContent = new StringBuilder();
            List<Question> questions = assignment.getQuestions();
            for (int i = 0; i < questions.size(); i++) {
                Question question = questions.get(i);

                // Replace `{{questionName}}` in the extracted question template
                String escaptedTitle = escapeLatexSpecialChars(question.getTitle());
                String questionInstance = questionTemplate.replace("{{questionName}}", "Q" + (i + 1) + " " + escaptedTitle);

                // Escape LaTeX special characters in question text
                String escapedText = escapeLatexSpecialChars(question.getText());
                questionInstance = questionInstance.replace("{{questionText}}", escapedText);    

                // Append formatted question instance
                questionsContent.append(questionInstance).append("\n");
            }

            // Construct final document
            String beforeQuestions = latexTemplate.substring(0, beginQuestionIndex);
            String afterQuestions = latexTemplate.substring(endQuestionIndex + "%endQuestion".length());

            return beforeQuestions + "\n" + questionsContent.toString() + "\n" + afterQuestions;

        } catch (IOException e) {
            throw new RuntimeException("Error reading LaTeX template: " + e.getMessage());
        }
    }

    private String escapeLatexSpecialChars(String text) {
        return text.replace("\\", "\\\\")
                   .replace("&", "\\&")
                   .replace("%", "\\%")
                   .replace("$", "\\$")
                   .replace("#", "\\#")
                   .replace("_", "\\_")
                   .replace("{", "\\{")
                   .replace("}", "\\}")
                   .replace("~", "\\textasciitilde{}")
                   .replace("^", "\\textasciicircum{}");  
    }
    
}