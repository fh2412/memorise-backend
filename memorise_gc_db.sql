-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 21. Aug 2026 um 15:57
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
  `comercial_flag` tinyint(1) DEFAULT 0,
  `group_size_min` int(11) DEFAULT NULL,
  `indoor_outdoor_flag` enum('Indoor','Outdoor') NOT NULL,
  `prize` decimal(10,2) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `base_memory_id` int(11) DEFAULT NULL,
  `title_image_url` varchar(500) DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `group_size_max` int(11) NOT NULL DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `activity`
--

INSERT INTO `activity` (`id`, `title`, `description`, `creator_id`, `creation_date`, `active_flag`, `comercial_flag`, `group_size_min`, `indoor_outdoor_flag`, `prize`, `location_id`, `base_memory_id`, `title_image_url`, `website_url`, `group_size_max`) VALUES
(1, 'Placeholder', '', '0', '2025-01-03 07:30:19', 0, 0, NULL, '', NULL, NULL, NULL, NULL, NULL, 0),
(2, 'Party', 'lets celebrate!', '0', '2025-01-03 07:30:41', 0, 0, NULL, 'Indoor', NULL, NULL, NULL, NULL, NULL, 10),
(3, 'Vacation', 'well earned free time!', '0', '2025-01-03 07:30:57', 0, 0, NULL, 'Indoor', NULL, NULL, NULL, NULL, NULL, 10),
(43, 'Participating in the advent od code', 'no description added', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2025-04-05 14:35:58', 0, 0, 1, 'Indoor', 0.00, 1, NULL, 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/activities%2F43%2Fthumbnail.jpg?alt=media&token=31bc8643-570b-4dcc-8800-59d6cfd4184c', NULL, 3),
(46, 'Crossing Maderia by Foot', 'amazing hike', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2025-04-18 09:13:07', 1, 0, 3, 'Outdoor', 100.00, 41, NULL, 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/activities%2F46%2Fthumbnail.jpg?alt=media&token=c0dc6645-572e-45d4-bd83-67a6a37beca3', NULL, 6),
(50, 'Flos Birthday Party', 'you are invited! Bring joy!', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2025-04-18 09:36:10', 1, 0, 10, 'Indoor', 30.00, 43, NULL, 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/activities%2F50%2Fthumbnail.jpg?alt=media&token=28ca7dba-4e20-49d5-aef5-2076ab7fe314', NULL, 18),
(51, 'Swedens short Kungsleden Tail', 'Hiking the Kungsleden is an activity for at least 7 days. It is recommended to do the hike in a group of at least 2 people. Groups larger than 6 will be hard to coordinate. Be prepeared for 7 days in the swidish tundra with little to no contact to the outside world. Food an shelter must be brougth with you and be prepared for bird siced moscitos and bad weather. This trip is nothing short of a real adventure, and a great one!', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2025-04-21 09:52:02', 1, 0, 2, 'Outdoor', 100.00, 44, NULL, 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/activities%2F51%2Fthumbnail.jpg?alt=media&token=f5196d3f-29bb-46af-b515-e476da042a97', NULL, 6),
(54, 'Tennis in Amstetten', 'At the UTC Amstetten you and up to 3 friends can play an hour of tennis for only 20€. With an very active community the UTC Amstetten is a popular place to hang out with amongs younger and older individuals in and near Amstetten', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-05-09 12:46:40', 1, 0, 2, 'Outdoor', 20.00, 1, NULL, 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/activities%2F54%2Fthumbnail.jpg?alt=media&token=5560af20-05fc-4798-b9f6-c69051b0610c', 'https://www.utc-amstetten.at/', 4),
(56, 'no activity', 'this is a placeholder activity', '1', '2025-07-22 16:15:51', 1, 0, NULL, '', NULL, 3, NULL, NULL, NULL, 10),
(57, 'Schönbrunn Palace Tour', 'Explore the magnificent summer residence of the Habsburgs, with a grand tour of the state rooms and private apartments.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 54, NULL, '', 'https://www.schoenbrunn.at', 50),
(58, 'Danube River Cruise', 'A scenic boat trip along the Danube, offering stunning views of Vienna\'s skyline and landmarks from the water.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 10, 'Outdoor', NULL, 55, NULL, '', 'https://www.ddsg-blue-danube.at', 150),
(59, 'Naschmarkt Food Tour', 'Wander through Vienna\'s most famous market, sampling local delicacies and international cuisines from various stalls.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 4, 'Outdoor', NULL, 56, NULL, '', 'https://www.naschmarkt-vienna.com', 12),
(60, 'St. Stephen\'s Cathedral Climb', 'Climb the 343 steps to the top of the South Tower for a breathtaking panoramic view of Vienna\'s historic center.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 57, NULL, '', 'https://www.stephanskirche.at', 30),
(61, 'Prater Amusement Park', 'Spend a fun-filled day at Vienna\'s iconic amusement park, home to the famous Giant Ferris Wheel and countless thrilling rides.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 2, 'Outdoor', NULL, 58, NULL, '', 'https://www.prater.at', 0),
(62, 'Spanish Riding School Performance', 'Witness a stunning performance by the world-famous Lipizzaner stallions in Vienna\'s historic Winter Riding School.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 59, NULL, '', 'https://www.srs.at', 500),
(63, 'Hofburg Imperial Palace Exploration', 'Step into the world of the Habsburgs at the Hofburg Palace, with a visit to the Imperial Apartments, the Sisi Museum, and the Silver Collection.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 60, NULL, '', 'https://www.hofburg-wien.at', 100),
(64, 'Vienna State Opera Backstage Tour', 'Go behind the scenes of one of the world\'s leading opera houses and discover its rich history and impressive architecture.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 61, NULL, '', 'https://www.wiener-staatsoper.at', 25),
(65, 'Wachau Valley Day Trip', 'Take a full-day excursion from Vienna to the scenic Wachau Valley, famous for its picturesque vineyards, charming villages, and historic castles.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 2, 'Outdoor', NULL, 62, NULL, '', 'https://www.wachau.at', 40),
(66, 'Kunsthistorisches Museum Visit', 'Explore an incredible collection of art and artifacts at the Museum of Art History, including masterpieces by Rubens, Titian, and Vermeer.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 63, NULL, '', 'https://www.khm.at', 0),
(67, 'Vienna Woods Hiking Tour', 'Enjoy a refreshing hike through the Vienna Woods, a beautiful forested area on the outskirts of the city.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 0, 2, 'Outdoor', NULL, 64, NULL, '', NULL, 15),
(68, 'Vienna Christmas Market Stroll', 'Experience the festive magic of Vienna by visiting its famous Christmas markets, enjoying mulled wine and local treats.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Outdoor', NULL, 65, NULL, '', 'https://www.christkindlmarkt.at', 0),
(69, 'Street Art Exploration in Spittelberg', 'Wander through the charming cobblestone streets of Spittelberg, discovering hidden courtyards and vibrant street art.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 0, 1, 'Outdoor', NULL, 66, NULL, '', NULL, 5),
(70, 'Mostviertel Cycle Tour', 'A relaxing bike ride through the picturesque Mostviertel region, famous for its pear trees and local cider.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 2, 'Outdoor', NULL, 67, NULL, '', 'https://www.mostviertel.at', 20),
(71, 'Amstetten Indoor Climbing Center', 'Challenge yourself with a session at the local indoor climbing center, suitable for all skill levels.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 68, NULL, '', 'https://www.amstetten-kletterhalle.at', 10),
(72, 'Abt-Eustachius-Fuchs Museum Visit', 'Discover the local history of Amstetten and the Mostviertel region at this small, insightful museum.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 0, 1, 'Indoor', NULL, 69, NULL, '', NULL, 0),
(73, 'Seefest Greinbach Lake', 'Spend a relaxing day at Greinbach Lake, with options for swimming, sunbathing, and enjoying the beautiful scenery.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 0, 1, 'Outdoor', NULL, 70, NULL, '', NULL, 0),
(74, 'Hiking to Kollmitzberg', 'A moderate hike to the top of Kollmitzberg, offering stunning panoramic views of the Mostviertel and Danube valleys.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 0, 2, 'Outdoor', NULL, 71, NULL, '', NULL, 8),
(75, 'Amstetten City Walk', 'A guided or self-guided walk through the city center, exploring historical buildings and local landmarks.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 0, 1, 'Outdoor', NULL, 72, NULL, '', NULL, 10),
(76, 'Miniature Golf at Schloss Ulmerfeld', 'A fun game of miniature golf located in the picturesque surroundings of Ulmerfeld Castle.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 2, 'Outdoor', NULL, 73, NULL, '', NULL, 6),
(77, 'Amstetten Forest Adventure Park', 'An exhilarating day at the high-ropes course, with various levels of difficulty for all ages.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 2, 'Outdoor', NULL, 74, NULL, '', NULL, 15),
(78, 'Cooking Class: Mostviertler Cuisine', 'Learn to prepare traditional Mostviertler dishes and enjoy the culinary delights of the region.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 4, 'Indoor', NULL, 75, NULL, '', NULL, 10),
(79, 'St. Peter in der Au Castle Visit', 'Visit the beautiful castle of St. Peter in der Au, with its historical grounds and interesting exhibits.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 0, 1, 'Indoor', NULL, 76, NULL, '', NULL, 0),
(80, 'Amstetten City Baths (Freizeithallenbad)', 'A day of fun and relaxation at the indoor and outdoor pools, with slides and a sauna area.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Indoor', NULL, 77, NULL, '', 'https://www.amstetten.at/freizeithallenbad', 0),
(81, 'Christmas Market at Schloss Ulmerfeld', 'A festive winter event at Ulmerfeld Castle, featuring local crafts, food, and a cozy holiday atmosphere.', 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-09-02 14:26:30', 1, 1, 1, 'Outdoor', NULL, NULL, NULL, '', NULL, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `category`
--

CREATE TABLE `category` (
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `color` char(7) NOT NULL CHECK (`color` regexp '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

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
(16, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 59);

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
('NPFiASPHZPTT5FkwnKK5VHwWncq2', '62A8irqlJsMF7SK9UnKAORzubMu2', 'pending'),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'jNeck60VMGTg8dRYbdUHPWaE56g1', 'accepted'),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'PwGtN8NAPERY4E1yubhZhNdx0r82', 'pending'),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'zMu6buowgTdvrhrJ7eXF3sCma1p1', 'accepted'),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'accepted');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `has_season`
--

CREATE TABLE `has_season` (
  `activity_id` int(11) NOT NULL,
  `season_id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `has_season`
--

INSERT INTO `has_season` (`activity_id`, `season_id`, `timestamp`) VALUES
(46, 1, '2025-08-11 12:12:28'),
(46, 2, '2025-08-11 12:12:28'),
(46, 3, '2025-08-11 12:12:28'),
(50, 2, '2025-08-06 14:37:26'),
(50, 4, '2025-08-06 14:37:26'),
(51, 2, '2025-05-09 12:41:18'),
(54, 1, '2025-05-09 12:46:40'),
(54, 2, '2025-05-09 12:46:40'),
(54, 3, '2025-05-09 12:46:40'),
(57, 1, '2025-09-02 12:32:28'),
(57, 2, '2025-09-02 12:32:28'),
(57, 3, '2025-09-02 12:32:28'),
(57, 4, '2025-09-02 12:32:28'),
(58, 1, '2025-09-02 12:32:28'),
(58, 2, '2025-09-02 12:32:28'),
(58, 3, '2025-09-02 12:32:28'),
(59, 1, '2025-09-02 12:32:28'),
(59, 2, '2025-09-02 12:32:28'),
(59, 3, '2025-09-02 12:32:28'),
(60, 1, '2025-09-02 12:32:28'),
(60, 2, '2025-09-02 12:32:28'),
(60, 3, '2025-09-02 12:32:28'),
(60, 4, '2025-09-02 12:32:28'),
(61, 1, '2025-09-02 12:32:28'),
(61, 2, '2025-09-02 12:32:28'),
(61, 3, '2025-09-02 12:32:28'),
(62, 1, '2025-09-02 12:32:28'),
(62, 2, '2025-09-02 12:32:28'),
(62, 3, '2025-09-02 12:32:28'),
(62, 4, '2025-09-02 12:32:28'),
(63, 1, '2025-09-02 12:32:28'),
(63, 2, '2025-09-02 12:32:28'),
(63, 3, '2025-09-02 12:32:28'),
(63, 4, '2025-09-02 12:32:28'),
(64, 1, '2025-09-02 12:32:28'),
(64, 2, '2025-09-02 12:32:28'),
(64, 3, '2025-09-02 12:32:28'),
(64, 4, '2025-09-02 12:32:28'),
(65, 1, '2025-09-02 12:32:28'),
(65, 2, '2025-09-02 12:32:28'),
(65, 3, '2025-09-02 12:32:28'),
(66, 1, '2025-09-02 12:32:28'),
(66, 2, '2025-09-02 12:32:28'),
(66, 3, '2025-09-02 12:32:28'),
(66, 4, '2025-09-02 12:32:28'),
(67, 1, '2025-09-02 12:32:28'),
(67, 2, '2025-09-02 12:32:28'),
(67, 3, '2025-09-02 12:32:28'),
(68, 4, '2025-09-02 12:32:28'),
(69, 1, '2025-09-02 12:32:28'),
(69, 2, '2025-09-02 12:32:28'),
(69, 3, '2025-09-02 12:32:28'),
(70, 1, '2025-09-02 12:32:28'),
(70, 2, '2025-09-02 12:32:28'),
(70, 3, '2025-09-02 12:32:28'),
(71, 1, '2025-09-02 12:32:28'),
(71, 2, '2025-09-02 12:32:28'),
(71, 3, '2025-09-02 12:32:28'),
(71, 4, '2025-09-02 12:32:28'),
(72, 1, '2025-09-02 12:32:28'),
(72, 2, '2025-09-02 12:32:28'),
(72, 3, '2025-09-02 12:32:28'),
(72, 4, '2025-09-02 12:32:28');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `has_tags`
--

CREATE TABLE `has_tags` (
  `activity_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `has_weather`
--

CREATE TABLE `has_weather` (
  `activity_id` int(11) NOT NULL,
  `weather_id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `has_weather`
--

INSERT INTO `has_weather` (`activity_id`, `weather_id`, `timestamp`) VALUES
(46, 1, '2025-08-11 12:12:28'),
(46, 3, '2025-08-11 12:12:28'),
(50, 1, '2025-08-06 14:37:26'),
(50, 3, '2025-08-06 14:37:26'),
(50, 6, '2025-08-06 14:37:26'),
(50, 7, '2025-08-06 14:37:26'),
(51, 1, '2025-05-09 12:41:18'),
(51, 3, '2025-05-09 12:41:18'),
(51, 4, '2025-05-09 12:41:18'),
(51, 7, '2025-05-09 12:41:18'),
(54, 1, '2025-05-09 12:46:40'),
(54, 3, '2025-05-09 12:46:40'),
(57, 1, '2025-09-02 12:32:28'),
(57, 2, '2025-09-02 12:32:28'),
(57, 3, '2025-09-02 12:32:28'),
(57, 4, '2025-09-02 12:32:28'),
(58, 1, '2025-09-02 12:32:28'),
(58, 2, '2025-09-02 12:32:28'),
(59, 1, '2025-09-02 12:32:28'),
(59, 2, '2025-09-02 12:32:28'),
(59, 3, '2025-09-02 12:32:28'),
(60, 1, '2025-09-02 12:32:28'),
(60, 2, '2025-09-02 12:32:28'),
(60, 3, '2025-09-02 12:32:28'),
(60, 4, '2025-09-02 12:32:28'),
(61, 1, '2025-09-02 12:32:28'),
(61, 2, '2025-09-02 12:32:28'),
(61, 3, '2025-09-02 12:32:28'),
(62, 1, '2025-09-02 12:32:28'),
(62, 2, '2025-09-02 12:32:28'),
(62, 3, '2025-09-02 12:32:28'),
(62, 4, '2025-09-02 12:32:28'),
(63, 1, '2025-09-02 12:32:28'),
(63, 2, '2025-09-02 12:32:28'),
(63, 3, '2025-09-02 12:32:28'),
(63, 4, '2025-09-02 12:32:28'),
(64, 1, '2025-09-02 12:32:28'),
(64, 2, '2025-09-02 12:32:28'),
(64, 3, '2025-09-02 12:32:28'),
(64, 4, '2025-09-02 12:32:28'),
(65, 1, '2025-09-02 12:32:28'),
(65, 2, '2025-09-02 12:32:28'),
(65, 3, '2025-09-02 12:32:28'),
(66, 1, '2025-09-02 12:32:28'),
(66, 2, '2025-09-02 12:32:28'),
(66, 3, '2025-09-02 12:32:28'),
(66, 4, '2025-09-02 12:32:28'),
(67, 1, '2025-09-02 12:32:28'),
(67, 2, '2025-09-02 12:32:28'),
(67, 3, '2025-09-02 12:32:28'),
(68, 2, '2025-09-02 12:32:28'),
(68, 4, '2025-09-02 12:32:28'),
(69, 1, '2025-09-02 12:32:28'),
(69, 2, '2025-09-02 12:32:28'),
(69, 3, '2025-09-02 12:32:28'),
(70, 1, '2025-09-02 12:32:28'),
(70, 2, '2025-09-02 12:32:28'),
(70, 3, '2025-09-02 12:32:28'),
(71, 1, '2025-09-02 12:32:28'),
(71, 2, '2025-09-02 12:32:28'),
(71, 3, '2025-09-02 12:32:28'),
(71, 4, '2025-09-02 12:32:28'),
(72, 1, '2025-09-02 12:32:28'),
(72, 2, '2025-09-02 12:32:28'),
(72, 3, '2025-09-02 12:32:28'),
(72, 4, '2025-09-02 12:32:28');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `is_bookmarked`
--

CREATE TABLE `is_bookmarked` (
  `activity_id` int(11) NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `bookmarked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `is_bookmarked`
--

INSERT INTO `is_bookmarked` (`activity_id`, `user_id`, `bookmarked_at`) VALUES
(46, 'NCb6y0zFkqaHqz5rQjGhom0wPUr1', '2025-08-15 08:31:56'),
(54, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2025-09-16 18:51:41'),
(57, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2025-09-02 15:26:36');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `location`
--

CREATE TABLE `location` (
  `location_id` int(11) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `address` text DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `locality` varchar(255) DEFAULT NULL,
  `alpha_2_codes` varchar(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `location`
--

INSERT INTO `location` (`location_id`, `longitude`, `latitude`, `address`, `country`, `locality`, `alpha_2_codes`) VALUES
(1, -17.005173, 32.714377, NULL, 'Portugal', 'Jardim da Serra', 'PT'),
(2, -16.999839, 32.724373, NULL, 'Portugal', 'Jardim da Serra', 'PT'),
(3, 18.815050, 68.377026, NULL, 'Schweden', NULL, 'SE'),
(4, 18.833579, 68.370430, NULL, 'Schweden', NULL, 'SE'),
(5, 18.851130, 68.379639, NULL, 'Schweden', '', 'SE'),
(6, 14.876352, 48.114699, NULL, 'Österreich', 'Amstetten', 'AT'),
(7, 14.876347, 48.114709, NULL, 'Österreich', 'Amstetten', 'AT'),
(8, 15.179036, 50.494300, NULL, 'Tschechien', 'Libošovice', 'CZ'),
(9, 13.333333, 47.969791, NULL, 'Österreich', 'Straßwalchen', 'AT'),
(10, 10.619711, 47.116964, NULL, 'Österreich', 'Fließ', 'AT'),
(11, 13.996762, 44.909209, NULL, 'Kroatien', 'Kavran', 'HR'),
(12, 12.759208, 47.271314, NULL, 'Österreich', 'Kaprun', 'AT'),
(13, -9.181559, 38.645029, NULL, 'Portugal', 'Sobreda', 'PT'),
(14, -9.116989, 38.549115, NULL, 'Portugal', 'Fernão Ferro', 'PT'),
(15, -6.260544, 31.577363, NULL, 'Marokko', 'El Mrabitine', 'MA'),
(16, -4.502732, 32.584872, NULL, 'Marokko', 'Lhndare', 'MA'),
(17, -3.313674, 40.253743, NULL, 'Spanien', 'Tielmes', 'ES'),
(18, -3.679388, 40.226019, NULL, 'Spanien', 'Valdemoro', 'ES'),
(19, -6.568161, 31.691815, NULL, 'Marokko', 'Iguer n\'Oual', 'MA'),
(20, 19.529622, 46.809555, NULL, 'Ungarn', 'Helvécia', 'HU'),
(21, 14.875456, 48.123762, NULL, 'Österreich', 'Amstetten', 'AT'),
(22, 4.860771, 50.729369, NULL, 'Belgien', '1370 Jodoigne', 'BE'),
(23, 7.206094, 43.585853, NULL, 'Frankreich', '', 'FR'),
(24, 16.585286, 47.273733, NULL, 'Ungarn', '', 'HU'),
(26, 8.587240, 47.034662, NULL, NULL, NULL, NULL),
(27, 8.587240, 47.034662, NULL, NULL, NULL, NULL),
(28, 7.708333, 52.047509, NULL, NULL, NULL, NULL),
(29, 7.664388, 46.944733, NULL, NULL, NULL, NULL),
(30, 8.477376, 46.794514, NULL, NULL, NULL, NULL),
(31, 14.695638, 45.976066, NULL, NULL, NULL, NULL),
(32, 18.790571, 68.350242, NULL, NULL, NULL, NULL),
(33, 18.790571, 68.350242, NULL, NULL, NULL, NULL),
(34, 18.790571, 68.350242, NULL, NULL, NULL, NULL),
(35, 18.790571, 68.350242, NULL, NULL, NULL, NULL),
(36, 18.790571, 68.350242, NULL, NULL, NULL, NULL),
(37, 18.790571, 68.350242, NULL, NULL, NULL, NULL),
(38, 10.257161, 45.238250, NULL, NULL, NULL, NULL),
(39, 14.876135, 48.113458, NULL, NULL, NULL, NULL),
(40, 14.876135, 48.113458, NULL, NULL, NULL, NULL),
(41, -17.090364, 32.745923, NULL, '', '', NULL),
(42, 14.453939, 50.030771, NULL, '', '', NULL),
(43, 14.868697, 48.129941, NULL, '', '', NULL),
(44, 18.874161, 68.338895, NULL, '', '', NULL),
(45, 14.876347, 48.114709, NULL, NULL, NULL, NULL),
(46, -17.090364, 32.745923, NULL, '', '', NULL),
(47, -17.090364, 32.745923, NULL, '', '', NULL),
(48, -17.005173, 32.714377, NULL, '', '', NULL),
(49, 14.133600, 45.080800, NULL, 'Kroatien', '', 'HR'),
(50, -8.532465, 41.126990, NULL, 'Portugal', 'São Cosme', 'PT'),
(51, 18.977300, 68.207400, NULL, '', '', NULL),
(52, -16.851364, 32.603385, NULL, 'Portugal', '', 'PT'),
(53, -17.090364, 32.745923, NULL, '', '', NULL),
(54, 16.311900, 48.184600, NULL, 'Austria', 'Vienna', NULL),
(55, 16.420000, 48.210000, NULL, 'Austria', 'Vienna', NULL),
(56, 16.363900, 48.196300, NULL, 'Austria', 'Vienna', NULL),
(57, 16.373100, 48.208400, NULL, 'Austria', 'Vienna', NULL),
(58, 16.402600, 48.216300, NULL, 'Austria', 'Vienna', NULL),
(59, 16.367000, 48.207800, NULL, 'Austria', 'Vienna', NULL),
(60, 16.365300, 48.205700, NULL, 'Austria', 'Vienna', NULL),
(61, 16.371200, 48.202900, NULL, 'Austria', 'Vienna', NULL),
(62, 15.424300, 48.384200, NULL, 'Austria', 'Krems an der Donau', NULL),
(63, 16.361900, 48.203500, NULL, 'Austria', 'Vienna', NULL),
(64, 16.100000, 48.210000, NULL, 'Austria', 'Lower Austria', NULL),
(65, 16.353300, 48.204500, NULL, 'Austria', 'Vienna', NULL),
(66, 14.877800, 48.121100, NULL, 'Austria', 'Amstetten', NULL),
(67, 14.877800, 48.121100, NULL, 'Austria', 'Amstetten', NULL),
(68, 14.931700, 48.096400, NULL, 'Austria', 'Greinbach', NULL),
(69, 15.020000, 48.130000, NULL, 'Austria', 'Lower Austria', NULL),
(70, 14.874100, 48.107000, NULL, 'Austria', 'Ulmerfeld-Hausmening', NULL),
(71, 14.848800, 48.046900, NULL, 'Austria', 'St. Peter in der Au', NULL),
(72, 14.877800, 48.121100, NULL, 'Austria', 'Amstetten', NULL),
(73, 14.874100, 48.107000, NULL, 'Austria', 'Ulmerfeld-Hausmening', NULL),
(74, 14.877800, 48.121100, NULL, 'Austria', 'Amstetten', NULL),
(75, 14.877800, 48.121100, NULL, 'Austria', 'Amstetten', NULL),
(76, 14.877800, 48.121100, NULL, 'Austria', 'Amstetten', NULL),
(77, 14.874100, 48.107000, NULL, 'Austria', 'Ulmerfeld-Hausmening', 'AT'),
(79, 21.062352, 52.155861, NULL, 'Polen', 'Warszawa', 'PL'),
(80, 11.311800, 43.606400, NULL, 'Italien', 'Greve', 'IT'),
(81, 0.000000, 0.000000, NULL, 'Bhutan', '', 'BT'),
(82, 3.780600, 45.419300, NULL, 'Frankreich', 'Beurières', 'FR'),
(83, 20.270400, 67.772500, NULL, 'Schweden', 'Kiruna', 'SE'),
(84, 0.000000, 0.000000, NULL, '', '', ''),
(85, 18.858900, 68.328500, NULL, 'Schweden', 'Abisko', 'SE'),
(86, 48.125020, 48.125020, NULL, 'Austria', 'Amstetten', 'AT'),
(87, 48.125020, 48.125020, NULL, 'Austria', 'Amstetten', 'AT'),
(88, 48.196363, 48.196363, NULL, 'Austria', 'Hofamt Priel', 'AT'),
(89, 48.125020, 48.125020, NULL, 'Austria', 'Amstetten', 'AT'),
(90, 48.208070, 48.208070, NULL, 'Austria', 'Vienna', 'AT'),
(91, 4.904139, 52.367573, NULL, 'Netherlands', 'Amsterdam', 'NL'),
(92, 14.869340, 48.125020, NULL, 'Austria', 'Amstetten', 'AT');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `memories`
--

CREATE TABLE `memories` (
  `memory_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `text` text DEFAULT NULL,
  `memory_date` varchar(255) DEFAULT NULL,
  `memory_end_date` varchar(255) DEFAULT NULL,
  `title_pic` varchar(255) DEFAULT NULL,
  `picture_count` int(11) DEFAULT 0,
  `user_id` varchar(255) NOT NULL,
  `activity_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `share_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `memories`
--

INSERT INTO `memories` (`memory_id`, `title`, `text`, `memory_date`, `memory_end_date`, `title_pic`, `picture_count`, `user_id`, `activity_id`, `location_id`, `share_token`) VALUES
(59, 'Kungsleden Boys', 'Der Kungsleden ist kein Spaziergang, er ist ein Versprechen an die Wildnis. Wir haben Blasen gezählt, Flüsse überquert und in STF-Hütten den besten Kaffee der Welt getrunken (weil er nach harter Arbeit schmeckte). Von den majestätischen Ausblicken am Tjäktja-Pass bis hin zu den einsamen Momenten im Tal von Kebnekaise – diese Bilder sind die Beweise für ein Abenteuer, das uns ein kleines Stück verändert hat. Lappland, du hast es uns nicht immer leicht gemacht, aber wir kommen wieder.', '2023-07-15T22:00:00.000Z', '2023-07-21T22:00:00.000Z', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F59%2F1773849627932_vyczvf74g.jpg?alt=media&token=ed5a34e7-8b7a-4e04-a67a-e1234ad1fa1d', 14, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 85, NULL),
(82, 'test again', '', '2026-04-14T00:00:00.000', '2026-04-14T00:00:00.000', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F82%2F1776182925108_000158649.jpg?alt=media&token=98303dd8-0250-4161-9d10-435512194292', 4, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(93, 'test location 106', '', '2026-05-12T00:00:00.000', '2026-05-12T00:00:00.000', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F93%2F1779538372602_000607415.jpg?alt=media&token=04aff150-0b12-4dfc-baf8-bec3dd13a045', 2, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 90, NULL),
(101, 'new memory', '123', '2026-06-02T22:00:00.000Z', '2026-06-03T22:00:00.000Z', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F101%2F1779983343805_000645078.jpg?alt=media&token=cd60f2c7-f910-479e-96ac-2e1573d41a37', 2, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(105, 'Future test', '', '2026-06-09T22:00:00.000Z', '2026-06-11T22:00:00.000Z', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F105%2F1780929422297_gcwmqo67o.jpg?alt=media&token=47341b93-4a65-446f-ae7f-4faa493d5c7c', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(113, '123', '', NULL, NULL, '', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(114, 'New, Updated Title', '', NULL, NULL, '', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(115, 'Vienna to Grado Rikksha Trip', '', NULL, NULL, '', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(116, NULL, '', NULL, NULL, '', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(117, '', '', NULL, NULL, '', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(118, '', '', NULL, NULL, '', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL),
(119, '', '', NULL, NULL, '', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `memory_invites`
--

CREATE TABLE `memory_invites` (
  `invite_id` bigint(20) NOT NULL,
  `memory_id` int(11) NOT NULL,
  `invite_token` varchar(255) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `max_uses` int(11) DEFAULT NULL,
  `current_uses` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `memory_invites`
--

INSERT INTO `memory_invites` (`invite_id`, `memory_id`, `invite_token`, `created_by`, `created_at`, `expires_at`, `max_uses`, `current_uses`, `is_active`) VALUES
(1, 59, '9f7cc4107c261b3a30d187da53a314bda134dac1f6931c990e0c229c2261bb27', NULL, '2026-03-24 16:28:37', '2026-03-31 15:28:37', NULL, 0, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `paddle_order_id` varchar(255) DEFAULT NULL,
  `paddle_payment_id` varchar(255) DEFAULT NULL,
  `paddle_receipt_url` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `status` enum('pending','completed','failed','refunded','disputed') NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `paddle_fee` decimal(10,2) DEFAULT NULL,
  `net_amount` decimal(10,2) DEFAULT NULL,
  `billing_period_start` date DEFAULT NULL,
  `billing_period_end` date DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `season`
--

CREATE TABLE `season` (
  `season_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `icon_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `season`
--

INSERT INTO `season` (`season_id`, `name`, `icon_name`) VALUES
(1, 'Spring', 'mdi-flower'),
(2, 'Summer', 'mdi-weather-sunny'),
(3, 'Autumn', 'mdi-leaf'),
(4, 'Winter', 'mdi-snowflake');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `subscriptions`
--

CREATE TABLE `subscriptions` (
  `subscription_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `paddle_subscription_id` varchar(255) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `status` enum('active','trialing','past_due','paused','deleted','cancelled') NOT NULL,
  `paddle_status` varchar(50) DEFAULT NULL,
  `paddle_user_id` varchar(255) DEFAULT NULL,
  `paddle_email` varchar(255) DEFAULT NULL,
  `cancel_url` text DEFAULT NULL,
  `update_url` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `unit_price` decimal(10,2) DEFAULT NULL,
  `next_bill_date` date DEFAULT NULL,
  `last_payment_date` date DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `paused_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `subscriptions`
--

INSERT INTO `subscriptions` (`subscription_id`, `user_id`, `paddle_subscription_id`, `plan_id`, `status`, `paddle_status`, `paddle_user_id`, `paddle_email`, `cancel_url`, `update_url`, `quantity`, `currency`, `unit_price`, `next_bill_date`, `last_payment_date`, `trial_ends_at`, `paused_at`, `cancelled_at`, `ends_at`, `created_at`, `updated_at`) VALUES
(1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '', 1, 'active', NULL, NULL, NULL, NULL, NULL, 1, 'USD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-20 17:13:03', '2026-01-20 17:13:03');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `subscription_history`
--

CREATE TABLE `subscription_history` (
  `history_id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_type` enum('created','updated','cancelled','reactivated','paused','resumed','payment_succeeded','payment_failed','plan_changed') NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `old_plan_id` int(11) DEFAULT NULL,
  `new_plan_id` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `plan_id` int(11) NOT NULL,
  `paddle_product_id` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `billing_cycle` enum('monthly','annual','lifetime') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `storage_limit_gb` int(11) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `subscription_plans`
--

INSERT INTO `subscription_plans` (`plan_id`, `paddle_product_id`, `name`, `description`, `billing_cycle`, `price`, `currency`, `storage_limit_gb`, `features`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'pro_01kdzkzyect0rapcfe7pm655s6', 'UNLIMITED', 'Enterprise plan with unlimited everything', 'monthly', 50.00, 'USD', -1, NULL, 1, '2026-01-02 15:11:22', '2026-01-20 17:35:29'),
(3, 'pri_01kdzm7tasxcjk35t9vfhr55f3', 'UNLIMITED', 'Enterprise plan with unlimited everything', '', 500.00, 'USD', -1, NULL, 1, '2026-01-02 15:12:19', '2026-01-20 17:35:35'),
(4, '123', 'PRO', 'PRO montly', 'monthly', 20.00, 'USD', 100, NULL, 1, '2026-01-20 17:09:28', '2026-01-20 17:35:39');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tag`
--

CREATE TABLE `tag` (
  `tag_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

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
  `profilepic_thumb` varchar(255) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `country_cca2` varchar(2) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `used_storage_space` int(11) DEFAULT NULL,
  `account_type` enum('FREE','PRO','UNLIMITED') NOT NULL DEFAULT 'FREE',
  `current_subscription_id` int(11) DEFAULT NULL,
  `paddle_customer_id` varchar(255) DEFAULT NULL,
  `subscription_ends_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`user_id`, `email`, `name`, `dob`, `gender`, `location_id`, `bio`, `profilepic`, `profilepic_thumb`, `username`, `country`, `country_cca2`, `company_id`, `instagram`, `used_storage_space`, `account_type`, `current_subscription_id`, `paddle_customer_id`, `subscription_ends_at`) VALUES
('jNeck60VMGTg8dRYbdUHPWaE56g1', 'miriam.langthaller@icloud.com', 'Mimal', '2006-02-05', 'Female', NULL, 'Once tried to high-five a mirror (it didn\'t end well)', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FjNeck60VMGTg8dRYbdUHPWaE56g1%2Fprofile.jpg?alt=media&token=f7d97a7f-3665-4e00-9747-f78969b65e55', NULL, NULL, 'Austria', '', NULL, NULL, 0, 'PRO', NULL, NULL, NULL),
('NCb6y0zFkqaHqz5rQjGhom0wPUr1', 'memorise@online.com', 'Memorise Admin', '2025-05-08T22:00:00.000Z', 'Male', NULL, 'On the rigth side of force!', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNCb6y0zFkqaHqz5rQjGhom0wPUr1%2Fprofile.jpg?alt=media&token=ccd93b8c-206f-4f8c-86d1-a8ef70c42131', NULL, 'big boss', 'Austria', '', NULL, NULL, 0, 'FREE', NULL, NULL, NULL),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'florianhofer024@gmail.com', 'Florian Hofer', '2002-12-24T00:00:00.000', 'Male', NULL, 'Find happienes in the simplicity of getting things done', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNPFiASPHZPTT5FkwnKK5VHwWncq2%2Fprofile.jpg?alt=media&token=72b7dc09-7cb0-41a2-acdf-7937a984098d', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNPFiASPHZPTT5FkwnKK5VHwWncq2%2Fthumbnail.jpg?alt=media&token=0d80c9e5-7711-4eef-8c44-2a280b7c591b', NULL, NULL, '', NULL, NULL, 643496950, 'UNLIMITED', 1, NULL, NULL),
('PwGtN8NAPERY4E1yubhZhNdx0r82', 'test.memorise@memorise.online', 'Nicht Angegeben', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, 'FREE', NULL, NULL, NULL),
('q51SjsmPOoNQOHCt0auiDIcdqUd2', 'a.k.hofer@aon.com', 'Karin Hofer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, 0, 'FREE', NULL, NULL, NULL),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 'niki.gugi@gmail.com', 'Guginator', '2003-08-31T22:00:00.000Z', 'Male', NULL, 'so ca. |     |', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FqCRU6GRChTXyX9oMI3OUAYBnhQ92%2Fprofile.jpg?alt=media&token=31e76d9a-7ac3-48d4-89cd-c6191659c33a', NULL, 'Guginator', 'Austria', '', NULL, 'Geilesau123', 0, 'FREE', NULL, NULL, NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 'jonaskra@gmail.com', 'Jonas Krahofer', '2003-07-09T22:00:00.000Z', 'Male', NULL, 'test bio', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FzMu6buowgTdvrhrJ7eXF3sCma1p1%2Fprofile.jpg?alt=media&token=43a22d18-636e-424b-ba8a-1fe844887fc8', NULL, 'tset', 'Austria', '', NULL, 'test123123', 0, 'FREE', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_has_memory`
--

CREATE TABLE `user_has_memory` (
  `user_id` varchar(255) NOT NULL,
  `memory_id` int(11) NOT NULL,
  `status` enum('creator','friend') DEFAULT 'creator',
  `color` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_has_memory`
--

INSERT INTO `user_has_memory` (`user_id`, `memory_id`, `status`, `color`) VALUES
('jNeck60VMGTg8dRYbdUHPWaE56g1', 59, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 93, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 113, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 114, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 116, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 119, 'friend', NULL),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 59, 'friend', NULL),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 115, 'friend', '#FF0000'),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 115, 'friend', '#00FF00');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `weather`
--

CREATE TABLE `weather` (
  `weather_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `icon_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Daten für Tabelle `weather`
--

INSERT INTO `weather` (`weather_id`, `name`, `icon_name`) VALUES
(1, 'Sunny', 'mdi-weather-sunny'),
(2, 'Partly Cloudy', 'mdi-weather-partly-cloudy'),
(3, 'Cloudy', 'mdi-weather-cloudy'),
(4, 'Rainy', 'mdi-weather-rainy'),
(5, 'Stormy', 'mdi-weather-lightning'),
(6, 'Snowy', 'mdi-weather-snowy'),
(7, 'Windy', 'mdi-weather-windy'),
(8, 'Foggy', 'mdi-weather-fog');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `webhook_logs`
--

CREATE TABLE `webhook_logs` (
  `log_id` int(11) NOT NULL,
  `paddle_alert_id` varchar(255) DEFAULT NULL,
  `alert_name` varchar(100) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `signature_valid` tinyint(1) NOT NULL DEFAULT 0,
  `processed` tinyint(1) NOT NULL DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`creator_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `base_memory_id` (`base_memory_id`);

--
-- Indizes für die Tabelle `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`category_id`);

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
-- Indizes für die Tabelle `has_season`
--
ALTER TABLE `has_season`
  ADD PRIMARY KEY (`activity_id`,`season_id`),
  ADD KEY `season_id` (`season_id`);

--
-- Indizes für die Tabelle `has_tags`
--
ALTER TABLE `has_tags`
  ADD PRIMARY KEY (`activity_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indizes für die Tabelle `has_weather`
--
ALTER TABLE `has_weather`
  ADD PRIMARY KEY (`activity_id`,`weather_id`),
  ADD KEY `weather_id` (`weather_id`);

--
-- Indizes für die Tabelle `is_bookmarked`
--
ALTER TABLE `is_bookmarked`
  ADD PRIMARY KEY (`activity_id`,`user_id`),
  ADD KEY `fk_user_id` (`user_id`);

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
  ADD UNIQUE KEY `share_token` (`share_token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `fk_activity` (`activity_id`),
  ADD KEY `idx_memories_share_token` (`share_token`);

--
-- Indizes für die Tabelle `memory_invites`
--
ALTER TABLE `memory_invites`
  ADD PRIMARY KEY (`invite_id`),
  ADD UNIQUE KEY `invite_token` (`invite_token`),
  ADD KEY `fk_memory_invites_memory` (`memory_id`),
  ADD KEY `fk_memory_invites_user` (`created_by`);

--
-- Indizes für die Tabelle `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `idx_subscription_id` (`subscription_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_paddle_order_id` (`paddle_order_id`),
  ADD KEY `idx_paid_at` (`paid_at`);

--
-- Indizes für die Tabelle `season`
--
ALTER TABLE `season`
  ADD PRIMARY KEY (`season_id`);

--
-- Indizes für die Tabelle `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`subscription_id`),
  ADD UNIQUE KEY `unique_paddle_subscription` (`paddle_subscription_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_next_bill_date` (`next_bill_date`);

--
-- Indizes für die Tabelle `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_subscription_id` (`subscription_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indizes für die Tabelle `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`plan_id`),
  ADD UNIQUE KEY `unique_paddle_product` (`paddle_product_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indizes für die Tabelle `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`tag_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `fk_company` (`company_id`),
  ADD KEY `idx_current_subscription` (`current_subscription_id`),
  ADD KEY `idx_paddle_customer` (`paddle_customer_id`);

--
-- Indizes für die Tabelle `user_has_memory`
--
ALTER TABLE `user_has_memory`
  ADD PRIMARY KEY (`user_id`,`memory_id`),
  ADD KEY `memory_id` (`memory_id`);

--
-- Indizes für die Tabelle `weather`
--
ALTER TABLE `weather`
  ADD PRIMARY KEY (`weather_id`);

--
-- Indizes für die Tabelle `webhook_logs`
--
ALTER TABLE `webhook_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_alert_name` (`alert_name`),
  ADD KEY `idx_processed` (`processed`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_paddle_alert_id` (`paddle_alert_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `activity`
--
ALTER TABLE `activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT für Tabelle `category`
--
ALTER TABLE `category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT für Tabelle `location`
--
ALTER TABLE `location`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT für Tabelle `memories`
--
ALTER TABLE `memories`
  MODIFY `memory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT für Tabelle `memory_invites`
--
ALTER TABLE `memory_invites`
  MODIFY `invite_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `season`
--
ALTER TABLE `season`
  MODIFY `season_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `subscription_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `subscription_history`
--
ALTER TABLE `subscription_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `plan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT für Tabelle `tag`
--
ALTER TABLE `tag`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `weather`
--
ALTER TABLE `weather`
  MODIFY `weather_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT für Tabelle `webhook_logs`
--
ALTER TABLE `webhook_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `activity`
--
ALTER TABLE `activity`
  ADD CONSTRAINT `activity_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activity_ibfk_2` FOREIGN KEY (`base_memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE SET NULL;

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
-- Constraints der Tabelle `has_season`
--
ALTER TABLE `has_season`
  ADD CONSTRAINT `has_season_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `has_season_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `season` (`season_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `has_tags`
--
ALTER TABLE `has_tags`
  ADD CONSTRAINT `has_tags_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `has_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`tag_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `has_weather`
--
ALTER TABLE `has_weather`
  ADD CONSTRAINT `has_weather_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `has_weather_ibfk_2` FOREIGN KEY (`weather_id`) REFERENCES `weather` (`weather_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `is_bookmarked`
--
ALTER TABLE `is_bookmarked`
  ADD CONSTRAINT `fk_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `memories`
--
ALTER TABLE `memories`
  ADD CONSTRAINT `fk_activity` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`),
  ADD CONSTRAINT `memories_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);

--
-- Constraints der Tabelle `memory_invites`
--
ALTER TABLE `memory_invites`
  ADD CONSTRAINT `fk_memory_invites_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_memory_invites_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints der Tabelle `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`subscription_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscription_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`plan_id`),
  ADD CONSTRAINT `fk_subscription_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD CONSTRAINT `fk_history_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`subscription_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `tag`
--
ALTER TABLE `tag`
  ADD CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE;

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
