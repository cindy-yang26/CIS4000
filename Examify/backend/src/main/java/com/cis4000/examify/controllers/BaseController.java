package com.cis4000.examify.controllers;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.cis4000.examify.models.Sessions;
import com.cis4000.examify.repositories.SessionsRepository;

public class BaseController {

    @Autowired
    private SessionsRepository sessionsRepository;

    private boolean cookieIsExpired(Sessions session) {
        return session.getExpiration().isBefore(LocalDateTime.now());
    }

    protected Long getUserIdFromSessionCookie(String sessionCookie) {
        try {
            if (sessionCookie == null) {
                System.err.println("No cookie found");
                return null;
            }

            System.err.println("Looking for user for cookie " + sessionCookie);

            Optional<Sessions> session = sessionsRepository.findByCookie(sessionCookie);
            if (session.isEmpty()) {
                return null;
            }

            if (cookieIsExpired(session.get())) {
                System.err.println("cookie is expired");
                return null;
            }

            return session.get().getUserId();
        } catch (Exception e) {
            return null;
        }
    }

    protected static ResponseEntity<String> notLoggedInResponse() {
        System.err.println("Returning UNAUTHORIZED");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Need to log in first");
    }

    protected static ResponseEntity<String> userDoesntHaveAccessResponse() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User does not have access to requested resource");
    }
}
