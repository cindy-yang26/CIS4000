package com.cis4000.examify.controllers;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
// import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.web.servlet.view.RedirectView;

import com.cis4000.examify.models.Sessions;
import com.cis4000.examify.models.User;
import com.cis4000.examify.repositories.SessionsRepository;
import com.cis4000.examify.repositories.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final SessionsRepository sessionsRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, SessionsRepository sessionsRepository) {
        this.userRepository = userRepository;
        this.sessionsRepository = sessionsRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @CookieValue(name = "sessionId", required = false) String sessionCookie,
            @RequestBody LoginRequest loginRequest) {

        System.out.println("Received login request: User: " + loginRequest.getUsername() + " Cookie: " + sessionCookie);
        // If cookie exists and is not expired, then log in. If it does not exist or is
        // expired, generate a new one and check login info
        String cookie = sessionCookie;
        Optional<Sessions> sessionsOptional = sessionsRepository.findByCookie(cookie);
        if (sessionsOptional.isPresent() && LocalDateTime.now().isBefore(sessionsOptional.get().getExpiration())) {
            return ResponseEntity.ok("Login successful with cookie " + cookie);
        } else {
            cookie = java.util.UUID.randomUUID().toString();
            System.out.println("No cookie found. Generated new cookie: " + cookie);
        }

        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid credentials");
        }

        User user = userOptional.get();

        // Using BCrypt to check password match
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid credentials");
        }

        System.out.println("User and password matched, adding new cookie to database.");

        // Update / create a cookie in the database, and send it back to user.
        Sessions sessions = new Sessions();
        sessions.setCookie(cookie);
        sessions.setUserId(user.getId());
        LocalDateTime expiration = LocalDateTime.now().plusDays(30);
        sessions.setExpiration(expiration);
        sessionsRepository.save(sessions);

        System.out.println("Added cookie to database. Sending response.");

        ResponseCookie responseCookie = ResponseCookie.from("sessionId", cookie)
                .maxAge(30 * 24 * 60 * 60)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body("Login successful for " + loginRequest.getUsername());
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest signupRequest) {
        if (signupRequest.getPassword() == null || signupRequest.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body("Error: Password must be at least 8 characters long");
        }

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());

        // Using BCrypt to salt and hash the password
        String hashedPassword = passwordEncoder.encode(signupRequest.getPassword());
        user.setPassword(hashedPassword);

        userRepository.save(user);

        // Create and save session cookie
        String cookie = java.util.UUID.randomUUID().toString();
        Sessions sessions = new Sessions();
        sessions.setCookie(cookie);
        sessions.setUserId(user.getId());
        LocalDateTime expiration = LocalDateTime.now().plusDays(30);
        sessions.setExpiration(expiration);
        sessionsRepository.save(sessions);

        // Create response cookie
        ResponseCookie responseCookie = ResponseCookie.from("sessionId", cookie)
                .maxAge(30 * 24 * 60 * 60)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body("User registered successfully!");
    }

    // TODO: this is unused ancd should probably be deleted
    // @GetMapping("/redirect")
    // public RedirectView redirectToLogin() {
    // return new RedirectView("/api/auth/login");
    // }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@CookieValue(name = "sessionId", required = false) String sessionCookie) {
        if (sessionCookie == null) {
            return ResponseEntity.ok("Successfully logged out");
        }

        try {
            sessionsRepository.deleteById(sessionCookie);
            return ResponseEntity.ok("Successfully logged out and removed all traces of session and cookie");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("error logging out: " + e);
        }
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class SignupRequest {
        private String username;
        private String email;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}