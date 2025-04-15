-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 17. Mrz 2025 um 18:39
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `memorise_gc_db`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `activity`
--

CREATE TABLE `activity` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `creator_id` varchar(255) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `active_flag` tinyint(1) DEFAULT 1,
  `comercial_flag` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `activity`
--

INSERT INTO `activity` (`id`, `title`, `description`, `creator_id`, `creation_date`, `active_flag`, `comercial_flag`) VALUES
(1, 'Hiking', 'an outdoor sports', '0', '2025-01-03 07:30:19', 1, 0),
(2, 'Party', 'lets celebrate!', '0', '2025-01-03 07:30:41', 1, 0),
(3, 'Vacation', 'well earned free time!', '0', '2025-01-03 07:30:57', 1, 0),
(4, 'Hiking', NULL, '', '2025-01-06 17:15:53', 1, 0),
(5, 'Hiking', NULL, '', '2025-01-06 17:23:03', 1, 0),
(6, 'Hiking', NULL, '', '2025-01-06 17:24:02', 1, 0),
(7, 'test', NULL, '', '2025-01-13 17:32:22', 1, 0),
(8, 'Hiking', NULL, '', '2025-01-13 17:33:35', 1, 0),
(9, 'New', NULL, '', '2025-01-13 17:35:01', 1, 0),
(10, 'test', NULL, '', '2025-01-13 17:36:29', 1, 0),
(11, 'test1234', NULL, '', '2025-01-13 17:37:25', 1, 0),
(12, 'Hiking', NULL, '', '2025-01-13 17:39:55', 1, 0),
(13, 'test', NULL, '', '2025-01-13 17:44:47', 1, 0),
(14, 'Hiking', NULL, '', '2025-01-13 17:47:31', 1, 0),
(15, 'test act', NULL, '', '2025-01-13 17:50:06', 1, 0),
(16, 'Hiking', NULL, '', '2025-01-13 17:51:32', 1, 0),
(17, 'Hiking', NULL, '', '2025-01-13 17:54:03', 1, 0),
(18, 'new', NULL, '', '2025-01-13 17:54:20', 1, 0),
(19, 'Hiking', NULL, '', '2025-01-13 17:57:16', 1, 0),
(20, 'new act', NULL, '', '2025-01-15 07:00:31', 1, 0),
(21, 'test', NULL, '', '2025-01-15 07:04:38', 1, 0),
(22, 'last act#', NULL, '', '2025-01-15 07:05:13', 1, 0),
(23, 'New Activity', NULL, '', '2025-01-25 08:46:38', 1, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `betauserrequests`
--

CREATE TABLE `betauserrequests` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `owner_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `company_codes`
--

CREATE TABLE `company_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(36) NOT NULL,
  `company_id` int(11) NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `favourite_memories`
--

CREATE TABLE `favourite_memories` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `memory_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `favourite_memories`
--

INSERT INTO `favourite_memories` (`id`, `user_id`, `memory_id`) VALUES
(4, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 2),
(8, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 3),
(9, 'zMu6buowgTdvrhrJ7eXF3sCma1p1', 2),
(10, 'zMu6buowgTdvrhrJ7eXF3sCma1p1', 3);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `friendships`
--

CREATE TABLE `friendships` (
  `user_id1` varchar(255) NOT NULL,
  `user_id2` varchar(255) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `friendships`
--

INSERT INTO `friendships` (`user_id1`, `user_id2`, `status`) VALUES
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'jNeck60VMGTg8dRYbdUHPWaE56g1', 'accepted'),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'P8esasc4akbgIYfiWpOe8QOWJpg1', 'accepted'),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'zMu6buowgTdvrhrJ7eXF3sCma1p1', 'accepted'),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 'MXujLVpXSlNcookrY43jVpxejwl2', 'pending'),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 'P8esasc4akbgIYfiWpOe8QOWJpg1', 'accepted');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `location`
--

CREATE TABLE `location` (
  `location_id` int(11) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `country` varchar(255) DEFAULT NULL,
  `locality` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `location`
--

INSERT INTO `location` (`location_id`, `longitude`, `latitude`, `country`, `locality`) VALUES
(1, -17.005173, 32.714377, 'Portugal', 'Jardim da Serra'),
(2, -16.999839, 32.724373, 'Portugal', 'Jardim da Serra'),
(3, 18.815050, 68.377026, 'Schweden', NULL),
(4, 18.833579, 68.370430, 'Schweden', NULL),
(5, 18.684998, 68.319161, 'Schweden', NULL),
(6, 14.876352, 48.114699, 'Österreich', 'Amstetten'),
(7, 14.876347, 48.114709, 'Österreich', 'Amstetten'),
(8, 15.179036, 50.494300, 'Tschechien', 'Libošovice'),
(9, 13.333333, 47.969791, 'Österreich', 'Straßwalchen'),
(10, 10.619711, 47.116964, 'Österreich', 'Fließ'),
(11, 13.996762, 44.909209, 'Kroatien', 'Kavran'),
(12, 12.759208, 47.271314, 'Österreich', 'Kaprun'),
(13, -9.181559, 38.645029, 'Portugal', 'Sobreda'),
(14, -9.116989, 38.549115, 'Portugal', 'Fernão Ferro'),
(15, -6.260544, 31.577363, 'Marokko', 'El Mrabitine'),
(16, -4.502732, 32.584872, 'Marokko', 'Lhndare'),
(17, -3.313674, 40.253743, 'Spanien', 'Tielmes'),
(18, -3.679388, 40.226019, 'Spanien', 'Valdemoro'),
(19, -6.568161, 31.691815, 'Marokko', 'Iguer n\'Oual'),
(20, 19.529622, 46.809555, 'Ungarn', 'Helvécia'),
(21, 14.875456, 48.123762, 'Österreich', 'Amstetten'),
(22, 4.860771, 50.729369, 'Belgien', '1370 Jodoigne'),
(23, 7.206094, 43.585853, 'Frankreich', '');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `memories`
--

CREATE TABLE `memories` (
  `memory_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `text` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `memory_date` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `title_pic` varchar(255) DEFAULT NULL,
  `memory_end_date` varchar(255) DEFAULT NULL,
  `picture_count` int(11) DEFAULT 0,
  `activity_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `memories`
--

INSERT INTO `memories` (`memory_id`, `user_id`, `text`, `image_url`, `location_id`, `memory_date`, `title`, `title_pic`, `memory_end_date`, `picture_count`, `activity_id`) VALUES
(2, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Test Desc of Madeira new', 'NPFiASPHZPTT5FkwnKK5VHwWncq21735889461028', 2, '2024-07-03T22:00:00.000Z', 'Maderia', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2FNPFiASPHZPTT5FkwnKK5VHwWncq21735889461028%2Fpicture_1.jpg?alt=media&token=4b697998-ef0c-4fae-b1d9-2de99a6faba6', '2024-07-13T22:00:00.000Z', 4, 2),
(3, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Embark on a journey through the stunning wilderness of Sweden with our unforgettable Kungsleden hike. Spanning over 400 kilometers, this adventure took us through dense forests, across alpine meadows, and past crystal-clear lakes. Each day offered a new landscape, from the rugged peaks of the Kebnekaise range to the serene beauty of Abisko National Park. Along the way, we camped under the stars, warmed by the glow of the midnight sun. This hike was not just a physical challenge but a chance to disconnect from the everyday and reconnect with nature and each other. A truly transformative experience that left us with lasting memories and a profound sense of accomplishment.', 'NPFiASPHZPTT5FkwnKK5VHwWncq21736184196971', 5, '2023-07-25T22:00:00.000Z', 'Hiking the Kungsleden with the boyss', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2FNPFiASPHZPTT5FkwnKK5VHwWncq21736184196971%2Fpicture_2.jpg?alt=media&token=33978d91-3844-4224-9cad-385579018c60', '2023-08-01T22:00:00.000Z', 10, 6),
(22, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '', 'NPFiASPHZPTT5FkwnKK5VHwWncq21740156978155', 1, '2025-02-20T23:00:00.000Z', 'test hike', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2FNPFiASPHZPTT5FkwnKK5VHwWncq21740156978155%2Fpicture_2.jpg?alt=media&token=3cc17303-9077-49a4-b500-881c2dc7fc24', '2025-02-20T23:00:00.000Z', 4, 1),
(24, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '', 'NPFiASPHZPTT5FkwnKK5VHwWncq21741021776618', 1, '2025-03-10T23:00:00.000Z', 'test ', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2FNPFiASPHZPTT5FkwnKK5VHwWncq21741021776618%2Fpicture_1.jpg?alt=media&token=0254aced-87a5-422f-8abb-5da3ef5e0692', '2025-03-10T23:00:00.000Z', 4, 1),
(25, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '', 'NPFiASPHZPTT5FkwnKK5VHwWncq21741627511684', 1, '2025-03-09T23:00:00.000Z', 'Pilgern', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2FNPFiASPHZPTT5FkwnKK5VHwWncq21741627511684%2Fpicture_1.jpg?alt=media&token=839d8a90-40a7-4ef2-af8e-7257b8315b80', '2025-03-10T23:00:00.000Z', 1, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `user_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `dob` varchar(255) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `bio` varchar(400) DEFAULT NULL,
  `profilepic` varchar(255) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`user_id`, `email`, `name`, `dob`, `gender`, `location_id`, `bio`, `profilepic`, `username`, `country`, `company_id`, `instagram`) VALUES
