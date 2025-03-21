-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: demo1_db
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_emailaddress`
--

DROP TABLE IF EXISTS `account_emailaddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_emailaddress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `verified` tinyint(1) NOT NULL,
  `primary` tinyint(1) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_emailaddress_user_id_email_987c8728_uniq` (`user_id`,`email`),
  KEY `account_emailaddress_email_03be32b2` (`email`),
  CONSTRAINT `account_emailaddress_user_id_2c513194_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_emailaddress`
--

LOCK TABLES `account_emailaddress` WRITE;
/*!40000 ALTER TABLE `account_emailaddress` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_emailaddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_emailconfirmation`
--

DROP TABLE IF EXISTS `account_emailconfirmation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_emailconfirmation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created` datetime(6) NOT NULL,
  `sent` datetime(6) DEFAULT NULL,
  `key` varchar(64) NOT NULL,
  `email_address_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` (`email_address_id`),
  CONSTRAINT `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` FOREIGN KEY (`email_address_id`) REFERENCES `account_emailaddress` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_emailconfirmation`
--

LOCK TABLES `account_emailconfirmation` WRITE;
/*!40000 ALTER TABLE `account_emailconfirmation` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_emailconfirmation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `album_album`
--

DROP TABLE IF EXISTS `album_album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album_album` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `popularity` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album_album`
--

