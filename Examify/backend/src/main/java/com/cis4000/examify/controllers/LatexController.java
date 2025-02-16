package com.cis4000.examify.controllers;

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

    @GetMapping(value = "/{templateName}/assignment/{assignmentId}", produces = "text/plain")
    public ResponseEntity<String> getLatexForAssignment(
            @PathVariable String templateName,
            @PathVariable Long assignmentId) {
        try {
            String latex = latexService.getLatex(templateName, assignmentId);
            return ResponseEntity.ok(latex);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error generating LaTeX: " + e.getMessage());
        }
    }
}