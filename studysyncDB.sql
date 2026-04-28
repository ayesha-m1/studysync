-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: studysync
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `badge_icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_criteria` json DEFAULT NULL,
  `xp_reward` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'Early Bird','Complete 10 tasks before 9 AM','?','{\"type\": \"early_bird\", \"count\": 2}',100,'2026-04-20 05:54:21'),(2,'Night Owl','Complete 10 tasks after 10 PM','?','{\"type\": \"night_owl\", \"count\": 10}',100,'2026-04-20 05:54:21'),(3,'Marathon','Maintain a 30-day study streak','?','{\"days\": 30, \"type\": \"streak\"}',500,'2026-04-20 05:54:21'),(4,'Subject Master','Complete 10 tasks in one subject','?','{\"type\": \"subject_master\", \"count\": 4}',150,'2026-04-20 05:54:21'),(5,'Speed Demon','Complete 5 tasks before estimated time','⚡','{\"type\": \"speed_demon\", \"count\": 2}',200,'2026-04-20 05:54:21'),(6,'Perfect Week','Complete all tasks in a week','✨','{\"type\": \"perfect_week\", \"count\": 1}',300,'2026-04-20 05:54:21'),(7,'Dedicated','Study every day for 14 days','?','{\"days\": 14, \"type\": \"dedicated\"}',250,'2026-04-20 05:54:21'),(8,'Focus Master','Complete 10 Pomodoro sessions','?','{\"type\": \"focus_master\", \"count\": 10}',150,'2026-04-20 05:54:21');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `userId` int NOT NULL,
  `isPinned` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `category` enum('general','study','idea','reminder') COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'yellow',
  PRIMARY KEY (`id`),
  KEY `notes_userId_foreign_idx` (`userId`),
  CONSTRAINT `notes_userId_foreign_idx` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (1,'my new note','i will do something',8,0,'2026-04-20 19:32:15','2026-04-20 19:32:25','general','green'),(2,'math assignment','Start from 2nd part of the assignment',10,1,'2026-04-21 07:30:29','2026-04-21 07:30:47','study','yellow'),(3,'test note','this is test note',10,0,'2026-04-21 07:31:59','2026-04-21 07:31:59','general','green'),(4,'test note 3','remainder note',10,0,'2026-04-21 07:32:25','2026-04-21 07:32:25','reminder','pink'),(5,'idea note','have an idea to work on later',10,0,'2026-04-21 07:32:51','2026-04-21 07:32:51','idea','blue');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_sessions`
--

DROP TABLE IF EXISTS `study_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `study_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `task_id` int DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` decimal(10,2) DEFAULT '0.00',
  `session_type` enum('pomodoro','regular','focus') COLLATE utf8mb4_unicode_ci DEFAULT 'regular',
  `breaks_taken` int DEFAULT '0',
  `productivity_score` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `idx_user_sessions` (`user_id`,`start_time`),
  CONSTRAINT `study_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `study_sessions_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_sessions`
--

LOCK TABLES `study_sessions` WRITE;
/*!40000 ALTER TABLE `study_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `study_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_analytics`
--

DROP TABLE IF EXISTS `task_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `predicted_duration` decimal(10,2) DEFAULT '0.00',
  `actual_duration` decimal(10,2) DEFAULT '0.00',
  `difficulty_score` int DEFAULT '0',
  `focus_score` int DEFAULT '0',
  `completed_at` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_task_user` (`task_id`,`user_id`),
  CONSTRAINT `task_analytics_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_analytics_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_analytics`
--

