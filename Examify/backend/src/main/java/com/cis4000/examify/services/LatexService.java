package com.cis4000.examify.services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class LatexService {
    public String sayHello() {
        return "Hello from Latex Service Gang!";
    }

    public String getLatex(String templateName, String assignmentName) {
        // Simulated LaTeX generation (replace this with actual logic)
        try {
            // Load the template file from resources
            Path templatePath = new ClassPathResource("templates/" + templateName + ".tex").getFile().toPath();
            
            // Read file contents as a string
            String latexTemplate = Files.readString(templatePath, StandardCharsets.UTF_8);

            // (Optional) Replace placeholder text in the template with assignment-specific data
            latexTemplate = latexTemplate.replace("{{course_number}}", assignmentName);
            latexTemplate =  latexTemplate.replace("{{course_title}}", assignmentName);
            latexTemplate = latexTemplate.replace("{{exam_title}}", assignmentName);
            latexTemplate = latexTemplate.replace("{{doc_title}}", assignmentName);

            return latexTemplate;
        } catch (IOException e) {
            e.printStackTrace();
            return "Error: Could not read the LaTeX template file.";
        }
    }
}