LOCK TABLES `album_album` WRITE;
/*!40000 ALTER TABLE `album_album` DISABLE KEYS */;
INSERT INTO `album_album` VALUES (1,'/var/www/demo1/frontend/public/img/AlbumArt.png',1,'Album Art',24),(2,'/var/www/demo1/frontend/public/img/AlbumArt1.png',1,'Album Art 1',33);
/*!40000 ALTER TABLE `album_album` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `album_albumsong`
--

DROP TABLE IF EXISTS `album_albumsong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album_albumsong` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_album` bigint NOT NULL,
  `id_song` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album_albumsong`
--

LOCK TABLES `album_albumsong` WRITE;
/*!40000 ALTER TABLE `album_albumsong` DISABLE KEYS */;
/*!40000 ALTER TABLE `album_albumsong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `album_singeralbum`
--

DROP TABLE IF EXISTS `album_singeralbum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album_singeralbum` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_singer` bigint NOT NULL,
  `id_album` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album_singeralbum`
--

LOCK TABLES `album_singeralbum` WRITE;
/*!40000 ALTER TABLE `album_singeralbum` DISABLE KEYS */;
/*!40000 ALTER TABLE `album_singeralbum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add product',7,'add_product'),(26,'Can change product',7,'change_product'),(27,'Can delete product',7,'delete_product'),(28,'Can view product',7,'view_product'),(29,'Can add song',8,'add_song'),(30,'Can change song',8,'change_song'),(31,'Can delete song',8,'delete_song'),(32,'Can view song',8,'view_song'),(33,'Can add album',9,'add_album'),(34,'Can change album',9,'change_album'),(35,'Can delete album',9,'delete_album'),(36,'Can view album',9,'view_album'),(37,'Can add album song',10,'add_albumsong'),(38,'Can change album song',10,'change_albumsong'),(39,'Can delete album song',10,'delete_albumsong'),(40,'Can view album song',10,'view_albumsong'),(41,'Can add singer album',11,'add_singeralbum'),(42,'Can change singer album',11,'change_singeralbum'),(43,'Can delete singer album',11,'delete_singeralbum'),(44,'Can view singer album',11,'view_singeralbum'),(45,'Can add singer',12,'add_singer'),(46,'Can change singer',12,'change_singer'),(47,'Can delete singer',12,'delete_singer'),(48,'Can view singer',12,'view_singer'),(49,'Can add singer song',13,'add_singersong'),(50,'Can change singer song',13,'change_singersong'),(51,'Can delete singer song',13,'delete_singersong'),(52,'Can view singer song',13,'view_singersong'),(53,'Can add user',14,'add_user'),(54,'Can change user',14,'change_user'),(55,'Can delete user',14,'delete_user'),(56,'Can view user',14,'view_user'),(57,'Can add user album',15,'add_useralbum'),(58,'Can change user album',15,'change_useralbum'),(59,'Can delete user album',15,'delete_useralbum'),(60,'Can view user album',15,'view_useralbum'),(61,'Can add user singer',16,'add_usersinger'),(62,'Can change user singer',16,'change_usersinger'),(63,'Can delete user singer',16,'delete_usersinger'),(64,'Can view user singer',16,'view_usersinger'),(65,'Can add genre',17,'add_genre'),(66,'Can change genre',17,'change_genre'),(67,'Can delete genre',17,'delete_genre'),(68,'Can view genre',17,'view_genre'),(69,'Can add history',18,'add_history'),(70,'Can change history',18,'change_history'),(71,'Can delete history',18,'delete_history'),(72,'Can view history',18,'view_history'),(73,'Can add playlist',19,'add_playlist'),(74,'Can change playlist',19,'change_playlist'),(75,'Can delete playlist',19,'delete_playlist'),(76,'Can view playlist',19,'view_playlist'),(77,'Can add playlist song',20,'add_playlistsong'),(78,'Can change playlist song',20,'change_playlistsong'),(79,'Can delete playlist song',20,'delete_playlistsong'),(80,'Can view playlist song',20,'view_playlistsong'),(81,'Can add user',21,'add_user'),(82,'Can change user',21,'change_user'),(83,'Can delete user',21,'delete_user'),(84,'Can view user',21,'view_user'),(85,'Can add user album',22,'add_useralbum'),(86,'Can change user album',22,'change_useralbum'),(87,'Can delete user album',22,'delete_useralbum'),(88,'Can view user album',22,'view_useralbum'),(89,'Can add user singer',23,'add_usersinger'),(90,'Can change user singer',23,'change_usersinger'),(91,'Can delete user singer',23,'delete_usersinger'),(92,'Can view user singer',23,'view_usersinger'),(93,'Can add spotify user',24,'add_spotifyuser'),(94,'Can change spotify user',24,'change_spotifyuser'),(95,'Can delete spotify user',24,'delete_spotifyuser'),(96,'Can view spotify user',24,'view_spotifyuser'),(97,'Can add site',25,'add_site'),(98,'Can change site',25,'change_site'),(99,'Can delete site',25,'delete_site'),(100,'Can view site',25,'view_site'),(101,'Can add email address',26,'add_emailaddress'),(102,'Can change email address',26,'change_emailaddress'),(103,'Can delete email address',26,'delete_emailaddress'),(104,'Can view email address',26,'view_emailaddress'),(105,'Can add email confirmation',27,'add_emailconfirmation'),(106,'Can change email confirmation',27,'change_emailconfirmation'),(107,'Can delete email confirmation',27,'delete_emailconfirmation'),(108,'Can view email confirmation',27,'view_emailconfirmation'),(109,'Can add social account',28,'add_socialaccount'),(110,'Can change social account',28,'change_socialaccount'),(111,'Can delete social account',28,'delete_socialaccount'),(112,'Can view social account',28,'view_socialaccount'),(113,'Can add social application',29,'add_socialapp'),(114,'Can change social application',29,'change_socialapp'),(115,'Can delete social application',29,'delete_socialapp'),(116,'Can view social application',29,'view_socialapp'),(117,'Can add social application token',30,'add_socialtoken'),(118,'Can change social application token',30,'change_socialtoken'),(119,'Can delete social application token',30,'delete_socialtoken'),(120,'Can view social application token',30,'view_socialtoken');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (2,'pbkdf2_sha256$870000$o87aQziQUyF6LXujkFymII$zpPQFG2e8RQe3BxtE09fk2nC0KIkgLid8e9bT7jdnoY=','2025-03-17 13:20:30.272414',1,'admin','','','voquang17@gmail.com',1,1,'2025-03-01 08:55:52.982358');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2025-03-01 08:57:42.308512','1','user1',3,'',4,2),(2,'2025-03-01 09:57:35.554580','1','Iphone 12 promax',1,'[{\"added\": {}}]',7,2),(3,'2025-03-12 17:09:12.884832','1','Album Art',1,'[{\"added\": {}}]',9,2),(4,'2025-03-13 13:40:52.652224','1','gibao4222',1,'[{\"added\": {}}]',24,2),(5,'2025-03-15 11:38:54.723059','1','gibao4222',2,'[]',24,2),(6,'2025-03-17 13:39:25.494231','2','admin',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',4,2);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (26,'account','emailaddress'),(27,'account','emailconfirmation'),(1,'admin','logentry'),(9,'album','album'),(10,'album','albumsong'),(11,'album','singeralbum'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(17,'genre','genre'),(18,'history','history'),(19,'playlist','playlist'),(20,'playlist','playlistsong'),(7,'products','product'),(6,'sessions','session'),(12,'singer','singer'),(13,'singer','singersong'),(25,'sites','site'),(28,'socialaccount','socialaccount'),(29,'socialaccount','socialapp'),(30,'socialaccount','socialtoken'),(8,'song','song'),(24,'spotify_user','spotifyuser'),(21,'spotify_user','user'),(22,'spotify_user','useralbum'),(23,'spotify_user','usersinger'),(14,'user','user'),(15,'user','useralbum'),(16,'user','usersinger');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-02-26 13:59:17.132735'),(2,'auth','0001_initial','2025-02-26 13:59:18.319353'),(3,'admin','0001_initial','2025-02-26 13:59:18.580338'),(4,'admin','0002_logentry_remove_auto_add','2025-02-26 13:59:18.592692'),(5,'admin','0003_logentry_add_action_flag_choices','2025-02-26 13:59:18.601899'),(6,'contenttypes','0002_remove_content_type_name','2025-02-26 13:59:18.777345'),(7,'auth','0002_alter_permission_name_max_length','2025-02-26 13:59:18.889614'),(8,'auth','0003_alter_user_email_max_length','2025-02-26 13:59:18.921801'),(9,'auth','0004_alter_user_username_opts','2025-02-26 13:59:18.931415'),(10,'auth','0005_alter_user_last_login_null','2025-02-26 13:59:19.022266'),(11,'auth','0006_require_contenttypes_0002','2025-02-26 13:59:19.028378'),(12,'auth','0007_alter_validators_add_error_messages','2025-02-26 13:59:19.036851'),(13,'auth','0008_alter_user_username_max_length','2025-02-26 13:59:19.150291'),(14,'auth','0009_alter_user_last_name_max_length','2025-02-26 13:59:19.271726'),(15,'auth','0010_alter_group_name_max_length','2025-02-26 13:59:19.296399'),(16,'auth','0011_update_proxy_permissions','2025-02-26 13:59:19.305107'),(17,'auth','0012_alter_user_first_name_max_length','2025-02-26 13:59:19.426294'),(18,'sessions','0001_initial','2025-02-26 13:59:19.500179'),(20,'album','0001_initial','2025-03-12 15:42:07.294212'),(21,'genre','0001_initial','2025-03-12 15:42:07.341123'),(22,'history','0001_initial','2025-03-12 15:42:07.389163'),(23,'playlist','0001_initial','2025-03-12 15:42:07.463993'),(24,'singer','0001_initial','2025-03-12 15:42:07.542292'),(25,'song','0001_initial','2025-03-12 15:42:07.596144'),(26,'user','0001_initial','2025-03-12 15:42:07.715591'),(27,'spotify_user','0001_initial','2025-03-12 16:58:50.135327'),(28,'spotify_user','0002_auto_20250312_1657','2025-03-12 16:58:50.168454'),(29,'album','0002_alter_album_table_alter_albumsong_table_and_more','2025-03-12 17:35:43.082754'),(30,'genre','0002_alter_genre_table','2025-03-12 17:35:43.100807'),(31,'history','0002_alter_history_table','2025-03-12 17:35:43.108450'),(32,'playlist','0002_alter_playlist_table_alter_playlistsong_table','2025-03-12 17:35:43.114963'),(33,'singer','0002_alter_singer_table_alter_singersong_table','2025-03-12 17:35:43.121445'),(34,'song','0002_alter_song_table','2025-03-12 17:35:43.126318'),(35,'spotify_user','0003_spotifyuser_delete_user_alter_useralbum_table_and_more','2025-03-12 17:59:29.651430'),(36,'spotify_user','0004_delete_user_spotifyuser_groups_and_more','2025-03-15 11:19:52.513782'),(37,'spotify_user','0005_remove_spotifyuser_groups_and_more','2025-03-15 11:24:11.875507'),(38,'spotify_user','0006_auto_20250315_1134','2025-03-15 11:38:04.710961'),(39,'spotify_user','0007_remove_spotifyuser_author_id_remove_spotifyuser_role','2025-03-15 12:41:53.587680'),(40,'account','0001_initial','2025-03-15 14:28:40.407792'),(41,'account','0002_email_max_length','2025-03-15 14:28:40.443104'),(42,'account','0003_alter_emailaddress_create_unique_verified_email','2025-03-15 14:28:40.494292'),(43,'account','0004_alter_emailaddress_drop_unique_email','2025-03-15 14:28:40.575795'),(44,'account','0005_emailaddress_idx_upper_email','2025-03-15 14:28:40.665238'),(45,'account','0006_emailaddress_lower','2025-03-15 14:28:40.686490'),(46,'account','0007_emailaddress_idx_email','2025-03-15 14:28:40.803398'),(47,'account','0008_emailaddress_unique_primary_email_fixup','2025-03-15 14:28:40.822012'),(48,'account','0009_emailaddress_unique_primary_email','2025-03-15 14:28:40.842236'),(49,'sites','0001_initial','2025-03-15 14:28:40.896972'),(50,'sites','0002_alter_domain_unique','2025-03-15 14:28:40.937572'),(51,'socialaccount','0001_initial','2025-03-15 14:28:41.810324'),(52,'socialaccount','0002_token_max_lengths','2025-03-15 14:28:41.868215'),(53,'socialaccount','0003_extra_data_default_dict','2025-03-15 14:28:41.878120'),(54,'socialaccount','0004_app_provider_id_settings','2025-03-15 14:28:42.165494'),(55,'socialaccount','0005_socialtoken_nullable_app','2025-03-15 14:28:42.400755'),(56,'socialaccount','0006_alter_socialaccount_extra_data','2025-03-15 14:28:42.533045'),(57,'spotify_user','0008_spotifyuser_provider_spotifyuser_social_id','2025-03-15 14:28:42.581539');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('1lb8zlzuscdls93r8hq559vf7psdzd05','.eJxVjMsOgjAQRf-la9MwYDutS_d8QzOPYlEDCYWV8d-VhIVu7znnvkyibS1pq3lJo5qLac3pd2OSR552oHeabrOVeVqXke2u2INW28-an9fD_TsoVMu3RokBhM6efaMwBMQsLmZBCIPD7FXBU8fUUoyOA0rrEZxKbEA6YDbvD-wGOBE:1tuAgf:W4hyMRWjBlSTQGEdaFi0_y6o9L8iqGEFk_3RFMDWT4Y','2025-03-31 13:39:25.545342'),('xgaad0qa4g6yw3lubwf9p9q7m3khpglr','.eJxVjMsOwiAQRf-FtSE8ygAu3fsNZBgGWzUlKe3K-O_apAvd3nPOfYmE2zqmrfOSpiLOwojT75aRHjzvoNxxvjVJbV6XKctdkQft8toKPy-H-3cwYh-_NfuBPNUYIHoEMorYaRWwVCZtLVQCpU2M1jFYlx0ohd4USzEMkBnE-wPilzeC:1tsOVU:fOq9sWWDSiF2Y6mUIRXYG9itY_Bu6jU7EnOA02R3cCI','2025-03-26 16:00:32.431832');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_site`
--

DROP TABLE IF EXISTS `django_site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_site` (
  `id` int NOT NULL AUTO_INCREMENT,
  `domain` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_site_domain_a2e37b91_uniq` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_site`
--

LOCK TABLES `django_site` WRITE;
/*!40000 ALTER TABLE `django_site` DISABLE KEYS */;
INSERT INTO `django_site` VALUES (1,'example.com','example.com');
/*!40000 ALTER TABLE `django_site` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genre_genre`
--

DROP TABLE IF EXISTS `genre_genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genre_genre` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre_genre`
--

LOCK TABLES `genre_genre` WRITE;
/*!40000 ALTER TABLE `genre_genre` DISABLE KEYS */;
/*!40000 ALTER TABLE `genre_genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_history`
--

DROP TABLE IF EXISTS `history_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_song` bigint NOT NULL,
  `id_user` bigint NOT NULL,
  `listen_date` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_history`
--

LOCK TABLES `history_history` WRITE;
/*!40000 ALTER TABLE `history_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `history_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlist_playlist`
--

DROP TABLE IF EXISTS `playlist_playlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist_playlist` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `id_user` bigint NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist_playlist`
--

LOCK TABLES `playlist_playlist` WRITE;
/*!40000 ALTER TABLE `playlist_playlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlist_playlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlist_playlistsong`
--

DROP TABLE IF EXISTS `playlist_playlistsong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist_playlistsong` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_playlist` bigint NOT NULL,
  `id_song` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist_playlistsong`
--

LOCK TABLES `playlist_playlistsong` WRITE;
/*!40000 ALTER TABLE `playlist_playlistsong` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlist_playlistsong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `singer_singer`
--

DROP TABLE IF EXISTS `singer_singer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `singer_singer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `birthday` date NOT NULL,
  `description` varchar(255) NOT NULL,
  `followers` int NOT NULL,
  `image` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `singer_singer`
--

LOCK TABLES `singer_singer` WRITE;
/*!40000 ALTER TABLE `singer_singer` DISABLE KEYS */;
/*!40000 ALTER TABLE `singer_singer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `singer_singersong`
--

DROP TABLE IF EXISTS `singer_singersong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `singer_singersong` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_singer` bigint NOT NULL,
  `id_song` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `singer_singersong`
--

LOCK TABLES `singer_singersong` WRITE;
/*!40000 ALTER TABLE `singer_singersong` DISABLE KEYS */;
/*!40000 ALTER TABLE `singer_singersong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialaccount`
--

DROP TABLE IF EXISTS `socialaccount_socialaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialaccount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(200) NOT NULL,
  `uid` varchar(191) NOT NULL,
  `last_login` datetime(6) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `extra_data` json NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialaccount_provider_uid_fc810c6e_uniq` (`provider`,`uid`),
  KEY `socialaccount_socialaccount_user_id_8146e70c_fk_auth_user_id` (`user_id`),
  CONSTRAINT `socialaccount_socialaccount_user_id_8146e70c_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialaccount`
--

LOCK TABLES `socialaccount_socialaccount` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialaccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialapp`
--

DROP TABLE IF EXISTS `socialaccount_socialapp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialapp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(30) NOT NULL,
  `name` varchar(40) NOT NULL,
  `client_id` varchar(191) NOT NULL,
  `secret` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `provider_id` varchar(200) NOT NULL,
  `settings` json NOT NULL DEFAULT (_utf8mb3'{}'),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialapp`
--

LOCK TABLES `socialaccount_socialapp` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialapp` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialapp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialapp_sites`
--

DROP TABLE IF EXISTS `socialaccount_socialapp_sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialapp_sites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `socialapp_id` int NOT NULL,
  `site_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialapp_sites_socialapp_id_site_id_71a9a768_uniq` (`socialapp_id`,`site_id`),
  KEY `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` (`site_id`),
  CONSTRAINT `socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc` FOREIGN KEY (`socialapp_id`) REFERENCES `socialaccount_socialapp` (`id`),
  CONSTRAINT `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` FOREIGN KEY (`site_id`) REFERENCES `django_site` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialapp_sites`
--

LOCK TABLES `socialaccount_socialapp_sites` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialapp_sites` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialapp_sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialtoken`
--

DROP TABLE IF EXISTS `socialaccount_socialtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialtoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  `token_secret` longtext NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `account_id` int NOT NULL,
  `app_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq` (`app_id`,`account_id`),
  KEY `socialaccount_social_account_id_951f210e_fk_socialacc` (`account_id`),
  CONSTRAINT `socialaccount_social_account_id_951f210e_fk_socialacc` FOREIGN KEY (`account_id`) REFERENCES `socialaccount_socialaccount` (`id`),
  CONSTRAINT `socialaccount_social_app_id_636a42d7_fk_socialacc` FOREIGN KEY (`app_id`) REFERENCES `socialaccount_socialapp` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialtoken`
--

LOCK TABLES `socialaccount_socialtoken` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialtoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `song_song`
--

DROP TABLE IF EXISTS `song_song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `song_song` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `popularity` int NOT NULL,
  `release_date` date NOT NULL,
  `url_lyric` varchar(255) NOT NULL,
  `url_song` varchar(255) NOT NULL,
  `id_genre` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `song_song`
--

LOCK TABLES `song_song` WRITE;
/*!40000 ALTER TABLE `song_song` DISABLE KEYS */;
/*!40000 ALTER TABLE `song_song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spotify_user`
--

DROP TABLE IF EXISTS `spotify_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spotify_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `authorities` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `vip` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spotify_user`
--

LOCK TABLES `spotify_user` WRITE;
/*!40000 ALTER TABLE `spotify_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `spotify_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_user`
--

DROP TABLE IF EXISTS `user_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `vip` tinyint(1) NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `social_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_user`
--

LOCK TABLES `user_user` WRITE;
/*!40000 ALTER TABLE `user_user` DISABLE KEYS */;
INSERT INTO `user_user` VALUES (1,'voquang17@gmail.com',1,'123456','gibao4222',0,NULL,NULL),(2,'test@example.com',1,'pbkdf2_sha256$870000$0Mpv7gAuZrkNCUXho3D4o7$s1y3Bvqq7rl6f8ZdkT8gcq/L9DUZDm9jLdwVIC/QzHQ=','testuser',0,NULL,NULL);
/*!40000 ALTER TABLE `user_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_useralbum`
--

DROP TABLE IF EXISTS `user_useralbum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_useralbum` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_user` bigint NOT NULL,
  `id_album` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_useralbum`
--

LOCK TABLES `user_useralbum` WRITE;
/*!40000 ALTER TABLE `user_useralbum` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_useralbum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_usersinger`
--

DROP TABLE IF EXISTS `user_usersinger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_usersinger` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_user` bigint NOT NULL,
  `id_singer` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_usersinger`
--

LOCK TABLES `user_usersinger` WRITE;
/*!40000 ALTER TABLE `user_usersinger` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_usersinger` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-18 13:49:49
