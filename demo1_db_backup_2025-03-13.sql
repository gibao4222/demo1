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
-- Table structure for table `album`
--

DROP TABLE IF EXISTS `album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `popularity` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album`
--

LOCK TABLES `album` WRITE;
/*!40000 ALTER TABLE `album` DISABLE KEYS */;
/*!40000 ALTER TABLE `album` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album_album`
--

LOCK TABLES `album_album` WRITE;
/*!40000 ALTER TABLE `album_album` DISABLE KEYS */;
INSERT INTO `album_album` VALUES (1,'/var/www/demo1/frontend/public/img/AlbumArt.png',1,'Album Art',24);
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
-- Table structure for table `album_song`
--

DROP TABLE IF EXISTS `album_song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album_song` (
  `id_album` bigint NOT NULL,
  `id_song` bigint NOT NULL,
  KEY `FK2ivxl15gt79s86c0080j82l6` (`id_song`),
  KEY `FKhdog4pm6mb5y6dqaptvv2htsj` (`id_album`),
  CONSTRAINT `FK2ivxl15gt79s86c0080j82l6` FOREIGN KEY (`id_song`) REFERENCES `song` (`id`),
  CONSTRAINT `FKhdog4pm6mb5y6dqaptvv2htsj` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album_song`
--

LOCK TABLES `album_song` WRITE;
/*!40000 ALTER TABLE `album_song` DISABLE KEYS */;
/*!40000 ALTER TABLE `album_song` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add product',7,'add_product'),(26,'Can change product',7,'change_product'),(27,'Can delete product',7,'delete_product'),(28,'Can view product',7,'view_product'),(29,'Can add song',8,'add_song'),(30,'Can change song',8,'change_song'),(31,'Can delete song',8,'delete_song'),(32,'Can view song',8,'view_song'),(33,'Can add album',9,'add_album'),(34,'Can change album',9,'change_album'),(35,'Can delete album',9,'delete_album'),(36,'Can view album',9,'view_album'),(37,'Can add album song',10,'add_albumsong'),(38,'Can change album song',10,'change_albumsong'),(39,'Can delete album song',10,'delete_albumsong'),(40,'Can view album song',10,'view_albumsong'),(41,'Can add singer album',11,'add_singeralbum'),(42,'Can change singer album',11,'change_singeralbum'),(43,'Can delete singer album',11,'delete_singeralbum'),(44,'Can view singer album',11,'view_singeralbum'),(45,'Can add singer',12,'add_singer'),(46,'Can change singer',12,'change_singer'),(47,'Can delete singer',12,'delete_singer'),(48,'Can view singer',12,'view_singer'),(49,'Can add singer song',13,'add_singersong'),(50,'Can change singer song',13,'change_singersong'),(51,'Can delete singer song',13,'delete_singersong'),(52,'Can view singer song',13,'view_singersong'),(53,'Can add user',14,'add_user'),(54,'Can change user',14,'change_user'),(55,'Can delete user',14,'delete_user'),(56,'Can view user',14,'view_user'),(57,'Can add user album',15,'add_useralbum'),(58,'Can change user album',15,'change_useralbum'),(59,'Can delete user album',15,'delete_useralbum'),(60,'Can view user album',15,'view_useralbum'),(61,'Can add user singer',16,'add_usersinger'),(62,'Can change user singer',16,'change_usersinger'),(63,'Can delete user singer',16,'delete_usersinger'),(64,'Can view user singer',16,'view_usersinger'),(65,'Can add genre',17,'add_genre'),(66,'Can change genre',17,'change_genre'),(67,'Can delete genre',17,'delete_genre'),(68,'Can view genre',17,'view_genre'),(69,'Can add history',18,'add_history'),(70,'Can change history',18,'change_history'),(71,'Can delete history',18,'delete_history'),(72,'Can view history',18,'view_history'),(73,'Can add playlist',19,'add_playlist'),(74,'Can change playlist',19,'change_playlist'),(75,'Can delete playlist',19,'delete_playlist'),(76,'Can view playlist',19,'view_playlist'),(77,'Can add playlist song',20,'add_playlistsong'),(78,'Can change playlist song',20,'change_playlistsong'),(79,'Can delete playlist song',20,'delete_playlistsong'),(80,'Can view playlist song',20,'view_playlistsong'),(81,'Can add user',21,'add_user'),(82,'Can change user',21,'change_user'),(83,'Can delete user',21,'delete_user'),(84,'Can view user',21,'view_user'),(85,'Can add user album',22,'add_useralbum'),(86,'Can change user album',22,'change_useralbum'),(87,'Can delete user album',22,'delete_useralbum'),(88,'Can view user album',22,'view_useralbum'),(89,'Can add user singer',23,'add_usersinger'),(90,'Can change user singer',23,'change_usersinger'),(91,'Can delete user singer',23,'delete_usersinger'),(92,'Can view user singer',23,'view_usersinger');
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
INSERT INTO `auth_user` VALUES (2,'pbkdf2_sha256$870000$8EpZyiF7qv8Pve6iyyqE9W$Fb9blXzsaQwviqSKnWduFki+FYbNMxZu3SHM7oyfhOY=','2025-03-12 16:00:32.424889',1,'admin','','','voquang17@gmail.com',1,1,'2025-03-01 08:55:52.982358');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2025-03-01 08:57:42.308512','1','user1',3,'',4,2),(2,'2025-03-01 09:57:35.554580','1','Iphone 12 promax',1,'[{\"added\": {}}]',7,2),(3,'2025-03-12 17:09:12.884832','1','Album Art',1,'[{\"added\": {}}]',9,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(9,'album','album'),(10,'album','albumsong'),(11,'album','singeralbum'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(17,'genre','genre'),(18,'history','history'),(19,'playlist','playlist'),(20,'playlist','playlistsong'),(7,'products','product'),(6,'sessions','session'),(12,'singer','singer'),(13,'singer','singersong'),(8,'song','song'),(21,'spotify_user','user'),(22,'spotify_user','useralbum'),(23,'spotify_user','usersinger'),(14,'user','user'),(15,'user','useralbum'),(16,'user','usersinger');
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-02-26 13:59:17.132735'),(2,'auth','0001_initial','2025-02-26 13:59:18.319353'),(3,'admin','0001_initial','2025-02-26 13:59:18.580338'),(4,'admin','0002_logentry_remove_auto_add','2025-02-26 13:59:18.592692'),(5,'admin','0003_logentry_add_action_flag_choices','2025-02-26 13:59:18.601899'),(6,'contenttypes','0002_remove_content_type_name','2025-02-26 13:59:18.777345'),(7,'auth','0002_alter_permission_name_max_length','2025-02-26 13:59:18.889614'),(8,'auth','0003_alter_user_email_max_length','2025-02-26 13:59:18.921801'),(9,'auth','0004_alter_user_username_opts','2025-02-26 13:59:18.931415'),(10,'auth','0005_alter_user_last_login_null','2025-02-26 13:59:19.022266'),(11,'auth','0006_require_contenttypes_0002','2025-02-26 13:59:19.028378'),(12,'auth','0007_alter_validators_add_error_messages','2025-02-26 13:59:19.036851'),(13,'auth','0008_alter_user_username_max_length','2025-02-26 13:59:19.150291'),(14,'auth','0009_alter_user_last_name_max_length','2025-02-26 13:59:19.271726'),(15,'auth','0010_alter_group_name_max_length','2025-02-26 13:59:19.296399'),(16,'auth','0011_update_proxy_permissions','2025-02-26 13:59:19.305107'),(17,'auth','0012_alter_user_first_name_max_length','2025-02-26 13:59:19.426294'),(18,'sessions','0001_initial','2025-02-26 13:59:19.500179'),(20,'album','0001_initial','2025-03-12 15:42:07.294212'),(21,'genre','0001_initial','2025-03-12 15:42:07.341123'),(22,'history','0001_initial','2025-03-12 15:42:07.389163'),(23,'playlist','0001_initial','2025-03-12 15:42:07.463993'),(24,'singer','0001_initial','2025-03-12 15:42:07.542292'),(25,'song','0001_initial','2025-03-12 15:42:07.596144'),(26,'user','0001_initial','2025-03-12 15:42:07.715591'),(27,'spotify_user','0001_initial','2025-03-12 16:58:50.135327'),(28,'spotify_user','0002_auto_20250312_1657','2025-03-12 16:58:50.168454');
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
INSERT INTO `django_session` VALUES ('xgaad0qa4g6yw3lubwf9p9q7m3khpglr','.eJxVjMsOwiAQRf-FtSE8ygAu3fsNZBgGWzUlKe3K-O_apAvd3nPOfYmE2zqmrfOSpiLOwojT75aRHjzvoNxxvjVJbV6XKctdkQft8toKPy-H-3cwYh-_NfuBPNUYIHoEMorYaRWwVCZtLVQCpU2M1jFYlx0ohd4USzEMkBnE-wPilzeC:1tsOVU:fOq9sWWDSiF2Y6mUIRXYG9itY_Bu6jU7EnOA02R3cCI','2025-03-26 16:00:32.431832');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genre`
--

DROP TABLE IF EXISTS `genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genre` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre`
--

LOCK TABLES `genre` WRITE;
/*!40000 ALTER TABLE `genre` DISABLE KEYS */;
/*!40000 ALTER TABLE `genre` ENABLE KEYS */;
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
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_song` bigint DEFAULT NULL,
  `id_user` bigint DEFAULT NULL,
  `listen_date` datetime(6) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

LOCK TABLES `history` WRITE;
/*!40000 ALTER TABLE `history` DISABLE KEYS */;
/*!40000 ALTER TABLE `history` ENABLE KEYS */;
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
-- Table structure for table `playlist`
--

DROP TABLE IF EXISTS `playlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_date` date DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_user` bigint DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo9wdmdfvwr0chfx6kdf64yrf7` (`id_user`),
  CONSTRAINT `FKo9wdmdfvwr0chfx6kdf64yrf7` FOREIGN KEY (`id_user`) REFERENCES `spotify_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist`
--

LOCK TABLES `playlist` WRITE;
/*!40000 ALTER TABLE `playlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlist` ENABLE KEYS */;
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
-- Table structure for table `playlist_song`
--

DROP TABLE IF EXISTS `playlist_song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist_song` (
  `id_playlist` bigint NOT NULL,
  `id_song` bigint NOT NULL,
  KEY `FKg0ap8b869v7m5qs060gbrpmb` (`id_song`),
  KEY `FKqakecjinjyr1cncnye65o1f9i` (`id_playlist`),
  CONSTRAINT `FKg0ap8b869v7m5qs060gbrpmb` FOREIGN KEY (`id_song`) REFERENCES `song` (`id`),
  CONSTRAINT `FKqakecjinjyr1cncnye65o1f9i` FOREIGN KEY (`id_playlist`) REFERENCES `playlist` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist_song`
--

LOCK TABLES `playlist_song` WRITE;
/*!40000 ALTER TABLE `playlist_song` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlist_song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `singer`
--

DROP TABLE IF EXISTS `singer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `singer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `birthday` date DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `followers` int DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `singer`
--

LOCK TABLES `singer` WRITE;
/*!40000 ALTER TABLE `singer` DISABLE KEYS */;
/*!40000 ALTER TABLE `singer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `singer_album`
--

DROP TABLE IF EXISTS `singer_album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `singer_album` (
  `id_singer` bigint NOT NULL,
  `id_album` bigint NOT NULL,
  KEY `FKlxv2spfr39kk2w7kqgcmmhear` (`id_album`),
  KEY `FK7370dfpmnpld2fkeravxusj8g` (`id_singer`),
  CONSTRAINT `FK7370dfpmnpld2fkeravxusj8g` FOREIGN KEY (`id_singer`) REFERENCES `singer` (`id`),
  CONSTRAINT `FKlxv2spfr39kk2w7kqgcmmhear` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `singer_album`
--

LOCK TABLES `singer_album` WRITE;
/*!40000 ALTER TABLE `singer_album` DISABLE KEYS */;
/*!40000 ALTER TABLE `singer_album` ENABLE KEYS */;
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
-- Table structure for table `singer_song`
--

DROP TABLE IF EXISTS `singer_song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `singer_song` (
  `id_singer` bigint NOT NULL,
  `id_song` bigint NOT NULL,
  KEY `FK4e452ub97lhbv58npgo31qm7r` (`id_song`),
  KEY `FKotiw32iveqy3pebs82spfxa9k` (`id_singer`),
  CONSTRAINT `FK4e452ub97lhbv58npgo31qm7r` FOREIGN KEY (`id_song`) REFERENCES `song` (`id`),
  CONSTRAINT `FKotiw32iveqy3pebs82spfxa9k` FOREIGN KEY (`id_singer`) REFERENCES `singer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `singer_song`
--

LOCK TABLES `singer_song` WRITE;
/*!40000 ALTER TABLE `singer_song` DISABLE KEYS */;
/*!40000 ALTER TABLE `singer_song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `song`
--

DROP TABLE IF EXISTS `song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `song` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `popularity` int DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `url_lyric` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `url_song` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_genre` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr7477f1oicmjwya2ur703uosc` (`id_genre`),
  CONSTRAINT `FKr7477f1oicmjwya2ur703uosc` FOREIGN KEY (`id_genre`) REFERENCES `genre` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `song`
--

LOCK TABLES `song` WRITE;
/*!40000 ALTER TABLE `song` DISABLE KEYS */;
/*!40000 ALTER TABLE `song` ENABLE KEYS */;
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
-- Table structure for table `spotify_clone_spotifyuser`
--

DROP TABLE IF EXISTS `spotify_clone_spotifyuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spotify_clone_spotifyuser` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `author_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `vip` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spotify_clone_spotifyuser`
--

LOCK TABLES `spotify_clone_spotifyuser` WRITE;
/*!40000 ALTER TABLE `spotify_clone_spotifyuser` DISABLE KEYS */;
/*!40000 ALTER TABLE `spotify_clone_spotifyuser` ENABLE KEYS */;
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
-- Table structure for table `spotify_user_user`
--

DROP TABLE IF EXISTS `spotify_user_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spotify_user_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `author_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `vip` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spotify_user_user`
--

LOCK TABLES `spotify_user_user` WRITE;
/*!40000 ALTER TABLE `spotify_user_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `spotify_user_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spotify_user_useralbum`
--

DROP TABLE IF EXISTS `spotify_user_useralbum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spotify_user_useralbum` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_user` bigint NOT NULL,
  `id_album` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spotify_user_useralbum`
--

LOCK TABLES `spotify_user_useralbum` WRITE;
/*!40000 ALTER TABLE `spotify_user_useralbum` DISABLE KEYS */;
/*!40000 ALTER TABLE `spotify_user_useralbum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spotify_user_usersinger`
--

DROP TABLE IF EXISTS `spotify_user_usersinger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spotify_user_usersinger` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_user` bigint NOT NULL,
  `id_singer` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spotify_user_usersinger`
--

LOCK TABLES `spotify_user_usersinger` WRITE;
/*!40000 ALTER TABLE `spotify_user_usersinger` DISABLE KEYS */;
/*!40000 ALTER TABLE `spotify_user_usersinger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_album`
--

DROP TABLE IF EXISTS `user_album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_album` (
  `id_user` bigint NOT NULL,
  `id_album` bigint NOT NULL,
  KEY `FKa1svtd6b4lo8nsu3enb5sl55b` (`id_album`),
  KEY `FKcus0hok04p0870wvpubym0u67` (`id_user`),
  CONSTRAINT `FKa1svtd6b4lo8nsu3enb5sl55b` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`),
  CONSTRAINT `FKcus0hok04p0870wvpubym0u67` FOREIGN KEY (`id_user`) REFERENCES `spotify_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_album`
--

LOCK TABLES `user_album` WRITE;
/*!40000 ALTER TABLE `user_album` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_album` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_singer`
--

DROP TABLE IF EXISTS `user_singer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_singer` (
  `id_user` bigint NOT NULL,
  `id_singer` bigint NOT NULL,
  KEY `FKnwgyr93rsamioouv5p7w2i1a4` (`id_singer`),
  KEY `FKqmqlm880acfvn8wpmrxjvdw0b` (`id_user`),
  CONSTRAINT `FKnwgyr93rsamioouv5p7w2i1a4` FOREIGN KEY (`id_singer`) REFERENCES `singer` (`id`),
  CONSTRAINT `FKqmqlm880acfvn8wpmrxjvdw0b` FOREIGN KEY (`id_user`) REFERENCES `spotify_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_singer`
--

LOCK TABLES `user_singer` WRITE;
/*!40000 ALTER TABLE `user_singer` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_singer` ENABLE KEYS */;
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

-- Dump completed on 2025-03-13  0:22:30