LOCK TABLES `task_analytics` WRITE;
/*!40000 ALTER TABLE `task_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `dueDate` datetime NOT NULL,
  `progress` int NOT NULL DEFAULT '0',
  `status` enum('not-started','in-progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not-started',
  `estimatedTime` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Estimated time in hours',
  `timeSpent` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Actual time spent in hours',
  `timeSessions` json DEFAULT NULL COMMENT 'Array of time tracking sessions',
  `tags` json DEFAULT NULL,
  `isCompleted` tinyint(1) NOT NULL DEFAULT '0',
  `completedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_user_id` (`userId`),
  KEY `tasks_user_id_due_date` (`userId`,`dueDate`),
  KEY `tasks_user_id_priority` (`userId`,`priority`),
  KEY `tasks_user_id_subject` (`userId`,`subject`),
  KEY `tasks_user_id_status` (`userId`,`status`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (15,2,'Create table and add colums','add colums to database','Database','low','2026-02-03 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-02-03 13:50:12','2026-02-03 10:32:07','2026-02-03 13:50:12'),(16,2,'Lab work','OOP in javascript ','OOP','medium','2026-02-03 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-02-03 13:54:04','2026-02-03 13:53:59','2026-02-03 13:54:04'),(17,3,'Math quiz','complete all required chapters','Math','high','2026-03-05 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-03-04 04:37:56','2026-03-04 04:36:48','2026-03-04 04:37:56'),(18,4,'maths','asd','123','high','2026-03-17 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-03-16 01:29:03','2026-03-16 01:26:56','2026-03-16 01:29:03'),(19,4,'eng','qw','english','high','2026-03-17 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-03-16 01:29:16','2026-03-16 01:27:32','2026-03-16 01:29:16'),(20,6,'computer ','had to complete this tommowrow','Computer Science','medium','2026-03-23 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-03-23 17:34:49','2026-03-23 17:33:12','2026-03-23 17:34:49'),(21,6,'errert','etertert','database','high','2026-03-23 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-03-23 17:38:21','2026-03-23 17:36:56','2026-03-23 17:38:21'),(22,6,'egdf','dgdfgas','database','high','2026-03-25 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-03-23 17:52:29','2026-03-23 17:47:23','2026-03-23 17:52:29'),(23,7,'asd','asd','Computer Science','medium','2026-04-19 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-04-19 05:26:33','2026-04-19 05:26:25','2026-04-19 05:26:33'),(35,8,'sadas','asdasd','database','medium','2026-04-20 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 06:14:15','2026-04-20 06:14:10','2026-04-20 06:14:15'),(36,8,'asda','asdasd','adqw','medium','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 06:38:49','2026-04-20 06:38:47','2026-04-20 06:38:49'),(37,8,'Math Assignment ','Math Assignment adsd','math','medium','2026-04-20 00:00:00',100,'completed',0.00,5.00,'[]','[]',1,'2026-04-20 06:42:49','2026-04-20 06:42:47','2026-04-20 06:42:49'),(38,8,'Math Assignment 2','Math Assignment ','math','high','2026-04-20 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 06:43:07','2026-04-20 06:43:06','2026-04-20 06:43:07'),(39,8,'Math Assignment ','Math Assignment ','database','medium','2026-04-21 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 06:43:24','2026-04-20 06:43:22','2026-04-20 06:43:24'),(40,8,'Math Assignment ','Math Assignment ','math','high','2026-04-20 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-04-20 06:43:41','2026-04-20 06:43:39','2026-04-20 06:43:41'),(41,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-20 00:00:00',100,'completed',0.00,0.00,'[]','[]',1,'2026-04-20 06:46:05','2026-04-20 06:44:25','2026-04-20 06:46:05'),(42,8,'Math Assignment ','Math Assignment ','Math','medium','2026-04-20 00:00:00',100,'completed',0.00,5.00,'[]','[]',1,'2026-04-20 06:46:03','2026-04-20 06:44:42','2026-04-20 06:46:03'),(43,8,'Math Assignment 2','Math Assignment asdfa','math','medium','2026-04-20 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 06:45:49','2026-04-20 06:44:54','2026-04-20 06:45:49'),(44,8,'Math Assignment ','Math Assignment as','math','medium','2026-04-20 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 06:46:01','2026-04-20 06:45:05','2026-04-20 06:46:01'),(45,8,'Math Assignment ','asdMath Assignment ','math','medium','2026-04-20 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 06:45:58','2026-04-20 06:45:22','2026-04-20 06:45:58'),(46,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-20 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 06:45:51','2026-04-20 06:45:34','2026-04-20 06:45:51'),(47,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-20 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 06:45:53','2026-04-20 06:45:44','2026-04-20 06:45:53'),(48,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-20 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 06:46:35','2026-04-20 06:46:32','2026-04-20 06:46:35'),(49,8,'Math Assignment ','Math Assignment ','Math ','medium','2026-04-20 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 06:47:05','2026-04-20 06:47:01','2026-04-20 06:47:05'),(50,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-20 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 06:51:45','2026-04-20 06:51:36','2026-04-20 06:51:45'),(51,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 06:56:58','2026-04-20 06:56:56','2026-04-20 06:56:58'),(52,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 06:57:21','2026-04-20 06:57:16','2026-04-20 06:57:21'),(53,8,'Math Assignment ','Math Assignment ','math','high','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 07:04:56','2026-04-20 07:04:54','2026-04-20 07:04:56'),(54,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 07:05:09','2026-04-20 07:05:07','2026-04-20 07:05:09'),(55,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-21 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 07:05:45','2026-04-20 07:05:44','2026-04-20 07:05:45'),(56,8,'Math Assignment ','Math Assignment ','math','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 07:06:01','2026-04-20 07:05:59','2026-04-20 07:06:01'),(57,8,'computer science','computert','Computer Science','high','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 07:15:36','2026-04-20 07:15:35','2026-04-20 07:15:36'),(58,8,'computer science','adasda','Computer Science','high','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 07:15:56','2026-04-20 07:15:54','2026-04-20 07:15:56'),(59,8,'database','adasdas','Database','low','2026-04-20 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 08:09:14','2026-04-20 07:37:59','2026-04-20 08:09:14'),(60,8,'AI','asdadqw','ai','low','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 10:46:11','2026-04-20 10:46:08','2026-04-20 10:46:11'),(61,8,'ai','asdas','ai','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 10:46:31','2026-04-20 10:46:29','2026-04-20 10:46:31'),(62,8,'ai','asda','ai','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 10:46:47','2026-04-20 10:46:45','2026-04-20 10:46:47'),(63,8,'ai','asdasd','ai','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 10:47:00','2026-04-20 10:46:59','2026-04-20 10:47:00'),(64,8,'ai','asdasd','ai','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 11:00:23','2026-04-20 10:58:29','2026-04-20 11:00:23'),(65,8,'ai','adadas','ai','medium','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 11:00:29','2026-04-20 10:58:42','2026-04-20 11:00:29'),(66,8,'ai','aiasdasd','ai','medium','2026-04-21 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 11:00:28','2026-04-20 10:58:52','2026-04-20 11:00:28'),(67,8,'ai','asdasd','ai','medium','2026-04-21 00:00:00',100,'completed',0.00,5.00,'[]','[]',1,'2026-04-20 11:00:26','2026-04-20 11:00:21','2026-04-20 11:00:26'),(68,8,'Physics','asdasd','Physics','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 11:14:39','2026-04-20 11:14:07','2026-04-20 11:14:39'),(69,8,'Physics','Physicssaa','Physics','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 11:15:00','2026-04-20 11:14:15','2026-04-20 11:15:00'),(70,8,'Physics','asdasd','Physics','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 11:15:02','2026-04-20 11:14:27','2026-04-20 11:15:02'),(71,8,'Physics','Physics','sdas','medium','2026-04-21 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 11:14:37','2026-04-20 11:14:36','2026-04-20 11:14:37'),(72,8,'asd','dasd','asd','medium','2026-04-22 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 20:45:17','2026-04-20 20:45:04','2026-04-20 20:45:17'),(73,8,'asd','asd','asd','medium','2026-04-22 00:00:00',0,'not-started',0.00,2.00,'[]','[]',0,NULL,'2026-04-20 20:46:03','2026-04-20 20:46:03'),(74,9,'ai','asda','ai','medium','2026-04-22 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 20:58:46','2026-04-20 20:57:58','2026-04-20 20:58:46'),(75,9,'ai','aiasdasd','ai','medium','2026-04-22 00:00:00',100,'completed',0.00,2.00,'[]','[]',1,'2026-04-20 20:58:55','2026-04-20 20:58:16','2026-04-20 20:58:55'),(76,9,'ai','aisas','ai','medium','2026-04-22 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-20 20:58:52','2026-04-20 20:58:27','2026-04-20 20:58:52'),(77,9,'ai','aiadasd','ai','medium','2026-04-22 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 20:58:48','2026-04-20 20:58:43','2026-04-20 20:58:48'),(78,10,'ai','asdas','ai','medium','2026-04-22 00:00:00',100,'completed',0.00,4.00,'[]','[]',1,'2026-04-20 21:03:38','2026-04-20 21:03:37','2026-04-20 21:03:38'),(79,10,'ai','asdasd','ai','medium','2026-04-22 00:00:00',100,'completed',0.00,5.00,'[]','[]',1,'2026-04-20 21:03:52','2026-04-20 21:03:50','2026-04-20 21:03:52'),(80,10,'Math Assignment','Integral solving','math','high','2026-04-22 00:00:00',100,'completed',0.00,3.00,'[]','[]',1,'2026-04-21 07:45:07','2026-04-21 07:26:53','2026-04-21 07:45:07');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `badge_id` int NOT NULL,
  `earned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `displayed` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_badge` (`user_id`,`badge_id`),
  KEY `badge_id` (`badge_id`),
  KEY `idx_user_badges` (`user_id`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_badges`
--

LOCK TABLES `user_badges` WRITE;
/*!40000 ALTER TABLE `user_badges` DISABLE KEYS */;
INSERT INTO `user_badges` VALUES (1,8,4,'2026-04-20 12:12:06',1),(2,8,1,'2026-04-20 12:12:16',1),(4,8,5,'2026-04-20 16:14:38',1),(5,8,6,'2026-04-20 16:14:38',1),(6,9,5,'2026-04-21 01:58:48',1),(7,9,4,'2026-04-21 01:58:55',1),(8,10,5,'2026-04-21 02:03:52',1);
/*!40000 ALTER TABLE `user_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profilePicture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subjects` json DEFAULT NULL,
  `academicInfo` json DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `statistics` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `xp_points` int DEFAULT '0',
  `level` int DEFAULT '1',
  `badges` json DEFAULT NULL,
  `total_study_sessions` int DEFAULT '0',
  `longest_streak` int DEFAULT '0',
  `xp_history` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'john f','test@gmail.com','$2a$10$hstddqc8/Thpuzn.7YTXmeWuSMyBTaXvMu3OqQviTehr/QvDgVoCq',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-02-02 23:04:39','2026-02-02 23:04:39',0,1,NULL,0,0,NULL),(2,'john h','test@test.com','$2a$10$u9EIrN5nvFoUwqNukLqZeuR4bXvaVXZ1e/q//og69l7AZ5kpQgcZq',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-02-03 06:00:46','2026-02-03 06:00:46',0,1,NULL,0,0,NULL),(3,'Hassan','asd@gmail.com','$2a$10$.JUnno4ybGRpcDEuKQRSlOLeYKqWfJGue1fKsbtx2FtJqxIYs5Oiu',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-03-04 04:33:17','2026-03-04 04:34:45',0,1,NULL,0,0,NULL),(4,'muhammad Hassan','asdf@gmail.com','$2a$10$t5Q/EbikM2hoKfrcrwEMUud.cJI1U6/I7khtgbFR8U/kqcJ64Ep0y',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-03-16 01:24:07','2026-03-16 01:24:07',0,1,NULL,0,0,NULL),(5,'muhammad Hassan','hassan@gmail.com','$2a$10$nLe5JbwY8p7.gKQQb5PP8OmccYE/la053/I6k3JXFp11k/mi4UG1i',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-03-23 17:00:52','2026-03-23 17:00:52',0,1,NULL,0,0,NULL),(6,'muhammad Hassan','muhammadhassan7663@gmail.com','$2a$10$dy/bSNHLvw0MNDD1l18n6e3CUFlQbo6PWNi9qxqNqBaErNzFYxdTS',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-03-23 17:06:08','2026-03-23 17:06:08',0,1,NULL,0,0,NULL),(7,'hassan','qwer@gmail.com','$2a$10$2HsVbneMLaS2.ABfwLtUAeg6BCqeHRGT2zLvp8.G8Y0pCsuMNELoW',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-04-19 05:23:19','2026-04-19 05:23:19',0,1,NULL,0,0,NULL),(8,'hassan','hassan1@gmail.com','$2a$10$sz0mEOP.OcB9ZiM5bJIbtelUrOIiZPTlpzfBauOliy/ntO4S9yF3i',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-04-19 17:10:46','2026-04-20 20:45:17',3460,10,'[{\"id\": 4, \"name\": \"Subject Master\", \"earned_at\": \"2026-04-20T07:12:06.925Z\", \"badge_icon\": \"?\", \"description\": \"Complete 10 tasks in one subject\"}, {\"id\": 1, \"name\": \"Early Bird\", \"earned_at\": \"2026-04-20T11:14:38.297Z\", \"badge_icon\": \"?\", \"description\": \"Complete 10 tasks before 9 AM\"}, {\"id\": 5, \"name\": \"Speed Demon\", \"earned_at\": \"2026-04-20T11:14:38.323Z\", \"badge_icon\": \"⚡\", \"description\": \"Complete 5 tasks before estimated time\"}, {\"id\": 6, \"name\": \"Perfect Week\", \"earned_at\": \"2026-04-20T11:14:38.341Z\", \"badge_icon\": \"✨\", \"description\": \"Complete all tasks in a week\"}]',0,1,'[{\"amount\": 75, \"reason\": \"Task completed, First task of the day\", \"newTotal\": 75, \"timestamp\": \"2026-04-20T06:11:37.835Z\"}]'),(9,'hassan','hassan2@gmail.com','$2a$10$vTiQ1bKW6Nk7ucUqeVUQauha.DKTs8vptrcVTupkOlW94F26nk2LW',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-04-20 20:57:25','2026-04-20 20:58:55',730,5,'[{\"id\": 5, \"name\": \"Speed Demon\", \"earned_at\": \"2026-04-20T20:58:48.651Z\", \"badge_icon\": \"⚡\", \"description\": \"Complete 5 tasks before estimated time\"}, {\"id\": 4, \"name\": \"Subject Master\", \"earned_at\": \"2026-04-20T20:58:55.754Z\", \"badge_icon\": \"?\", \"description\": \"Complete 10 tasks in one subject\"}]',0,1,'[]'),(10,'hassan','hassan3@gmail.com','$2a$10$at6wUPe53fmebYTW8t61Fee1nHGI4YegwgNOA9vT8t5UghFaJzmdS',NULL,'[]','{\"year\": \"\", \"course\": \"\", \"institution\": \"\"}','{\"notifications\": true, \"studyGoalHours\": 25}','{\"currentStreak\": 0, \"lastStudyDate\": null, \"totalStudyHours\": 0, \"totalTasksCreated\": 0, \"totalTasksCompleted\": 0}','2026-04-20 21:02:50','2026-04-21 07:45:08',515,4,'[{\"id\": 5, \"name\": \"Speed Demon\", \"earned_at\": \"2026-04-20T21:03:52.543Z\", \"badge_icon\": \"⚡\", \"description\": \"Complete 5 tasks before estimated time\"}]',0,1,'[]');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 17:46:52