('0aperCqO5yWpfLpsA4xrLEyHpP62', 'nikigugi123@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('bmb3uH5SUXZroLuKSobTMB0fqmo1', 'test@gmail.com', 'Max Mustertester', '2024-12-31', '', NULL, NULL, 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2Fbmb3uH5SUXZroLuKSobTMB0fqmo1%2Fprofile.jpg?alt=media&token=fec537d6-573a-4072-9a3e-3bcc2bd0603a', NULL, 'Grenada', NULL, NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 'miriam.langthaller@icloud.com', 'Mimal', '2006-02-05', 'Female', NULL, 'Once tried to high-five a mirror (it didn\'t end well)', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FjNeck60VMGTg8dRYbdUHPWaE56g1%2Fprofile.jpg?alt=media&token=f7d97a7f-3665-4e00-9747-f78969b65e55', NULL, 'Austria', NULL, NULL),
('MXujLVpXSlNcookrY43jVpxejwl2', 'mimi@gmail.com', 'Mimi', '2006-02-05', 'Female', NULL, 'Maus', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FMXujLVpXSlNcookrY43jVpxejwl2%2Fprofile.jpg?alt=media&token=1c913de0-13a9-415d-9758-09d40f990864', NULL, 'Austria', NULL, NULL),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'florianhofer024@gmail.com', 'Florian Hofer', '2002-12-24', 'Male', NULL, 'This is my temp Bio', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNPFiASPHZPTT5FkwnKK5VHwWncq2%2Fprofile.jpg?alt=media&token=b3a86ad9-2915-4f19-a47c-e1f4ef0e8fdb', NULL, 'Austria', NULL, 'flo_hofer___'),
('P8esasc4akbgIYfiWpOe8QOWJpg1', 'nikigugi@gmail.com', 'Niki Gu', '2003-09-01', 'Male', NULL, 'a bio', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FP8esasc4akbgIYfiWpOe8QOWJpg1%2Fprofile.jpg?alt=media&token=0f5719ab-e9fb-44e9-b19d-397c52d297b9', 'nikgrl', 'Austria', NULL, 'nikgrl'),
('q51SjsmPOoNQOHCt0auiDIcdqUd2', 'a.k.hofer@aon.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('qcxAEes01wMUkQqZo00Hv1ALNzj2', 'niki.gugi@gmail.com', 'Niki Gu', '2003-09-01', 'Male', NULL, 'Once tried to high-five a mirror (it didn\'t end well)', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FqcxAEes01wMUkQqZo00Hv1ALNzj2%2Fprofile.jpg?alt=media&token=90664363-bb6e-430b-a151-b5ee26bd4fd1', 'guginator', 'Austria', NULL, NULL),
('UEFBQNfAs9M1wpDYhThWsIMwZ413', 'nikigugi123@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 'jonaskra@gmail.com', 'Jonas Krahofer', '2003-07-09T22:00:00.000Z', 'Male', NULL, 'test bio', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FzMu6buowgTdvrhrJ7eXF3sCma1p1%2Fprofile.jpg?alt=media&token=43a22d18-636e-424b-ba8a-1fe844887fc8', 'tset', 'Austria', NULL, 'test123123');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_has_memory`
--

CREATE TABLE `user_has_memory` (
  `user_id` varchar(255) NOT NULL,
  `memory_id` int(11) NOT NULL,
  `status` enum('creator','friend') DEFAULT 'creator'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_has_memory`
--

INSERT INTO `user_has_memory` (`user_id`, `memory_id`, `status`) VALUES
('jNeck60VMGTg8dRYbdUHPWaE56g1', 25, 'friend'),
('P8esasc4akbgIYfiWpOe8QOWJpg1', 2, 'friend'),
('P8esasc4akbgIYfiWpOe8QOWJpg1', 3, 'friend'),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 2, 'friend'),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 3, 'friend');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`creator_id`);

--
-- Indizes für die Tabelle `betauserrequests`
--
ALTER TABLE `betauserrequests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indizes für die Tabelle `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `company_codes`
--
ALTER TABLE `company_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `company_id` (`company_id`);

--
-- Indizes für die Tabelle `favourite_memories`
--
ALTER TABLE `favourite_memories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user` (`user_id`),
  ADD KEY `fk_memory` (`memory_id`);

--
-- Indizes für die Tabelle `friendships`
--
ALTER TABLE `friendships`
  ADD PRIMARY KEY (`user_id1`,`user_id2`),
  ADD KEY `user_id2` (`user_id2`);

--
-- Indizes für die Tabelle `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`location_id`);

