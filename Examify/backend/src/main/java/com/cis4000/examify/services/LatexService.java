package com.cis4000.examify.services;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
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
            LocalDate today = LocalDate.now();
            String formattedDate = formatPrettyDate(today);
            latexTemplate = latexTemplate.replace("{{course_code}}", courseCode);
            latexTemplate = latexTemplate.replace("{{exam_title}}", assignment.getName());
            latexTemplate = latexTemplate.replace("{{doc_title}}", assignment.getName());
            latexTemplate = latexTemplate.replace("{{doc_date}}", formattedDate);

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

                // new line before more data
                escapedText += "\n";

                // insert optional question type text
                String questionTypeOptionalText = questionTypeText(question);
                escapedText += questionTypeOptionalText + "\n";

                // insert optional solution text
                escapedText += questionSolutionText(question);

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

    // Google Docs Version
    public byte[] getDocxContent(String templateName, Long assignmentId) {
        try {
            // Create a new DOCX document
            XWPFDocument document = new XWPFDocument();
    
            // Add a title paragraph
            XWPFParagraph titleParagraph = document.createParagraph();
            XWPFRun titleRun = titleParagraph.createRun();
            titleRun.setBold(true);
            titleRun.setText("Assignment Title: ");
    
            // Fetch assignment from the database
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));
            
            String courseCode = assignment.getCourse().getCourseCode();
            String assignmentName = assignment.getName();
            
            // Add assignment details
            XWPFParagraph detailsParagraph = document.createParagraph();
            XWPFRun detailsRun = detailsParagraph.createRun();
            detailsRun.setText("Course: " + courseCode + " - Assignment: " + assignmentName);
    
            // Add questions to the document
            List<Question> questions = assignment.getQuestions();
            for (int i = 0; i < questions.size(); i++) {
                Question question = questions.get(i);
    
                // Add question number and title
                XWPFParagraph questionTitleParagraph = document.createParagraph();
                XWPFRun questionTitleRun = questionTitleParagraph.createRun();
                questionTitleRun.setBold(true);
                questionTitleRun.setText("Q" + (i + 1) + " " + question.getTitle());
    
                // Add question text
                XWPFParagraph questionTextParagraph = document.createParagraph();
                XWPFRun questionTextRun = questionTextParagraph.createRun();
                questionTextRun.setText(question.getText());
            }
    
            // Use ByteArrayOutputStream to capture the document's byte content
            try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {
                document.write(byteArrayOutputStream); // Write the document to the byte stream
                document.close();
                return byteArrayOutputStream.toByteArray(); // Return the byte array
            }
    
        } catch (IOException e) {
            throw new RuntimeException("Error creating DOCX content: " + e.getMessage(), e);
        }
    }

    
    private String escapeLatexSpecialChars(String text) {
        return text; // Function does nothing for now since we assume everything is LaTex.
        // return text.replace("\\", "\\\\")
        //            .replace("&", "\\&")
        //            .replace("%", "\\%")
        //            .replace("$", "\\$")
        //            .replace("#", "\\#")
        //            .replace("_", "\\_")
        //            .replace("{", "\\{")
        //            .replace("}", "\\}")
        //            .replace("~", "\\textasciitilde{}")
        //            .replace("^", "\\textasciicircum{}");  
    }

    private String questionTypeText(Question question) {
        if (question == null || question.getQuestionType() == null) {
            return "";
        }
        
        String questionType = question.getQuestionType();  // Store it to avoid multiple calls
        StringBuilder latex = new StringBuilder();

        switch (questionType) {
            case "multiple_choice_question":
                latex.append("\\begin{enumerate}[label=\\alph*)]\n");
                for (String s : question.getOptions()) {
                    latex.append("\\item ");
                    latex.append(s);
                    latex.append("\n");
                }
                latex.append("\\end{enumerate}\n");
            case "essay_question":
                break;
            case "true_false_question":
                latex.append("(Circle One)\n \n");
                latex.append("\\vspace{0.2 in}\n" + //
                                        "\\hspace{2 in} \\textbf{True} \\hspace{1 in} \\textbf{False} \\\\ \n");
                break;
            case "numerical_question":
                break;
            default:
                break;
        }
        return latex.toString();
    }

    private String questionSolutionText(Question question) {
        StringBuilder latex = new StringBuilder();
        String answer = Objects.requireNonNullElse(question.getCorrectAnswer(), "N/A");
        latex.append("\\ifsolutions\n");
        latex.append("\\vspace{0.2 in}\n");
        latex.append("\\noindent \\textbf{Solution:} ");
        latex.append(answer);
        latex.append("\n");
        latex.append("\\else\n");
        if ("essay_question".equals(question.getQuestionType()) || "numerical_question".equals(question.getQuestionType())) {
            latex.append("\\vspace{5 in}\n");
        }
        latex.append("\\fi\n");
        return latex.toString();
    }

    private static String formatPrettyDate(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d");
        String daySuffix = getDaySuffix(date.getDayOfMonth());
        return date.format(formatter) + daySuffix;
    }

    private static String getDaySuffix(int day) {
        if (day >= 11 && day <= 13) {
            return "th";
        }
        switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }
    
}