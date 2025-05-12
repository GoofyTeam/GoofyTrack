-- Database schema for GoofyTrack Event Management application
-- Compatible with Prisma and Next.js

-- Roles table for user types
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table with role
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rooms table for event venues
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subjects/topics for talks
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Talks table for presentations
CREATE TABLE IF NOT EXISTS `talks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `speaker_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
  `level` enum('beginner', 'intermediate', 'advanced', 'expert') NOT NULL DEFAULT 'intermediate',
  `status` enum('pending', 'accepted', 'rejected', 'scheduled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `speaker_id` (`speaker_id`),
  KEY `subject_id` (`subject_id`),
  KEY `status` (`status`),
  CONSTRAINT `talks_speaker_id_fk` FOREIGN KEY (`speaker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `talks_subject_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schedule table for talk time slots
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `talk_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `talk_id` (`talk_id`),
  KEY `room_id` (`room_id`),
  KEY `start_time` (`start_time`),
  CONSTRAINT `schedules_talk_id_fk` FOREIGN KEY (`talk_id`) REFERENCES `talks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedules_room_id_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `check_schedule_times` CHECK (`end_time` > `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User favorites
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `talk_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_talk_id` (`user_id`, `talk_id`),
  KEY `talk_id` (`talk_id`),
  CONSTRAINT `favorites_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_talk_id_fk` FOREIGN KEY (`talk_id`) REFERENCES `talks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedback for talks
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `talk_id` int(11) NOT NULL,
  `rating` tinyint(1) NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_talk_id` (`user_id`, `talk_id`),
  KEY `talk_id` (`talk_id`),
  CONSTRAINT `feedback_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_talk_id_fk` FOREIGN KEY (`talk_id`) REFERENCES `talks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial roles
INSERT INTO `roles` (`name`) VALUES
('admin'),
('organizer'),
('speaker'),
('attendee');

-- Insert sample users (password is 'password' hashed)
INSERT INTO `users` (`username`, `email`, `password`, `role_id`, `bio`) VALUES
('admin', 'admin@goofytrack.com', '$2a$12$1InE4CIRl2M8f8H0TGmVpOWY.NZcKm7zlSJr.HHze4SfIvIKh4F4q', 1, 'System administrator'),
('sarah_organizer', 'sarah@goofytrack.com', '$2a$12$1InE4CIRl2M8f8H0TGmVpOWY.NZcKm7zlSJr.HHze4SfIvIKh4F4q', 2, 'Lead organizer with 5+ years of experience in tech events'),
('david_speaker', 'david@example.com', '$2a$12$1InE4CIRl2M8f8H0TGmVpOWY.NZcKm7zlSJr.HHze4SfIvIKh4F4q', 3, 'Software architect specialized in distributed systems'),
('emma_speaker', 'emma@example.com', '$2a$12$1InE4CIRl2M8f8H0TGmVpOWY.NZcKm7zlSJr.HHze4SfIvIKh4F4q', 3, 'AI researcher and public speaker'),
('james_attendee', 'james@example.com', '$2a$12$1InE4CIRl2M8f8H0TGmVpOWY.NZcKm7zlSJr.HHze4SfIvIKh4F4q', 4, 'Full-stack developer looking to learn new technologies');

-- Insert rooms
INSERT INTO `rooms` (`name`, `capacity`, `description`) VALUES
('Amphitheatre A', 300, 'Main conference room with full A/V setup'),
('Room B', 150, 'Medium-sized workshop room'),
('Room C', 100, 'Medium-sized workshop room'),
('Room D', 80, 'Small presentation room'),
('Room E', 50, 'Small workshop room');

-- Insert subjects/topics
INSERT INTO `subjects` (`name`) VALUES
('Web Development'),
('DevOps'),
('Mobile Development'),
('Artificial Intelligence'),
('Cloud Computing'),
('Security'),
('Databases'),
('Blockchain');

-- Insert sample talks
INSERT INTO `talks` (`title`, `description`, `speaker_id`, `subject_id`, `duration`, `level`, `status`) VALUES
('Modern React Patterns', 'Explore the latest patterns and practices in React development including hooks, context, and suspense.', 3, 1, 45, 'intermediate', 'accepted'),
('Scaling Microservices with Kubernetes', 'A deep dive into managing microservices at scale using Kubernetes and service meshes.', 3, 2, 60, 'advanced', 'scheduled'),
('AI Ethics: Building Responsible Systems', 'Discussing the ethical implications of AI and how to build systems that are fair and transparent.', 4, 4, 45, 'beginner', 'pending'),
('Full-Stack TypeScript Applications', 'How to build end-to-end type-safe applications using TypeScript, React, and Node.js.', 4, 1, 90, 'intermediate', 'accepted');

-- Insert schedules for accepted talks
INSERT INTO `schedules` (`talk_id`, `room_id`, `start_time`, `end_time`) VALUES
(2, 1, '2025-06-15 10:00:00', '2025-06-15 11:00:00');

-- Insert sample favorites
INSERT INTO `favorites` (`user_id`, `talk_id`) VALUES
(5, 1),
(5, 2);

-- Insert sample feedback
INSERT INTO `feedback` (`user_id`, `talk_id`, `rating`, `comment`) VALUES
(5, 2, 5, 'Amazing talk! Learned a lot about Kubernetes.')