--
-- Indizes für die Tabelle `memories`
--
ALTER TABLE `memories`
  ADD PRIMARY KEY (`memory_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `fk_activity` (`activity_id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `fk_company` (`company_id`);

--
-- Indizes für die Tabelle `user_has_memory`
--
ALTER TABLE `user_has_memory`
  ADD PRIMARY KEY (`user_id`,`memory_id`),
  ADD KEY `memory_id` (`memory_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `activity`
--
ALTER TABLE `activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT für Tabelle `betauserrequests`
--
ALTER TABLE `betauserrequests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `company_codes`
--
ALTER TABLE `company_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `favourite_memories`
--
ALTER TABLE `favourite_memories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT für Tabelle `location`
--
ALTER TABLE `location`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT für Tabelle `memories`
--
ALTER TABLE `memories`
  MODIFY `memory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `company_codes`
--
ALTER TABLE `company_codes`
  ADD CONSTRAINT `company_codes_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints der Tabelle `favourite_memories`
--
ALTER TABLE `favourite_memories`
  ADD CONSTRAINT `fk_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`);

--
-- Constraints der Tabelle `memories`
--
ALTER TABLE `memories`
  ADD CONSTRAINT `fk_activity` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`),
  ADD CONSTRAINT `memories_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);

--
-- Constraints der Tabelle `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);

--
-- Constraints der Tabelle `user_has_memory`
--
ALTER TABLE `user_has_memory`
  ADD CONSTRAINT `user_has_memory_ibfk_2` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
