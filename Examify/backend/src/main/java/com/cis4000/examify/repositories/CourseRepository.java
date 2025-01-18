package com.cis4000.examify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cis4000.examify.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
  public final static String GET_ALL_COURSES = "SELECT course.*\n" + //
        "FROM sessions JOIN course ON sessions.user_id = course.user_id \n" + //
        "WHERE sessions.cookie = :cookie";

  @Query(value = GET_ALL_COURSES, nativeQuery = true)
  List<Course> findCoursesByCookie(@Param("cookie") String cookie);
}
