package com.cis4000.examify.services;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class PdfService {
    
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir");
    
    public byte[] generatePdf(String latexContent) throws IOException {
        // Create a unique temporary directory for this compilation
        String uniqueId = UUID.randomUUID().toString();
        Path tempDir = Files.createTempDirectory(uniqueId);
        
        try {
            // Create temporary .tex file
            File texFile = new File(tempDir.toFile(), "document.tex");
            FileUtils.writeStringToFile(texFile, latexContent, "UTF-8");
            
            // Run pdflatex command
            ProcessBuilder pb = new ProcessBuilder(
                "pdflatex",
                "-interaction=nonstopmode",
                "-output-directory=" + tempDir.toString(),
                texFile.getAbsolutePath()
            );
            
            Process process = pb.start();
            boolean completed = process.waitFor(30, TimeUnit.SECONDS);
            
            if (!completed) {
                process.destroyForcibly();
                throw new RuntimeException("PDF generation timed out");
            }
            
            if (process.exitValue() != 0) {
                throw new RuntimeException("PDF generation failed with exit code: " + process.exitValue());
            }
            
            // Read the generated PDF
            File pdfFile = new File(tempDir.toFile(), "document.pdf");
            if (!pdfFile.exists()) {
                throw new RuntimeException("PDF file was not generated");
            }
            
            return FileUtils.readFileToByteArray(pdfFile);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("PDF generation was interrupted", e);
        } finally {
            // Clean up temporary directory
            FileUtils.deleteDirectory(tempDir.toFile());
        }
    }
}