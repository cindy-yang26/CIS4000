package com.cis4000.examify.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cis4000.examify.services.LatexService;

@RestController
@RequestMapping("/latex")
public class LatexController {

    public final LatexService latexService; 

    public LatexController(LatexService latexService) {
        this.latexService = latexService;
    }

    @GetMapping("/message")
    public String getMessage() {
        return latexService.sayHello();
    }

    // Endpoint to get raw LaTeX for a given assignment
    @GetMapping(value = "/{templateName}/{assignmentName}", produces = "text/plain")
    public String getLatexForAssignment(@PathVariable String templateName, @PathVariable String assignmentName) {
        return latexService.getLatex(templateName, assignmentName);
    }
}
