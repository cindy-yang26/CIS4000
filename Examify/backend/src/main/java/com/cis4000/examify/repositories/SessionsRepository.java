package com.cis4000.examify.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cis4000.examify.models.Sessions;

public interface SessionsRepository extends JpaRepository<Sessions, String> {
    Optional<Sessions> findByCookie(String cookie);
    void deleteByCookie(String cookie);
}