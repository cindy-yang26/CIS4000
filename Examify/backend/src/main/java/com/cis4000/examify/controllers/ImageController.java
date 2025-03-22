package com.cis4000.examify.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cis4000.examify.repositories.CourseRepository;
import com.cis4000.examify.services.S3Service;
import com.fasterxml.jackson.annotation.JsonProperty;

@RestController
@RequestMapping("/api/images")
public class ImageController extends BaseController {

    @Autowired
    private CourseRepository courseRepository;

    private final S3Service s3Service;

    public ImageController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @PostMapping
    public ResponseEntity<?> uploadImage(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @RequestBody UploadImageRequest payload) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        // Verify that the user has ownership of the course
        if (payload.courseId == null) {
            return ResponseEntity.badRequest().body("No course ID specified for image upload");
        }
        if (!courseRepository.findById(payload.courseId).map((course) -> userId.equals(course.getUserId()))
                .orElse(false)) {
            return userDoesntHaveAccessResponse();
        }

        if (payload.content == null || payload.content.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing or empty image");
        }

        // Call the S3Service to upload the base64 image and get the URL
        try {
            // TODO: upload to database as well
            String imageUrl = s3Service.uploadBase64Image(payload.fileExtension, payload.content);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error uploading image: " + e.getMessage());
        }
    }

    private static class UploadImageRequest {
        @JsonProperty("courseId")
        Long courseId;

        @JsonProperty("fileExt")
        String fileExtension;

        @JsonProperty("content")
        String content;
    }
}
