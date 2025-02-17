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

    @GetMapping(value = "/{templateName}/{assignmentId}", produces = "text/plain")
    public ResponseEntity<String> getLatexForAssignment(
            @PathVariable String templateName,
            @PathVariable Long assignmentId) {
        try {
            String latex = latexService.getLatex(templateName, assignmentId);
            return ResponseEntity.ok(latex);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body("Error generating LaTeX: " + e.getMessage());
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