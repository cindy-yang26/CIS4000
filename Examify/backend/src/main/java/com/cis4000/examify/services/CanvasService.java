// package com.cis4000.examify.services;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.http.*;
// import org.springframework.stereotype.Service;
// import org.springframework.web.client.RestTemplate;

// import java.util.HashMap;
// import java.util.Map;

// @Service
// public class CanvasService {
    
//     @Value("${canvas.token}")
//     private String token;

//     private static final String CANVAS_API_URL = "https://canvas.instructure.com/api/v1/courses/{course_id}/assignments";

//     public String uploadAssignment(int courseId, String name, String description) {
//         // RestTemplate restTemplate = new RestTemplate();

//         // String url = CANVAS_API_URL.replace("{course_id}", String.valueOf(courseId));

//         // HttpHeaders headers = new HttpHeaders();
//         // headers.set("Authorization", "Bearer " + token);
//         // headers.setContentType(MediaType.APPLICATION_JSON);

//         // Map<String, Object> requestBody = new HashMap<>();
//         // requestBody.put("name", name);
//         // requestBody.put("description", description);
//         // requestBody.put("submission_types", new String[]{"online_text_entry"});
//         // requestBody.put("published", true);

//         // HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
//         // ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

//         return "SUP";
//     }
// }
