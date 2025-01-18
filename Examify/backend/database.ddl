CREATE DATABASE examify_alpha;

USE examify_alpha;

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE course (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL, # TODO: make this NOT NULL once we figure out how to restrict courses to particular users
    course_code VARCHAR(50) NOT NULL,
    professor VARCHAR(100) NOT NULL,
    CONSTRAINT uc_course UNIQUE (course_code, professor),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE assignment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    semester_year VARCHAR(20) NOT NULL,
    statistics JSON,
    comment VARCHAR(1024),
    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    comment TEXT,
    mean VARCHAR(255),
    median VARCHAR(255),
    std_dev VARCHAR(255),
    min VARCHAR(255),
    max VARCHAR(255),
    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE assignment_question (
    assignment_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    statistics JSON,
    PRIMARY KEY (assignment_id, question_id),
    FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
);

CREATE TABLE question_tags (
    question_id BIGINT NOT NULL,
    tag VARCHAR(255),
    FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE variation (
    variation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    assignment_id BIGINT NULL, -- Nullable assignment_id
    text TEXT,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE SET NULL
);

CREATE TABLE sessions (
    cookie varchar(225),
    id bigint,
    expiration DATETIME,
    PRIMARY KEY (cookie),
    FOREIGN KEY (id) REFERENCES user(id)
);