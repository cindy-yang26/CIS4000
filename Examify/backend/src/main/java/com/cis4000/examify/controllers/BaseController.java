package com.cis4000.examify.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import com.cis4000.examify.models.Sessions;
import com.cis4000.examify.repositories.SessionsRepository;

import jakarta.servlet.http.HttpSession;

public class BaseController {
    @Autowired
    private SessionsRepository sessionsRepository;

    protected Long getUserIdOfSession(HttpSession session) {
        try {
            String sessionId = session.getId();
            Optional<Sessions> sessionRowOpt = sessionsRepository.findByCookie(sessionId);
            if (sessionRowOpt.isEmpty()) {
                return null;
            }
            return sessionRowOpt.get().getUserId();
        } catch (Exception e) {
            return null;
        }
    }
}
