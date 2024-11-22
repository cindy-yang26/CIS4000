CREATE DATABASE examify_alpha;

USE examify_alpha;

CREATE TABLE course (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    professor VARCHAR(100) NOT NULL,
    CONSTRAINT uc_course UNIQUE (course_code, professor)
);

CREATE TABLE assignment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    assignment_name VARCHAR(100) NOT NULL,
    semester_year VARCHAR(20) NOT NULL,
    statistics JSON,
    comment VARCHAR(1024),
    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    comment TEXT,
    image_url VARCHAR(255)  -- Assuming this stores the S3 bucket URL
);

CREATE TABLE tag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag TEXT NOT NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
);

-- Creating the Statistics table
CREATE TABLE statistics (
    assignment_id INT NOT NULL,
    question_id INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    statistics TEXT,
    PRIMARY KEY (assignment_id, question_id, semester),
    FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
);

-- Creating the Variations table
CREATE TABLE variations (
    variation_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    assignment_id INT NULL, -- Nullable assignment_id
    text TEXT,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE SET NULL
);
