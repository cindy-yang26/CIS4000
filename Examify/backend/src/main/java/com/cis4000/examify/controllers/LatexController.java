package com.cis4000.examify.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cis4000.examify.services.LatexService;

@RestController
@RequestMapping("/latex")
public class LatexController {

    private final LatexService latexService;

    public LatexController(LatexService latexService) {
        this.latexService = latexService;
    }

    @GetMapping("/message")
    public String getMessage() {
        return latexService.sayHello();
    }

    @GetMapping(value = "/{templateName}/{assignmentId}", produces = "application/zip")
    public ResponseEntity<?> getLatexForAssignment(
            @PathVariable String templateName,
            @PathVariable Long assignmentId) {
        try {
            byte[] zipFile = latexService.getLatexZip(templateName, assignmentId);
            return ResponseEntity.ok(zipFile);
        } catch (Exception e) {
            System.out.println("JOEVER:" + e.getMessage());
            return ResponseEntity.badRequest().body("Error generating LaTeX: " + e.getMessage());
        }
    }

    @GetMapping(value = "/{templateName}/{assignmentId}/docs", produces = "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    public ResponseEntity<byte[]> getDocsForAssignment(@PathVariable String templateName,
            @PathVariable Long assignmentId) {
        try {
            // Call service to generate the .docx content (in byte[] format)
            byte[] docxFile = latexService.getDocxContent(templateName, assignmentId);

            // Set headers to indicate that this is a downloadable file
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=assignment_" + assignmentId + ".docx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(docxFile); // Explicitly return the byte[] as the body

        } catch (Exception e) {
            // Handle the case where there's an error generating the DOCX file
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Error generating Docs: " + e.getMessage()).getBytes());
        }
    }

    @GetMapping(value = "/{templateName}/{assignmentId}/pdf")
    public ResponseEntity<byte[]> getPdfForAssignment(
            @PathVariable String templateName,
            @PathVariable Long assignmentId) {
        try {
            byte[] pdf = latexService.getPdf(templateName, assignmentId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename",
                    String.format("%s_assignment_%d.pdf", templateName, assignmentId));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Error generating PDF: " + e.getMessage()).getBytes());
        }
    }
}