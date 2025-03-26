-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 12, 2025 lúc 03:08 PM
-- Phiên bản máy phục vụ: 10.4.27-MariaDB
-- Phiên bản PHP: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `spotify-clone`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `album`
--

CREATE TABLE `album` (
  `id` bigint(20) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `popularity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `album_song`
--

CREATE TABLE `album_song` (
  `id_album` bigint(20) NOT NULL,
  `id_song` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `genre`
--

CREATE TABLE `genre` (
  `id` bigint(20) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `history`
--

CREATE TABLE `history` (
  `id` bigint(20) NOT NULL,
  `id_song` bigint(20) DEFAULT NULL,
  `id_user` bigint(20) DEFAULT NULL,
  `listen_date` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `playlist`
--

CREATE TABLE `playlist` (
  `id` bigint(20) NOT NULL,
  `create_date` date DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `id_user` bigint(20) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `playlist_song`
--

CREATE TABLE `playlist_song` (
  `id_playlist` bigint(20) NOT NULL,
  `id_song` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `singer`
--

CREATE TABLE `singer` (
  `id` bigint(20) NOT NULL,
  `birthday` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `followers` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `singer_album`
--

CREATE TABLE `singer_album` (
  `id_singer` bigint(20) NOT NULL,
  `id_album` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `singer_song`
--

CREATE TABLE `singer_song` (
  `id_singer` bigint(20) NOT NULL,
  `id_song` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `song`
--

CREATE TABLE `song` (
  `id` bigint(20) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `popularity` int(11) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `url_lyric` varchar(255) DEFAULT NULL,
  `url_song` varchar(255) DEFAULT NULL,
  `id_genre` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `authorities` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `vip` bit(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_album`
--

CREATE TABLE `user_album` (
  `id_user` bigint(20) NOT NULL,
  `id_album` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_singer`
--

CREATE TABLE `user_singer` (
  `id_user` bigint(20) NOT NULL,
  `id_singer` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `album`
--
ALTER TABLE `album`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `album_song`
--
ALTER TABLE `album_song`
  ADD KEY `FK2ivxl15gt79s86c0080j82l6` (`id_song`),
  ADD KEY `FKhdog4pm6mb5y6dqaptvv2htsj` (`id_album`);

--
-- Chỉ mục cho bảng `genre`
--
ALTER TABLE `genre`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `playlist`
--
ALTER TABLE `playlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKo9wdmdfvwr0chfx6kdf64yrf7` (`id_user`);

--
-- Chỉ mục cho bảng `playlist_song`
--
ALTER TABLE `playlist_song`
  ADD KEY `FKg0ap8b869v7m5qs060gbrpmb` (`id_song`),
  ADD KEY `FKqakecjinjyr1cncnye65o1f9i` (`id_playlist`);

--
-- Chỉ mục cho bảng `singer`
--
ALTER TABLE `singer`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `singer_album`
--
ALTER TABLE `singer_album`
  ADD KEY `FKlxv2spfr39kk2w7kqgcmmhear` (`id_album`),
  ADD KEY `FK7370dfpmnpld2fkeravxusj8g` (`id_singer`);

--
-- Chỉ mục cho bảng `singer_song`
--
ALTER TABLE `singer_song`
  ADD KEY `FK4e452ub97lhbv58npgo31qm7r` (`id_song`),
  ADD KEY `FKotiw32iveqy3pebs82spfxa9k` (`id_singer`);

--
-- Chỉ mục cho bảng `song`
--
ALTER TABLE `song`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKr7477f1oicmjwya2ur703uosc` (`id_genre`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_album`
--
ALTER TABLE `user_album`
  ADD KEY `FKa1svtd6b4lo8nsu3enb5sl55b` (`id_album`),
  ADD KEY `FKcus0hok04p0870wvpubym0u67` (`id_user`);

--
-- Chỉ mục cho bảng `user_singer`
--
ALTER TABLE `user_singer`
  ADD KEY `FKnwgyr93rsamioouv5p7w2i1a4` (`id_singer`),
  ADD KEY `FKqmqlm880acfvn8wpmrxjvdw0b` (`id_user`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `album`
--
ALTER TABLE `album`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `genre`
--
ALTER TABLE `genre`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `history`
--
ALTER TABLE `history`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `playlist`
--
ALTER TABLE `playlist`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `singer`
--
ALTER TABLE `singer`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `song`
--
ALTER TABLE `song`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `album_song`
--
ALTER TABLE `album_song`
  ADD CONSTRAINT `FK2ivxl15gt79s86c0080j82l6` FOREIGN KEY (`id_song`) REFERENCES `song` (`id`),
  ADD CONSTRAINT `FKhdog4pm6mb5y6dqaptvv2htsj` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`);

--
-- Các ràng buộc cho bảng `playlist`
--
ALTER TABLE `playlist`
  ADD CONSTRAINT `FKo9wdmdfvwr0chfx6kdf64yrf7` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`);

--
-- Các ràng buộc cho bảng `playlist_song`
--
ALTER TABLE `playlist_song`
  ADD CONSTRAINT `FKg0ap8b869v7m5qs060gbrpmb` FOREIGN KEY (`id_song`) REFERENCES `song` (`id`),
  ADD CONSTRAINT `FKqakecjinjyr1cncnye65o1f9i` FOREIGN KEY (`id_playlist`) REFERENCES `playlist` (`id`);

--
-- Các ràng buộc cho bảng `singer_album`
--
ALTER TABLE `singer_album`
  ADD CONSTRAINT `FK7370dfpmnpld2fkeravxusj8g` FOREIGN KEY (`id_singer`) REFERENCES `singer` (`id`),
  ADD CONSTRAINT `FKlxv2spfr39kk2w7kqgcmmhear` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`);

--
-- Các ràng buộc cho bảng `singer_song`
--
ALTER TABLE `singer_song`
  ADD CONSTRAINT `FK4e452ub97lhbv58npgo31qm7r` FOREIGN KEY (`id_song`) REFERENCES `song` (`id`),
  ADD CONSTRAINT `FKotiw32iveqy3pebs82spfxa9k` FOREIGN KEY (`id_singer`) REFERENCES `singer` (`id`);

--
-- Các ràng buộc cho bảng `song`
--
ALTER TABLE `song`
  ADD CONSTRAINT `FKr7477f1oicmjwya2ur703uosc` FOREIGN KEY (`id_genre`) REFERENCES `genre` (`id`);

--
-- Các ràng buộc cho bảng `user_album`
--
ALTER TABLE `user_album`
  ADD CONSTRAINT `FKa1svtd6b4lo8nsu3enb5sl55b` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`),
  ADD CONSTRAINT `FKcus0hok04p0870wvpubym0u67` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`);

--
-- Các ràng buộc cho bảng `user_singer`
--
ALTER TABLE `user_singer`
  ADD CONSTRAINT `FKnwgyr93rsamioouv5p7w2i1a4` FOREIGN KEY (`id_singer`) REFERENCES `singer` (`id`),
  ADD CONSTRAINT `FKqmqlm880acfvn8wpmrxjvdw0b` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
