package com.cis4000.examify.controllers;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.view.RedirectView;

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
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Received login request for username: " + loginRequest.getUsername());

        Optional<Sessions> sessionsOptional = sessionsRepository.findByCookie(loginRequest.getCookie());
        if (!sessionsOptional.isEmpty()) {
            return ResponseEntity.ok("Login successful with cookie " + loginRequest.getCookie());
        }

        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid credentials");
        }

        User user = userOptional.get();

        // Using BCrypt to decrypt and hash the password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid credentials");
        }

        // Check the cookie of the loginRequest. If not exists, fail login.
        String cookie = loginRequest.getCookie();
        if (cookie == null) {
            return ResponseEntity.status(HttpStatus.I_AM_A_TEAPOT)
                    .body("Error: Cookie not found with request");
        }
        Sessions sessions = new Sessions();
        sessions.setCookie(cookie);
        sessions.setId(user.getId());
        LocalDateTime expiration = LocalDateTime.now().plusDays(30);
        sessions.setExpiration(expiration);
        sessionsRepository.save(sessions);

        return ResponseEntity.ok("Login successful for " + loginRequest.getUsername());
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

        return ResponseEntity.ok("User registered successfully!");
    }

    @GetMapping("/redirect")
    public RedirectView redirectToLogin() {
        return new RedirectView("/api/auth/login");
    }

    public static class LoginRequest {
        private String username;
        private String password;
        private String cookie;

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

        public String getCookie() {
            return cookie;
        }

        public void setCookie(String cookie) {
            this.cookie = cookie;
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