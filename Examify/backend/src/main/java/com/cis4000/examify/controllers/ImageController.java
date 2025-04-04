package com.cis4000.examify.controllers;

import java.util.HashMap;
import java.util.Optional;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cis4000.examify.models.Image;
import com.cis4000.examify.repositories.CourseRepository;
import com.cis4000.examify.repositories.ImageRepository;
import com.cis4000.examify.services.S3Service;
import com.fasterxml.jackson.annotation.JsonProperty;

@RestController
@RequestMapping("/api/images")
public class ImageController extends BaseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private S3Service s3Service;

    private static class UploadImageRequest {
        @JsonProperty("courseId")
        Long courseId;

        @JsonProperty("fileExt")
        String fileExtension;

        @JsonProperty("content")
        String content;
    }

    @PostMapping
    public ResponseEntity<?> uploadImage(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @RequestBody UploadImageRequest payload) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
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
            String imageUrl = s3Service.uploadBase64Image(payload.fileExtension, payload.content);

            Image image = new Image();
            image.setCourseId(payload.courseId);
            image.setUrl(imageUrl);
            Image savedImage = imageRepository.save(image);

            Map<String, Object> response = new HashMap<>();
            response.put("imageId", savedImage.getId()); // Include the image ID
            response.put("imageUrl", savedImage.getUrl()); // Include the image URL

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error uploading image: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteImage(@CookieValue(name = "sessionId", required = false) String sessionCookie,
            @PathVariable Long id) {
        Long userId = getUserIdFromSessionCookie(sessionCookie);
        // User needs to log in first
        if (userId == null) {
            return notLoggedInResponse();
        }

        if (id == null) {
            return ResponseEntity.badRequest().body("No ID specified for image to delete");
        }

        Image image;
        try {
            Optional<Image> imageOpt = imageRepository.findById(id);
            if (imageOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            image = imageOpt.get();

            if (!courseRepository.findById(image.getCourseId()).map((course) -> userId.equals(course.getUserId()))
                    .orElse(false)) {
                return userDoesntHaveAccessResponse();
            }

            s3Service.deleteImage(image.getUrl());

            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }
}
