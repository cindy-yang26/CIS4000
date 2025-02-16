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

            // get all questions for assignmnent + build question section
            List<Question> questions = assignment.getQuestions();
            StringBuilder questionsContent = new StringBuilder();
            for (int i = 0; i < questions.size(); i++) {
                Question question = questions.get(i);
                questionsContent.append("\\paragraph{Q").append(i + 1).append("}\n\n");
                
                String escapedText = escapeLatexSpecialChars(question.getText());
                questionsContent.append(escapedText).append("\n\n");
                questionsContent.append("\\vspace{2cm}\n\n"); // Space for answer
            }

            // Insert questions content into template after the begin comment
            int insertPos = latexTemplate.indexOf("% Begin\n") + "% Begin\n".length();
            String finalLatex = latexTemplate.substring(0, insertPos) + 
                               questionsContent.toString() + 
                               latexTemplate.substring(insertPos);

            return finalLatex;

        } catch (IOException e) {
            throw new RuntimeException("Error reading LaTeX template: " + e.getMessage());
        }
    }

    private String escapeLatexSpecialChars(String text) {
        return text.replace("&", "\\&")
                  .replace("%", "\\%")
                  .replace("$", "\\$")
                  .replace("#", "\\#")
                  .replace("_", "\\_")
                  .replace("{", "\\{")
                  .replace("}", "\\}")
                  .replace("~", "\\textasciitilde")
                  .replace("^", "\\textasciicircum")
                  .replace("\\", "\\textbackslash");
    }
}