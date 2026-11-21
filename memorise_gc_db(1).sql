-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 21. Nov 2026 um 12:54
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
(30, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 125);

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
('DoMcITZOdAdR74DsCsyuB7EOWiE2', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'pending'),
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
-- Tabellenstruktur für Tabelle `link_previews`
--

CREATE TABLE `link_previews` (
  `url_hash` char(64) NOT NULL,
  `url` varchar(2048) NOT NULL,
  `status` enum('ok','failed') NOT NULL,
  `error_code` varchar(40) DEFAULT NULL,
  `final_url` varchar(2048) DEFAULT NULL,
  `title` varchar(300) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `image_url` varchar(2048) DEFAULT NULL,
  `site_name` varchar(200) DEFAULT NULL,
  `price_cents` int(10) UNSIGNED DEFAULT NULL,
  `price_currency` char(3) DEFAULT NULL,
  `fetched_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `link_previews`
--

INSERT INTO `link_previews` (`url_hash`, `url`, `status`, `error_code`, `final_url`, `title`, `description`, `image_url`, `site_name`, `price_cents`, `price_currency`, `fetched_at`) VALUES
('25316cc223461aafeba01e62d37adf1763a715f256f31404756ea59ca8d8e039', 'https://www.maederlhaus.at/', 'ok', NULL, 'https://www.maederlhaus.at/', 'Hotel Garni Drei Mäderl Haus Loipersdorf - Thermenurlaub in Bad Loipersdorf', 'Das Hotel Garni Drei Mäderl Haus in Loipersdorf ist der perfekte Ausgangspunkt für Ihren Wellness-Urlaub in der Thermenregion Loipersdorf. Genießen Sie bei uns entspannte Tage und lassen Sie sich von unserem vielfältigen Angebot verwöhnen. Loipersdorf wartet auf Sie!', 'https://www.maederlhaus.at/img/1000/800/90/data/images/2024/059W7787.jpg', 'maederlhaus.at', NULL, NULL, '2026-11-16 16:51:28');

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
(92, 14.869340, 48.125020, NULL, 'Austria', 'Amstetten', 'AT'),
(95, 18.846800, 68.339300, NULL, 'Schweden', 'Abisko', 'SE'),
(96, 18.341400, 68.061900, NULL, '', '', ''),
(97, 12.794600, 47.321000, NULL, 'Österreich', 'Zell am See', 'AT'),
(98, 16.321484, 48.153622, NULL, 'Österreich', 'Wien', 'AT'),
(99, 14.876300, 48.114700, NULL, 'Österreich', 'Amstetten', 'AT'),
(100, 11.685254, 48.182931, NULL, 'Deutschland', 'Unterföhring', 'DE'),
(101, 17.222363, 47.652803, NULL, 'Ungarn', 'Csorna', 'HU'),
(102, 14.431836, 47.415445, NULL, 'Österreich', 'Tumschel', 'AT');

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
  `title_pic_thumb` varchar(2048) DEFAULT NULL,
  `picture_count` int(11) DEFAULT 0,
  `user_id` varchar(255) NOT NULL,
  `activity_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `share_token` varchar(255) DEFAULT NULL,
  `create_request_id` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `memories`
--

INSERT INTO `memories` (`memory_id`, `title`, `text`, `memory_date`, `memory_end_date`, `title_pic`, `title_pic_thumb`, `picture_count`, `user_id`, `activity_id`, `location_id`, `share_token`, `create_request_id`) VALUES
(113, '123', '', NULL, NULL, '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, 'wyfRgsh04jgkutns-njmPqV1OIXpvdAMeepat9yqFQk', NULL),
(114, 'New, Updated Title', '', NULL, NULL, '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 101, NULL, NULL),
(115, 'Vienna to Grado Rikksha Trip', '', '2026-10-15T22:00:00.000Z', '2026-10-20T22:00:00.000Z', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fae9ed44f-c376-416e-ae35-1578787b7b03.jpg?alt=media&token=367df93f-9a85-40b9-8a06-f5f1a478867f', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2Fae9ed44f-c376-416e-ae35-1578787b7b03.jpg?alt=media&token=4a180c68-45fc-4852-9950-38657b265ac9', 7, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, 'fjA9mQgLxmKphSuDvPf7JLQdrmj3UH3FKtUCNmwO5Q4', NULL),
(116, 'Bedwars gaming', '', NULL, NULL, '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, 'l96QILUNRFwuVZ62DrbEIgQkaZJH39fFM5YjrtrFy6E', NULL),
(117, 'Programming Memorise', '', NULL, NULL, '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL, NULL),
(118, 'Programing Sunday!', '', NULL, NULL, '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL, NULL),
(119, 'Termenurlaub Loipersdorf', '', '2026-11-26', '2026-11-29', '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL, NULL),
(120, 'Mimal und Gugsi Fischen', '', '2026-11-15', '2026-11-15', '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 98, NULL, NULL),
(121, 'Bedwars gaming', '', '2026-12-03', '2026-12-04', '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL, NULL),
(122, '', '', NULL, NULL, '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL, NULL),
(123, 'Time with Jonas Krahofer', '', '2026-12-17', '2026-12-18', '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 102, NULL, '057ce867-a686-48f7-86a4-a00e6bafe28f'),
(124, '', '', NULL, NULL, '', NULL, 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 1, NULL, '6826e9cb-f495-4a61-a1e8-caa9e3958f1e'),
(125, 'Kungsleden Boys · July 2023', 'The hike that would go on to define an era!', '2023-07-14', '2023-07-20', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2F8120d329-a408-468a-83a5-9a6357c8ff3d.jpg?alt=media&token=02943570-90d9-465f-b16e-247472d77f85', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fthumbs%2F8120d329-a408-468a-83a5-9a6357c8ff3d.jpg?alt=media&token=b77ebd67-e20c-4743-aebf-40af52c27df1', 6, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 96, '3sTwiRN29fFCzXkvujVvnowtECH4kIML4SJ1atK4uDQ', '045a68b3-d6cd-4e61-b49d-c13c9fb54622'),
(126, 'Skiurlaub· February 2022', 'Skiiing in Zell am See', '2022-02-10', '2022-02-12', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2F4fe2a90a-399a-431d-ad9d-17889760e38e.jpg?alt=media&token=ffec787e-d119-4bea-aabb-37c38540fcae', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2F4fe2a90a-399a-431d-ad9d-17889760e38e.jpg?alt=media&token=946fa9ff-2e57-461c-8d1f-a6707767e76b', 9, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 97, NULL, 'ac05ed88-ba6e-417d-878c-fa2a400c280a'),
(127, 'Jugendraum fetzen · January 2022', '', '2022-01-01', '2022-01-14', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fd52f9eb8-4d62-4478-82ea-f6a3e73b1375.jpg?alt=media&token=d83d5a47-e3db-46ff-98dd-3112b9af338a', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fthumbs%2Fd52f9eb8-4d62-4478-82ea-f6a3e73b1375.jpg?alt=media&token=e8351605-dca9-4aa7-9be5-f634977b79ea', 4, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 1, 99, '92nzo8GfYPA454jKP3bLd9RAVXOvnYE2dMG8ffyYX1c', 'a598f564-f432-4d52-a73c-fa1edd1760b9');

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

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `memory_photos`
--

CREATE TABLE `memory_photos` (
  `photo_id` char(36) NOT NULL,
  `memory_id` int(11) NOT NULL,
  `client_id` char(36) NOT NULL,
  `upload_session_id` char(36) DEFAULT NULL,
  `uploaded_by` varchar(128) NOT NULL,
  `storage_path` varchar(512) NOT NULL,
  `download_url` varchar(2048) NOT NULL,
  `size_bytes` bigint(20) UNSIGNED NOT NULL,
  `thumb_path` varchar(512) NOT NULL,
  `thumb_url` varchar(2048) NOT NULL,
  `thumb_size_bytes` bigint(20) UNSIGNED NOT NULL,
  `width` int(10) UNSIGNED NOT NULL,
  `height` int(10) UNSIGNED NOT NULL,
  `mime_type` varchar(64) NOT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `taken_at` datetime DEFAULT NULL,
  `lat` decimal(9,6) DEFAULT NULL,
  `lng` decimal(9,6) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `memory_photos`
--

INSERT INTO `memory_photos` (`photo_id`, `memory_id`, `client_id`, `upload_session_id`, `uploaded_by`, `storage_path`, `download_url`, `size_bytes`, `thumb_path`, `thumb_url`, `thumb_size_bytes`, `width`, `height`, `mime_type`, `original_file_name`, `taken_at`, `lat`, `lng`, `created_at`) VALUES
('2513831c-2436-4149-8289-e542a26fe0a9', 127, '49f13c0b-8d9c-42d6-ae44-2e07901d6e06', '393c6f40-a4ff-49e9-a54f-1f7e17f4ddd7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/127/49f13c0b-8d9c-42d6-ae44-2e07901d6e06.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2F49f13c0b-8d9c-42d6-ae44-2e07901d6e06.jpg?alt=media&token=b349f416-4388-4c11-b024-a0e20d9bd876', 4325744, 'memories/127/thumbs/49f13c0b-8d9c-42d6-ae44-2e07901d6e06.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fthumbs%2F49f13c0b-8d9c-42d6-ae44-2e07901d6e06.jpg?alt=media&token=818693b1-adb9-4e56-b7d6-89ae3b54ee6f', 69421, 3468, 4624, 'image/jpeg', '20220101_031257.jpg', '2022-01-01 03:12:57', NULL, NULL, '2026-11-14 15:15:38'),
('27476a8f-4f3b-4a55-8d8e-899ad58939fa', 126, '940ef6dd-1969-4fb4-bf2d-fa1e8090ce1d', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/940ef6dd-1969-4fb4-bf2d-fa1e8090ce1d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2F940ef6dd-1969-4fb4-bf2d-fa1e8090ce1d.jpg?alt=media&token=7a5f6da3-3fd0-4ede-9d4f-fb4736c5593c', 10657455, 'memories/126/thumbs/940ef6dd-1969-4fb4-bf2d-fa1e8090ce1d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2F940ef6dd-1969-4fb4-bf2d-fa1e8090ce1d.jpg?alt=media&token=48677204-7809-431d-beff-0b455c3488aa', 98052, 3468, 4624, 'image/jpeg', '20220212_140025.jpg', '2022-02-12 14:00:25', NULL, NULL, '2026-10-25 15:29:14'),
('3160198a-9ffa-42e9-bf74-af712535f0d5', 115, '1a7cc9c2-e2ec-4515-95da-00ffdeebd081', 'cf808bc3-b87b-4e18-b95f-f2d4bcf69111', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/115/1a7cc9c2-e2ec-4515-95da-00ffdeebd081.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2F1a7cc9c2-e2ec-4515-95da-00ffdeebd081.jpg?alt=media&token=ad7b3e11-cfe7-4266-809e-97164f35610e', 2288540, 'memories/115/thumbs/1a7cc9c2-e2ec-4515-95da-00ffdeebd081.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2F1a7cc9c2-e2ec-4515-95da-00ffdeebd081.jpg?alt=media&token=fa5095c5-04a6-43a5-95f5-e113b0ba0045', 52385, 1800, 4000, 'image/jpeg', '20230717_152704.jpg', '2023-07-17 15:27:05', NULL, NULL, '2026-10-20 17:19:07'),
('3697c49a-8a13-44d9-a6e8-913964df5da5', 126, '8e9f0c44-4dcf-46fa-97b2-63617bc8532c', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/8e9f0c44-4dcf-46fa-97b2-63617bc8532c.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2F8e9f0c44-4dcf-46fa-97b2-63617bc8532c.jpg?alt=media&token=3c546d2e-7d14-4e5a-b962-dbcd0ff9f319', 8484773, 'memories/126/thumbs/8e9f0c44-4dcf-46fa-97b2-63617bc8532c.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2F8e9f0c44-4dcf-46fa-97b2-63617bc8532c.jpg?alt=media&token=962aded4-3445-4850-90c8-aee2f2d1730a', 73214, 3468, 4624, 'image/jpeg', '20220210_093056.jpg', '2022-02-10 09:30:54', NULL, NULL, '2026-10-25 15:29:14'),
('41beb3b2-5d22-4d07-afdc-cdaab0444277', 126, '4fe2a90a-399a-431d-ad9d-17889760e38e', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/4fe2a90a-399a-431d-ad9d-17889760e38e.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2F4fe2a90a-399a-431d-ad9d-17889760e38e.jpg?alt=media&token=ffec787e-d119-4bea-aabb-37c38540fcae', 9334449, 'memories/126/thumbs/4fe2a90a-399a-431d-ad9d-17889760e38e.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2F4fe2a90a-399a-431d-ad9d-17889760e38e.jpg?alt=media&token=946fa9ff-2e57-461c-8d1f-a6707767e76b', 88686, 3468, 4624, 'image/jpeg', '20220212_135710.jpg', '2022-02-12 13:57:09', NULL, NULL, '2026-10-25 15:29:14'),
('4e3ae3a3-ca77-4638-b537-0310bf9ca5bd', 125, '4d352a98-7c35-4bdd-8546-462d4d1fb42f', 'b8b26a53-a3d2-4584-bbd7-85e335e25387', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/125/4d352a98-7c35-4bdd-8546-462d4d1fb42f.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2F4d352a98-7c35-4bdd-8546-462d4d1fb42f.jpg?alt=media&token=7f38bd81-fa67-4851-9d98-aac92f8eb1cf', 2492313, 'memories/125/thumbs/4d352a98-7c35-4bdd-8546-462d4d1fb42f.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fthumbs%2F4d352a98-7c35-4bdd-8546-462d4d1fb42f.jpg?alt=media&token=40635aeb-3bfb-4812-9266-7c8c5c70e3a6', 54019, 1800, 4000, 'image/jpeg', '20230715_182409.jpg', '2023-07-15 18:24:10', NULL, NULL, '2026-10-21 18:27:28'),
('59abbc93-6739-4c85-9501-c4ef364a153e', 127, 'd52f9eb8-4d62-4478-82ea-f6a3e73b1375', '393c6f40-a4ff-49e9-a54f-1f7e17f4ddd7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/127/d52f9eb8-4d62-4478-82ea-f6a3e73b1375.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fd52f9eb8-4d62-4478-82ea-f6a3e73b1375.jpg?alt=media&token=d83d5a47-e3db-46ff-98dd-3112b9af338a', 4130691, 'memories/127/thumbs/d52f9eb8-4d62-4478-82ea-f6a3e73b1375.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fthumbs%2Fd52f9eb8-4d62-4478-82ea-f6a3e73b1375.jpg?alt=media&token=e8351605-dca9-4aa7-9be5-f634977b79ea', 62699, 3468, 4624, 'image/jpeg', '20220114_225640.jpg', '2022-01-14 22:56:40', NULL, NULL, '2026-11-14 15:15:38'),
('5caf99a1-840b-4bea-a957-95bda89e33ea', 115, 'ae9ed44f-c376-416e-ae35-1578787b7b03', '3f5b7f85-c26c-46b1-bfe5-891880d78e18', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/115/ae9ed44f-c376-416e-ae35-1578787b7b03.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fae9ed44f-c376-416e-ae35-1578787b7b03.jpg?alt=media&token=367df93f-9a85-40b9-8a06-f5f1a478867f', 1640689, 'memories/115/thumbs/ae9ed44f-c376-416e-ae35-1578787b7b03.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2Fae9ed44f-c376-416e-ae35-1578787b7b03.jpg?alt=media&token=4a180c68-45fc-4852-9950-38657b265ac9', 56956, 1472, 3264, 'image/jpeg', '20230717_170625.jpg', '2023-07-17 17:06:26', NULL, NULL, '2026-10-20 17:21:07'),
('69542c6b-fa4e-4456-bc8c-0c91b5ac6009', 115, '973adefd-91b1-49f1-a5a0-413971fd6de6', '0a1ec149-6591-4326-9a01-e73c5dcd45bf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/115/973adefd-91b1-49f1-a5a0-413971fd6de6.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2F973adefd-91b1-49f1-a5a0-413971fd6de6.jpg?alt=media&token=c1c71d32-f53b-4e03-abeb-2c82f4d9e5f2', 2354300, 'memories/115/thumbs/973adefd-91b1-49f1-a5a0-413971fd6de6.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2F973adefd-91b1-49f1-a5a0-413971fd6de6.jpg?alt=media&token=21b5c6a2-d620-448b-8302-5f11346c5a09', 52350, 1800, 4000, 'image/jpeg', '20230716_131405.jpg', '2023-07-16 13:14:06', NULL, NULL, '2026-10-20 17:25:09'),
('70c4ab4c-6d41-4a0a-b58d-5d3f3b432e1c', 127, '60bd0449-469b-4adc-bb30-f759ab15f4c0', '393c6f40-a4ff-49e9-a54f-1f7e17f4ddd7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/127/60bd0449-469b-4adc-bb30-f759ab15f4c0.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2F60bd0449-469b-4adc-bb30-f759ab15f4c0.jpg?alt=media&token=ebf7cef7-2919-4319-9a13-efbb41249ea5', 3989187, 'memories/127/thumbs/60bd0449-469b-4adc-bb30-f759ab15f4c0.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fthumbs%2F60bd0449-469b-4adc-bb30-f759ab15f4c0.jpg?alt=media&token=0821b554-ed76-4d36-8679-e0a96c560204', 54126, 3468, 4624, 'image/jpeg', '20220114_225643.jpg', '2022-01-14 22:56:43', NULL, NULL, '2026-11-14 15:15:44'),
('71ee40e4-ec67-47e6-89a5-7cae2d2f4050', 115, '69b0e82e-82cf-4f04-b2e5-889291ca8b8d', '0335dc93-bd2e-4709-8efc-f61a10c16e67', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/115/69b0e82e-82cf-4f04-b2e5-889291ca8b8d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2F69b0e82e-82cf-4f04-b2e5-889291ca8b8d.jpg?alt=media&token=9bddf22c-fd3d-4447-acc7-73369453f205', 3290187, 'memories/115/thumbs/69b0e82e-82cf-4f04-b2e5-889291ca8b8d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2F69b0e82e-82cf-4f04-b2e5-889291ca8b8d.jpg?alt=media&token=540c262a-18d5-46c5-8d0d-6661ad13c49c', 84777, 1080, 2400, 'image/jpeg', '20230716_105659_Moment.jpg', '2023-07-16 10:57:03', NULL, NULL, '2026-10-20 17:16:14'),
('760dd025-854e-44cd-a57e-372937fb64f9', 126, '6cf4f104-3008-4e12-a942-02c6e5f44990', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/6cf4f104-3008-4e12-a942-02c6e5f44990.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2F6cf4f104-3008-4e12-a942-02c6e5f44990.jpg?alt=media&token=d8f8b395-3d7a-48a0-92fa-ade647ffa90d', 10325465, 'memories/126/thumbs/6cf4f104-3008-4e12-a942-02c6e5f44990.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2F6cf4f104-3008-4e12-a942-02c6e5f44990.jpg?alt=media&token=f3b2a720-c788-4cec-8bb8-b5c6ef9f4b81', 90958, 3468, 4624, 'image/jpeg', '20220212_135712.jpg', '2022-02-12 13:57:12', NULL, NULL, '2026-10-25 15:29:14'),
('76888e5d-c49b-4536-b3d4-97f6e10461f2', 115, '00b633d4-95c1-4fcb-a6df-8db87360bd20', '0a1ec149-6591-4326-9a01-e73c5dcd45bf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/115/00b633d4-95c1-4fcb-a6df-8db87360bd20.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2F00b633d4-95c1-4fcb-a6df-8db87360bd20.jpg?alt=media&token=4f786c29-5541-45f7-8f8b-1ee0fe8f16b0', 2452844, 'memories/115/thumbs/00b633d4-95c1-4fcb-a6df-8db87360bd20.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2F00b633d4-95c1-4fcb-a6df-8db87360bd20.jpg?alt=media&token=e3331425-c671-492f-9d05-1133b07f0f12', 56375, 1800, 4000, 'image/jpeg', '20230716_115719.jpg', '2023-07-16 11:57:19', NULL, NULL, '2026-10-20 17:25:13'),
('88e42806-36bd-4e90-b33f-d20dee8f52d2', 115, '04ed5e4f-cbae-4102-9bd3-3f6800214a81', 'cf808bc3-b87b-4e18-b95f-f2d4bcf69111', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/115/04ed5e4f-cbae-4102-9bd3-3f6800214a81.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2F04ed5e4f-cbae-4102-9bd3-3f6800214a81.jpg?alt=media&token=f4edfb4a-bb2f-4a76-894a-9d3cd1974d89', 2205002, 'memories/115/thumbs/04ed5e4f-cbae-4102-9bd3-3f6800214a81.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2F04ed5e4f-cbae-4102-9bd3-3f6800214a81.jpg?alt=media&token=a8206cbe-9ff6-443c-b5b5-36de005bc4a0', 49979, 1800, 4000, 'image/jpeg', '20230719_135708.jpg', '2023-07-19 13:57:08', NULL, NULL, '2026-10-20 17:19:09'),
('8f6be6e6-91b5-46db-8044-5dee80d5a683', 125, 'c8428d5a-aa62-4de2-b3ba-d8b50911bc1d', 'b8b26a53-a3d2-4584-bbd7-85e335e25387', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/125/c8428d5a-aa62-4de2-b3ba-d8b50911bc1d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fc8428d5a-aa62-4de2-b3ba-d8b50911bc1d.jpg?alt=media&token=83557a05-fe4b-4978-8775-718db7de6572', 2626144, 'memories/125/thumbs/c8428d5a-aa62-4de2-b3ba-d8b50911bc1d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fthumbs%2Fc8428d5a-aa62-4de2-b3ba-d8b50911bc1d.jpg?alt=media&token=b59330e5-a305-4ef3-8f4e-355fe3b71c14', 70148, 1800, 4000, 'image/jpeg', '20230720_143353.jpg', '2023-07-20 14:33:54', NULL, NULL, '2026-10-21 18:27:47'),
('9510f4ec-095a-4bfb-b290-af57ac656dc5', 126, '0a904140-e586-40d4-8257-d07610a91a4d', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/0a904140-e586-40d4-8257-d07610a91a4d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2F0a904140-e586-40d4-8257-d07610a91a4d.jpg?alt=media&token=2d75ea0b-29f2-43a3-bc8a-2ea0b3f71445', 9834045, 'memories/126/thumbs/0a904140-e586-40d4-8257-d07610a91a4d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2F0a904140-e586-40d4-8257-d07610a91a4d.jpg?alt=media&token=8cefc570-d2df-4e33-a7ed-3b76487d2ee8', 93774, 3468, 4624, 'image/jpeg', '20220212_135748.jpg', '2022-02-12 13:57:47', NULL, NULL, '2026-10-25 15:29:14'),
('a2d163af-72f3-4d27-baba-76bf5ed96164', 125, 'f2a360ba-de2d-4b61-b009-ded177007551', 'b8b26a53-a3d2-4584-bbd7-85e335e25387', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/125/f2a360ba-de2d-4b61-b009-ded177007551.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Ff2a360ba-de2d-4b61-b009-ded177007551.jpg?alt=media&token=efb000f3-1022-4255-8b23-6b80cf610511', 2959404, 'memories/125/thumbs/f2a360ba-de2d-4b61-b009-ded177007551.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fthumbs%2Ff2a360ba-de2d-4b61-b009-ded177007551.jpg?alt=media&token=e008aabf-0cc7-4c59-95b1-871625bfc586', 66048, 1800, 4000, 'image/jpeg', '20230714_140355.jpg', '2023-07-14 14:03:56', NULL, NULL, '2026-10-21 18:27:28'),
('a389e657-6ed7-40ca-97c2-23627c6d2677', 115, '0a1e9669-e247-4c82-b25d-36248826796e', '3f5b7f85-c26c-46b1-bfe5-891880d78e18', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/115/0a1e9669-e247-4c82-b25d-36248826796e.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2F0a1e9669-e247-4c82-b25d-36248826796e.jpg?alt=media&token=d0d51923-b1da-44b3-ba6a-a7fdef38f4dc', 1192662, 'memories/115/thumbs/0a1e9669-e247-4c82-b25d-36248826796e.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F115%2Fthumbs%2F0a1e9669-e247-4c82-b25d-36248826796e.jpg?alt=media&token=5572d032-86ed-4a72-910e-ddf903dd0f33', 41374, 3264, 1472, 'image/jpeg', '20230718_195324.jpg', '2023-07-18 19:53:25', NULL, NULL, '2026-10-20 17:21:10'),
('aa326606-71dc-40c4-8c29-e9e7dbc352ea', 126, 'c16abefa-fb87-4852-a915-e8f08bd28423', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/c16abefa-fb87-4852-a915-e8f08bd28423.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fc16abefa-fb87-4852-a915-e8f08bd28423.jpg?alt=media&token=4890dcb6-29ab-423b-9f1b-dda360ce4789', 8157661, 'memories/126/thumbs/c16abefa-fb87-4852-a915-e8f08bd28423.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2Fc16abefa-fb87-4852-a915-e8f08bd28423.jpg?alt=media&token=39e5e83b-f2ce-4949-a9bf-7378ac2669b1', 84781, 3468, 4624, 'image/jpeg', '20220212_135904.jpg', '2022-02-12 13:59:04', NULL, NULL, '2026-10-25 15:29:14'),
('aaa66f13-5a3f-42c0-838f-feeee2726620', 125, '8120d329-a408-468a-83a5-9a6357c8ff3d', 'b8b26a53-a3d2-4584-bbd7-85e335e25387', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/125/8120d329-a408-468a-83a5-9a6357c8ff3d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2F8120d329-a408-468a-83a5-9a6357c8ff3d.jpg?alt=media&token=02943570-90d9-465f-b16e-247472d77f85', 2888362, 'memories/125/thumbs/8120d329-a408-468a-83a5-9a6357c8ff3d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fthumbs%2F8120d329-a408-468a-83a5-9a6357c8ff3d.jpg?alt=media&token=b77ebd67-e20c-4743-aebf-40af52c27df1', 68741, 4000, 1800, 'image/jpeg', '20230715_160643.jpg', '2023-07-15 16:06:43', NULL, NULL, '2026-10-21 18:27:28'),
('b1ecd2e6-d9be-4a89-98f5-55a3dc553c8c', 126, 'ea8f1b6b-9fad-4d0d-8f46-6c140907c48a', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/ea8f1b6b-9fad-4d0d-8f46-6c140907c48a.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fea8f1b6b-9fad-4d0d-8f46-6c140907c48a.jpg?alt=media&token=a1f752be-378d-474e-954e-7d084c7622e5', 10920827, 'memories/126/thumbs/ea8f1b6b-9fad-4d0d-8f46-6c140907c48a.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2Fea8f1b6b-9fad-4d0d-8f46-6c140907c48a.jpg?alt=media&token=2a08c603-5174-4f2a-bc8e-723a296c21d9', 97938, 3468, 4624, 'image/jpeg', '20220212_140018.jpg', '2022-02-12 14:00:18', NULL, NULL, '2026-10-25 15:29:14'),
('bea672ed-6453-43ee-bd39-b2613afe7e15', 125, '4078f9ae-c70c-4676-a0f3-fee52fc2580a', 'b8b26a53-a3d2-4584-bbd7-85e335e25387', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/125/4078f9ae-c70c-4676-a0f3-fee52fc2580a.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2F4078f9ae-c70c-4676-a0f3-fee52fc2580a.jpg?alt=media&token=3d58fae4-4a2b-43ce-9aff-3f3e2b670e4b', 1341013, 'memories/125/thumbs/4078f9ae-c70c-4676-a0f3-fee52fc2580a.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fthumbs%2F4078f9ae-c70c-4676-a0f3-fee52fc2580a.jpg?alt=media&token=c826117f-0fc8-40d7-a086-8f9689ab775d', 49705, 1472, 3264, 'image/jpeg', '20230715_204439.jpg', '2023-07-15 20:44:39', NULL, NULL, '2026-10-21 18:27:33'),
('c1194b57-4251-442f-91e8-b83f6bb668a0', 127, 'c4ea7d8b-7e5c-4051-b5ad-ebc286aeac56', '393c6f40-a4ff-49e9-a54f-1f7e17f4ddd7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/127/c4ea7d8b-7e5c-4051-b5ad-ebc286aeac56.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fc4ea7d8b-7e5c-4051-b5ad-ebc286aeac56.jpg?alt=media&token=4218faf7-e63f-4a6b-a7bf-017ba1ff0027', 4523001, 'memories/127/thumbs/c4ea7d8b-7e5c-4051-b5ad-ebc286aeac56.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F127%2Fthumbs%2Fc4ea7d8b-7e5c-4051-b5ad-ebc286aeac56.jpg?alt=media&token=12aa1f0d-c430-4229-a451-f7cafefbaa17', 78494, 3468, 4624, 'image/jpeg', '20220101_031253.jpg', '2022-01-01 03:12:53', NULL, NULL, '2026-11-14 15:15:38'),
('dabab8fe-18eb-4bf2-907b-e326b89043a7', 126, '50d3a241-962e-4a1c-9a74-456fc80c56ff', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/50d3a241-962e-4a1c-9a74-456fc80c56ff.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2F50d3a241-962e-4a1c-9a74-456fc80c56ff.jpg?alt=media&token=9b944141-2f41-4a34-831a-8195efe6aa52', 10580937, 'memories/126/thumbs/50d3a241-962e-4a1c-9a74-456fc80c56ff.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2F50d3a241-962e-4a1c-9a74-456fc80c56ff.jpg?alt=media&token=c9bc2df3-65a3-4526-a96a-d62825829eff', 94978, 3468, 4624, 'image/jpeg', '20220212_140023.jpg', '2022-02-12 14:00:22', NULL, NULL, '2026-10-25 15:29:15'),
('dc7fca7b-e58a-4246-a2ad-4a0c6e8ba137', 126, 'ffc25189-931e-4224-bc98-02da71b0a49d', 'e6a0eea5-dfa8-477d-901c-1d1982caefcf', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/126/ffc25189-931e-4224-bc98-02da71b0a49d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fffc25189-931e-4224-bc98-02da71b0a49d.jpg?alt=media&token=09e370a4-3715-4c82-8f67-8cb0de40e9a4', 5329419, 'memories/126/thumbs/ffc25189-931e-4224-bc98-02da71b0a49d.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F126%2Fthumbs%2Fffc25189-931e-4224-bc98-02da71b0a49d.jpg?alt=media&token=d11d57fd-b562-4f36-b0aa-d3fb783b94ee', 70004, 2448, 3264, 'image/jpeg', '20220210_093111.jpg', '2022-02-10 09:31:09', NULL, NULL, '2026-10-25 15:29:14'),
('ef197e1f-1e63-41d9-9393-482e0a26146f', 125, '51c102ff-01ab-4039-845b-aec1e90c4fd2', 'b8b26a53-a3d2-4584-bbd7-85e335e25387', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'memories/125/51c102ff-01ab-4039-845b-aec1e90c4fd2.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2F51c102ff-01ab-4039-845b-aec1e90c4fd2.jpg?alt=media&token=ea76462d-4fce-4ae4-8cb4-ac6100f6daf7', 2472516, 'memories/125/thumbs/51c102ff-01ab-4039-845b-aec1e90c4fd2.jpg', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/memories%2F125%2Fthumbs%2F51c102ff-01ab-4039-845b-aec1e90c4fd2.jpg?alt=media&token=69d8daef-52fa-4a8a-b993-173d8687306f', 47641, 1800, 4000, 'image/jpeg', '20230720_112240.jpg', '2023-07-20 11:22:40', NULL, NULL, '2026-10-21 18:27:35');

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
-- Tabellenstruktur für Tabelle `placeholders`
--

CREATE TABLE `placeholders` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `created_by` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `invite_token` varchar(64) NOT NULL,
  `claimed_by_user_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `placeholders`
--

INSERT INTO `placeholders` (`id`, `created_by`, `name`, `invite_token`, `claimed_by_user_id`, `created_at`) VALUES
('4a70e7bc-c244-4fc4-a124-976ff02dbeae', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Seb', '25b8f86d5ae18ffd41111783959d02f26b8a4d64a4794e9fadb21bb62e12632f', NULL, '2026-11-14 14:15:23'),
('5103eb70-218a-42be-af9a-7a91fc8ae583', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Max', '667973853d30f52db6f6d12f44d62bb0c7a48148d5ed98907c4ee23a44a25e5a', NULL, '2026-10-07 16:37:52'),
('5cbf199d-8a15-4cdf-abf7-aa47ff8a7ab3', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Kili', 'c77286405d193f5ac410798b1681083b3ee782398a38c38e839fc33f91c6b133', NULL, '2026-11-14 14:15:23'),
('635130bf-7c2a-40c9-9c26-380a6eece41f', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Fitschi', '57820ca12858d8340102d59170f3598ce5b268d63a340af4c58755e6b22a6ff9', NULL, '2026-10-25 08:24:01'),
('66e24cf3-3c14-4bf8-be37-779474d14cfd', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'maxi', 'f60908c1b7be9bc3069923726c6aebdbe0ebdea0ed7d0982460d6ae5d30281de', NULL, '2026-10-22 13:39:33'),
('77598b6a-fa33-42d5-930b-cbf8c799597f', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Maxi', '082c8d35db60f6c426a84ffe6aa7cd535749288c4ebfff09a3376df82b8ee4a3', NULL, '2026-10-25 08:24:01'),
('96f8925a-1aac-4874-b1f9-060ebf79a794', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Kili', 'b52cb534252ef2e66c5f86ae40e2f7e751285d70ed7adbfadaa0f3d55576a36b', NULL, '2026-10-25 08:24:01'),
('dc375b4e-5b12-469d-aee4-578809f4bc9b', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Joe', '108d28ca229c31115096144c6d846d14814b0615e2f4d920eedb5fb333744465', NULL, '2026-11-14 14:15:23'),
('f0cf23f4-163d-496b-b1f8-3bab2234fad6', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'Lele', 'ccfe77538369052b718c2bae0a86b8cd7d4cfaf0b57507b01b4798222da4526f', NULL, '2026-10-25 08:24:01');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `placeholder_has_memory`
--

CREATE TABLE `placeholder_has_memory` (
  `placeholder_id` char(36) NOT NULL,
  `memory_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `placeholder_has_memory`
--

INSERT INTO `placeholder_has_memory` (`placeholder_id`, `memory_id`) VALUES
('4a70e7bc-c244-4fc4-a124-976ff02dbeae', 127),
('5103eb70-218a-42be-af9a-7a91fc8ae583', 116),
('5cbf199d-8a15-4cdf-abf7-aa47ff8a7ab3', 127),
('635130bf-7c2a-40c9-9c26-380a6eece41f', 126),
('66e24cf3-3c14-4bf8-be37-779474d14cfd', 125),
('77598b6a-fa33-42d5-930b-cbf8c799597f', 126),
('96f8925a-1aac-4874-b1f9-060ebf79a794', 126),
('dc375b4e-5b12-469d-aee4-578809f4bc9b', 127),
('f0cf23f4-163d-496b-b1f8-3bab2234fad6', 126);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_availability`
--

CREATE TABLE `plan_availability` (
  `memory_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `day` date NOT NULL,
  `state` enum('yes','maybe') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `plan_availability`
--

INSERT INTO `plan_availability` (`memory_id`, `user_id`, `day`, `state`) VALUES
(119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-21', 'yes'),
(119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-22', 'yes'),
(119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-26', 'yes'),
(119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-27', 'yes'),
(119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-28', 'yes'),
(119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-29', 'yes'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-13', 'maybe'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-14', 'maybe'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-15', 'yes'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-21', 'maybe'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-22', 'yes'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-27', 'maybe'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-28', 'maybe'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-29', 'maybe'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-06', 'yes'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-10', 'maybe'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-11', 'maybe'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-12', 'yes'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-13', 'yes'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-17', 'yes'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-18', 'yes'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-20', 'yes'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-27', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-01', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-02', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-03', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-04', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-05', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-11', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-12', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-17', 'yes'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-12-18', 'yes');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_availability_responses`
--

CREATE TABLE `plan_availability_responses` (
  `memory_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `plan_availability_responses`
--

INSERT INTO `plan_availability_responses` (`memory_id`, `user_id`, `updated_at`) VALUES
(119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-16 17:45:20'),
(120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 11:03:21'),
(121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-14 15:19:58'),
(123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-19 16:35:17');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_bookings`
--

CREATE TABLE `plan_bookings` (
  `item_id` int(10) UNSIGNED NOT NULL,
  `kind` enum('stay','transport','activity') NOT NULL,
  `status` enum('option','booked','cancelled') NOT NULL DEFAULT 'option',
  `provider` varchar(200) DEFAULT NULL,
  `confirmation_code` varchar(100) DEFAULT NULL,
  `starts_at` datetime DEFAULT NULL,
  `start_tz` varchar(64) DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `end_tz` varchar(64) DEFAULT NULL,
  `starts_at_utc` datetime DEFAULT NULL,
  `ends_at_utc` datetime DEFAULT NULL,
  `transport_mode` enum('flight','train','bus','car','ferry','other') DEFAULT NULL,
  `origin` varchar(200) DEFAULT NULL,
  `destination_label` varchar(200) DEFAULT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `transport_number` varchar(40) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `country_code` char(2) DEFAULT NULL,
  `price_cents` int(10) UNSIGNED DEFAULT NULL,
  `currency` char(3) NOT NULL DEFAULT 'EUR',
  `paid_by` varchar(128) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `source_poll_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_bookings`
--

INSERT INTO `plan_bookings` (`item_id`, `kind`, `status`, `provider`, `confirmation_code`, `starts_at`, `start_tz`, `ends_at`, `end_tz`, `starts_at_utc`, `ends_at_utc`, `transport_mode`, `origin`, `destination_label`, `carrier`, `transport_number`, `address`, `latitude`, `longitude`, `city`, `country`, `country_code`, `price_cents`, `currency`, `paid_by`, `notes`, `source_poll_id`) VALUES
(15, 'stay', 'booked', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'EUR', NULL, NULL, NULL),
(17, 'stay', 'booked', 'Email', '123456', '2026-11-26 17:00:00', 'Europe/Berlin', NULL, 'Europe/Berlin', '2026-11-26 16:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 'eggersdorferstraße 32', NULL, NULL, NULL, NULL, NULL, 30000, 'EUR', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_date_finder`
--

CREATE TABLE `plan_date_finder` (
  `memory_id` int(11) NOT NULL,
  `range_start` date NOT NULL,
  `range_end` date NOT NULL,
  `min_days` tinyint(3) UNSIGNED NOT NULL DEFAULT 2,
  `max_days` tinyint(3) UNSIGNED NOT NULL DEFAULT 7,
  `updated_by` varchar(128) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_date_finder`
--

INSERT INTO `plan_date_finder` (`memory_id`, `range_start`, `range_end`, `min_days`, `max_days`, `updated_by`, `updated_at`) VALUES
(120, '2026-11-07', '2027-02-04', 1, 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 11:03:05');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_destination`
--

CREATE TABLE `plan_destination` (
  `memory_id` int(11) NOT NULL,
  `label` varchar(200) NOT NULL,
  `source_poll_id` int(10) UNSIGNED DEFAULT NULL,
  `set_by` varchar(128) NOT NULL,
  `set_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_events`
--

CREATE TABLE `plan_events` (
  `event_id` int(10) UNSIGNED NOT NULL,
  `memory_id` int(11) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `target_user_id` varchar(128) DEFAULT NULL,
  `action` varchar(40) NOT NULL,
  `item_id` int(10) UNSIGNED DEFAULT NULL,
  `item_title` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_events`
--

INSERT INTO `plan_events` (`event_id`, `memory_id`, `user_id`, `target_user_id`, `action`, `item_id`, `item_title`, `created_at`) VALUES
(1, 113, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 1, 'Test Note', '2026-10-31 11:18:12'),
(2, 113, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_updated', 1, 'Test Note!', '2026-10-31 11:18:22'),
(3, 113, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 2, 'Big Brain', '2026-10-31 11:18:35'),
(7, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'date_finder_updated', NULL, '2026-11-07/2027-02-04', '2026-11-07 11:03:05'),
(8, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'date_finder_updated', NULL, '2026-11-07/2027-02-04', '2026-11-07 11:03:10'),
(10, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'availability_updated', NULL, NULL, '2026-11-07 11:03:21'),
(11, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 3, 'Where should we go?', '2026-11-07 11:04:53'),
(16, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 3, 'Where should we go?', '2026-11-07 11:05:10'),
(17, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 3, 'Where should we go?', '2026-11-07 11:05:36'),
(18, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 4, 'What is your fav food?', '2026-11-07 11:13:53'),
(19, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 4, 'Lasagne', '2026-11-07 11:14:06'),
(20, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 4, 'What is your fav food?', '2026-11-07 11:14:16'),
(21, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 5, 'Fav food?', '2026-11-07 11:14:37'),
(24, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 5, 'Fav food?', '2026-11-07 11:27:45'),
(25, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_option_added', 5, 'Fav food?', '2026-11-07 11:28:05'),
(26, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_option_added', 5, 'Fav food?', '2026-11-07 11:28:27'),
(27, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 5, 'Pizza', '2026-11-07 11:39:30'),
(28, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 6, 'Go for Dinner at the sea', '2026-11-07 11:40:19'),
(29, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 7, 'What do you prefer?', '2026-11-07 11:40:47'),
(33, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 7, 'What do you prefer?', '2026-11-07 11:40:55'),
(34, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 8, 'Where to go?', '2026-11-07 11:59:46'),
(35, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 8, 'Where to go?', '2026-11-07 11:59:49'),
(36, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 8, 'Wien', '2026-11-07 11:59:57'),
(37, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'destination_set', 8, 'Wien', '2026-11-07 11:59:57'),
(38, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'dates_set', NULL, '2026-11-15/2026-11-15', '2026-11-07 12:00:25'),
(39, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'milestone_skipped', NULL, 'stay', '2026-11-07 12:00:32'),
(40, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 9, 'How do we get there?', '2026-11-07 12:00:51'),
(41, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 10, 'Mama fragen wegen auto', '2026-11-07 12:01:37'),
(42, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'item_assigned', 10, 'Mama fragen wegen auto', '2026-11-07 12:01:37'),
(43, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 11, 'tse3t', '2026-11-07 12:02:58'),
(44, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 11, 'tse3t', '2026-11-07 12:03:03'),
(45, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 12:03:35'),
(46, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 12:03:37'),
(47, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 12:04:50'),
(48, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 7, 'Go for Dinner at the sea', '2026-11-07 13:34:06'),
(49, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_reopened', 5, 'Fav food?', '2026-11-07 13:44:14'),
(50, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 12, 'test', '2026-11-07 13:47:11'),
(51, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 13, 'test', '2026-11-07 13:47:18'),
(52, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_created', 14, 'test', '2026-11-07 13:47:26'),
(53, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 13:47:51'),
(54, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 13:47:52'),
(55, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_created', 15, 'resr', '2026-11-07 13:49:59'),
(56, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_cancelled', 15, 'resr', '2026-11-07 13:50:05'),
(57, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_booked', 15, 'resr', '2026-11-07 13:50:16'),
(58, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:04:59'),
(59, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:13:03'),
(60, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:13:03'),
(61, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:20:03'),
(62, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:20:04'),
(63, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:20:05'),
(64, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:20:05'),
(65, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:21:31'),
(66, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:21:32'),
(67, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:01'),
(68, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:01'),
(69, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:02'),
(70, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:02'),
(71, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:53'),
(72, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:54'),
(73, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:55'),
(74, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:56'),
(75, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:22:59'),
(76, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:23:00'),
(77, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:23:01'),
(78, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:23:01'),
(79, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:24:10'),
(80, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:24:11'),
(81, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:24:42'),
(82, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:24:43'),
(83, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:05'),
(84, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:06'),
(85, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:09'),
(86, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:09'),
(87, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:13'),
(88, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:13'),
(89, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:18'),
(90, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:20'),
(91, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:44'),
(92, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:45'),
(93, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:46'),
(94, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:46'),
(95, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:51'),
(96, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_reopened', 10, 'Mama fragen wegen auto', '2026-11-07 14:26:53'),
(102, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_unvoted', 5, 'Fav food?', '2026-11-09 16:41:30'),
(103, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 10, 'Mama fragen wegen auto', '2026-11-09 17:17:10'),
(104, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_updated', 14, 'test', '2026-11-09 17:17:20'),
(105, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_updated', 14, 'test', '2026-11-09 17:17:27'),
(106, 120, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_completed', 14, 'test', '2026-11-09 17:17:30'),
(110, 121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'dates_set', NULL, '2026-12-03/2026-12-04', '2026-11-14 15:19:10'),
(111, 121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 16, 'Where should we go?', '2026-11-14 15:19:31'),
(112, 121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 16, 'Where should we go?', '2026-11-14 15:19:36'),
(114, 121, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'availability_updated', NULL, NULL, '2026-11-14 15:19:58'),
(117, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'availability_updated', NULL, NULL, '2026-11-16 17:45:20'),
(118, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'dates_set', NULL, '2026-11-26/2026-11-29', '2026-11-16 17:45:22'),
(119, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_created', 17, '3 Mäderl Haus', '2026-11-16 17:50:30'),
(120, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_booked', 17, '3 Mäderl Haus', '2026-11-16 17:50:30'),
(121, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_updated', 17, '3 Mäderl Haus', '2026-11-16 17:51:11'),
(122, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_updated', 17, '3 Mäderl Haus', '2026-11-16 17:51:28'),
(123, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 18, 'How do we get there?', '2026-11-16 18:06:07'),
(124, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 18, 'How do we get there?', '2026-11-16 18:06:10'),
(125, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 18, 'Train', '2026-11-16 18:06:17'),
(126, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_created', 19, 'Car to Loipmansdorf', '2026-11-16 18:06:58'),
(127, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 18, 'How do we get there?', '2026-11-16 18:07:03'),
(128, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 19, 'Car to Loipmansdorf', '2026-11-16 18:07:19'),
(129, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 20, 'How do we get there?', '2026-11-16 18:07:28'),
(130, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 20, 'How do we get there?', '2026-11-16 18:07:30'),
(131, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 20, 'Car', '2026-11-16 18:07:32'),
(132, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'booking_created', 21, 'Car', '2026-11-16 18:07:39'),
(133, 119, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 21, 'Car', '2026-11-16 18:07:43'),
(134, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 22, 'Where should we go?', '2026-11-16 18:30:45'),
(135, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 22, 'schweiz', '2026-11-16 18:30:47'),
(136, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'destination_set', 22, 'Unterföhring', '2026-11-16 18:30:47'),
(137, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_reopened', 22, 'Where should we go?', '2026-11-16 18:30:53'),
(138, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 22, 'Where should we go?', '2026-11-16 18:30:54'),
(139, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 22, 'Deutschland', '2026-11-16 18:33:05'),
(140, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'destination_set', 22, 'Csorna', '2026-11-16 18:33:05'),
(141, 114, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 22, 'Where should we go?', '2026-11-16 18:34:53'),
(142, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 23, 'Where should we go?', '2026-11-19 16:29:32'),
(143, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 23, 'Where should we go?', '2026-11-19 16:29:34'),
(144, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 23, 'zweite', '2026-11-19 16:29:50'),
(145, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 23, 'Where should we go?', '2026-11-19 16:30:54'),
(146, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 24, 'Where should we go?', '2026-11-19 16:32:59'),
(148, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 24, 'Österreich', '2026-11-19 16:33:04'),
(149, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'destination_set', 24, 'Tumschel', '2026-11-19 16:33:04'),
(150, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_reopened', 24, 'Where should we go?', '2026-11-19 16:33:23'),
(151, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_voted', 24, 'Where should we go?', '2026-11-19 16:33:25'),
(152, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 24, 'Deutschland', '2026-11-19 16:33:29'),
(153, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'item_deleted', 24, 'Where should we go?', '2026-11-19 16:34:01'),
(157, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'dates_set', NULL, '2026-12-01/2026-12-05', '2026-11-19 16:35:14'),
(158, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'availability_updated', NULL, NULL, '2026-11-19 16:35:17'),
(159, 123, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'dates_set', NULL, '2026-12-17/2026-12-18', '2026-11-19 16:35:18'),
(160, 113, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_created', 25, 'Where should we go?', '2026-11-19 16:36:12'),
(161, 113, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, 'poll_decided', 25, '1', '2026-11-19 16:36:14');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_items`
--

CREATE TABLE `plan_items` (
  `item_id` int(10) UNSIGNED NOT NULL,
  `memory_id` int(11) NOT NULL,
  `type` enum('note','idea','todo','link','poll','booking') NOT NULL,
  `category` enum('dates','destination','stay','transport','activity','other') NOT NULL DEFAULT 'other',
  `status` enum('open','decided','done','dismissed') NOT NULL DEFAULT 'open',
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `due_date` date DEFAULT NULL,
  `board_x` int(11) NOT NULL DEFAULT 40,
  `board_y` int(11) NOT NULL DEFAULT 40,
  `color` varchar(16) DEFAULT NULL,
  `created_by` varchar(128) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_items`
--

INSERT INTO `plan_items` (`item_id`, `memory_id`, `type`, `category`, `status`, `title`, `description`, `payload`, `due_date`, `board_x`, `board_y`, `color`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 113, 'note', 'transport', 'open', 'Test Note!', '123', NULL, NULL, 294, 191, '#fff59d', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-10-31 11:18:12', '2026-10-31 11:18:26'),
(2, 113, 'idea', 'other', 'open', 'Big Brain', 'yeay', NULL, NULL, 689, 119, '#ffe0b2', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-10-31 11:18:35', '2026-11-09 17:17:45'),
(5, 120, 'poll', 'other', 'open', 'Fav food?', 'some details', NULL, NULL, 327, 121, '#e1bee7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 11:14:37', '2026-11-07 13:44:14'),
(6, 120, 'idea', 'other', 'dismissed', 'Go for Dinner at the sea', 'lets have dinner on the promenade', NULL, NULL, 836, 268, '#ffe0b2', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 11:40:19', '2026-11-07 11:40:47'),
(7, 120, 'poll', 'other', 'decided', 'What do you prefer?', 'lets have dinner on the promenade', NULL, NULL, 718, 331, '#e1bee7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 11:40:47', '2026-11-07 13:34:36'),
(8, 120, 'poll', 'destination', 'decided', 'Where to go?', NULL, NULL, NULL, 971, 43, '#e1bee7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 11:59:46', '2026-11-07 12:00:00'),
(9, 120, 'poll', 'transport', 'open', 'How do we get there?', NULL, NULL, NULL, 1664, 197, '#e1bee7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 12:00:51', '2026-11-07 12:05:12'),
(10, 120, 'todo', 'transport', 'done', 'Mama fragen wegen auto', NULL, NULL, '2026-11-14', 19, 89, '#c8e6c9', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 12:01:37', '2026-11-09 17:17:10'),
(12, 120, 'note', 'other', 'open', 'test', NULL, NULL, NULL, 9, 308, '#fff59d', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 13:47:11', '2026-11-07 13:47:12'),
(13, 120, 'idea', 'other', 'open', 'test', NULL, NULL, NULL, 7, 394, '#ffe0b2', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 13:47:18', '2026-11-07 13:47:20'),
(14, 120, 'todo', 'other', 'done', 'test', NULL, NULL, NULL, 7, 481, '#c8e6c9', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 13:47:26', '2026-11-09 17:17:30'),
(15, 120, 'booking', 'stay', 'open', 'resr', NULL, NULL, NULL, 649, 98, '#b2dfdb', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 13:49:59', '2026-11-07 13:50:17'),
(16, 121, 'poll', 'destination', 'open', 'Where should we go?', NULL, NULL, NULL, 209, 68, '#e1bee7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-14 15:19:31', '2026-11-14 15:19:44'),
(17, 119, 'booking', 'stay', 'open', '3 Mäderl Haus', NULL, '{\"url\":\"https://www.maederlhaus.at/\",\"preview\":{\"url\":\"https://www.maederlhaus.at/\",\"final_url\":\"https://www.maederlhaus.at/\",\"title\":\"Hotel Garni Drei Mäderl Haus Loipersdorf - Thermenurlaub in Bad Loipersdorf\",\"description\":\"Das Hotel Garni Drei Mäderl Haus in Loipersdorf ist der perfekte Ausgangspunkt für Ihren Wellness-Urlaub in der Thermenregion Loipersdorf. Genießen Sie bei uns entspannte Tage und lassen Sie sich von unserem vielfältigen Angebot verwöhnen. Loipersdorf wartet auf Sie!\",\"image_url\":\"https://www.maederlhaus.at/img/1000/800/90/data/images/2024/059W7787.jpg\",\"site_name\":\"maederlhaus.at\",\"price_cents\":null,\"price_currency\":null,\"fetched_at\":\"2026-11-16T16:51:28Z\"}}', NULL, 40, 40, '#b2dfdb', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-16 17:50:30', '2026-11-16 17:51:28'),
(20, 119, 'poll', 'transport', 'decided', 'How do we get there?', NULL, NULL, NULL, 898, 66, '#e1bee7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-16 18:07:28', '2026-11-16 18:07:48'),
(25, 113, 'poll', 'destination', 'decided', 'Where should we go?', NULL, NULL, NULL, 104, 104, '#e1bee7', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-19 16:36:12', '2026-11-19 16:36:14');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_item_assignees`
--

CREATE TABLE `plan_item_assignees` (
  `item_id` int(10) UNSIGNED NOT NULL,
  `user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `plan_item_assignees`
--

INSERT INTO `plan_item_assignees` (`item_id`, `user_id`) VALUES
(10, 'NPFiASPHZPTT5FkwnKK5VHwWncq2'),
(14, 'jNeck60VMGTg8dRYbdUHPWaE56g1'),
(14, 'zMu6buowgTdvrhrJ7eXF3sCma1p1');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_item_comments`
--

CREATE TABLE `plan_item_comments` (
  `comment_id` int(10) UNSIGNED NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `edited_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_item_comments`
--

INSERT INTO `plan_item_comments` (`comment_id`, `item_id`, `user_id`, `body`, `created_at`, `edited_at`) VALUES
(1, 5, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'What do you think about pinaple on a pizza? joke!', '2026-11-09 17:15:56', '2026-11-09 17:16:06'),
(3, 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'penis', '2026-11-09 17:17:49', NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_item_reactions`
--

CREATE TABLE `plan_item_reactions` (
  `item_id` int(10) UNSIGNED NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `reaction` enum('thumbs_up','heart','laugh','wow','party','thumbs_down') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `plan_item_reactions`
--

INSERT INTO `plan_item_reactions` (`item_id`, `user_id`, `reaction`, `created_at`) VALUES
(1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'wow', '2026-11-09 17:17:53'),
(5, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'thumbs_up', '2026-11-09 17:08:55'),
(5, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'heart', '2026-11-09 17:04:05'),
(5, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'wow', '2026-11-09 17:02:28'),
(10, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'party', '2026-11-09 17:09:02'),
(15, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'heart', '2026-11-09 17:02:46');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_milestones`
--

CREATE TABLE `plan_milestones` (
  `memory_id` int(11) NOT NULL,
  `milestone` enum('destination','stay','transport') NOT NULL,
  `state` enum('done','skipped') NOT NULL,
  `updated_by` varchar(128) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_milestones`
--

INSERT INTO `plan_milestones` (`memory_id`, `milestone`, `state`, `updated_by`, `updated_at`) VALUES
(120, 'stay', 'skipped', 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 12:00:32');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_polls`
--

CREATE TABLE `plan_polls` (
  `item_id` int(10) UNSIGNED NOT NULL,
  `multiple` tinyint(1) NOT NULL DEFAULT 0,
  `max_choices` tinyint(3) UNSIGNED DEFAULT NULL,
  `closes_at` datetime DEFAULT NULL,
  `allow_member_options` tinyint(1) NOT NULL DEFAULT 0,
  `hide_results` tinyint(1) NOT NULL DEFAULT 0,
  `decided_option_id` int(10) UNSIGNED DEFAULT NULL,
  `decided_by` varchar(128) DEFAULT NULL,
  `decided_at` datetime DEFAULT NULL,
  `source_item_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_polls`
--

INSERT INTO `plan_polls` (`item_id`, `multiple`, `max_choices`, `closes_at`, `allow_member_options`, `hide_results`, `decided_option_id`, `decided_by`, `decided_at`, `source_item_id`) VALUES
(5, 0, NULL, '2026-11-10 10:14:37', 0, 0, NULL, NULL, NULL, NULL),
(7, 1, NULL, '2026-11-07 11:40:47', 0, 0, 9, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 12:34:06', 6),
(8, 0, NULL, '2026-11-07 11:59:46', 0, 0, 11, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-07 10:59:57', NULL),
(9, 0, NULL, '2026-11-10 11:00:50', 0, 0, NULL, NULL, NULL, NULL),
(16, 0, NULL, '2026-11-14 15:19:30', 1, 0, NULL, NULL, NULL, NULL),
(20, 0, NULL, '2026-11-19 17:07:28', 0, 0, 19, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-16 17:07:32', NULL),
(25, 0, NULL, '2026-11-22 15:36:12', 0, 0, 27, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', '2026-11-19 15:36:14', NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_poll_options`
--

CREATE TABLE `plan_poll_options` (
  `option_id` int(10) UNSIGNED NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `label` varchar(200) NOT NULL,
  `sort_order` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `created_by` varchar(128) NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `country_code` char(2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `plan_poll_options`
--

INSERT INTO `plan_poll_options` (`option_id`, `item_id`, `label`, `sort_order`, `created_by`, `latitude`, `longitude`, `city`, `country`, `country_code`, `created_at`) VALUES
(5, 5, 'Pizza', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 11:14:37'),
(6, 5, 'Pasta', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 11:14:37'),
(7, 5, 'Apfel', 2, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 11:28:05'),
(8, 5, 'test', 3, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 11:28:27'),
(9, 7, 'Go for Dinner at the sea', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 11:40:47'),
(10, 7, 'Stay at home and cook', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 11:40:47'),
(11, 8, 'Wien', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 48.153622, 16.321484, 'Wien', 'Österreich', 'AT', '2026-11-07 11:59:46'),
(12, 8, 'München', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 48.036218, 11.663281, 'Brunnthal', 'Deutschland', 'DE', '2026-11-07 11:59:46'),
(13, 9, 'Kann fahren', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 12:00:51'),
(14, 9, 'Kein Auto', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-07 12:00:51'),
(15, 16, 'Eggersdorf', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-14 15:19:31'),
(16, 16, 'Tennisplatz', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-14 15:19:31'),
(19, 20, 'Car', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-16 18:07:28'),
(20, 20, 'Train', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-16 18:07:28'),
(27, 25, '1', 0, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-19 16:36:12'),
(28, 25, '2', 1, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', NULL, NULL, NULL, NULL, NULL, '2026-11-19 16:36:12');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `plan_poll_votes`
--

CREATE TABLE `plan_poll_votes` (
  `option_id` int(10) UNSIGNED NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `plan_poll_votes`
--

INSERT INTO `plan_poll_votes` (`option_id`, `user_id`, `item_id`, `created_at`) VALUES
(9, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 7, '2026-11-07 11:40:55'),
(10, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 7, '2026-11-07 11:40:55'),
(11, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 8, '2026-11-07 11:59:49'),
(15, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 16, '2026-11-14 15:19:36'),
(20, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 20, '2026-11-16 18:07:30');

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
-- Tabellenstruktur für Tabelle `upload_sessions`
--

CREATE TABLE `upload_sessions` (
  `session_id` char(36) NOT NULL,
  `memory_id` int(11) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `status` enum('open','complete','expired') NOT NULL DEFAULT 'open',
  `expected_file_count` int(10) UNSIGNED NOT NULL,
  `reserved_bytes` bigint(20) UNSIGNED NOT NULL,
  `registered_files` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `registered_bytes` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `upload_sessions`
--

INSERT INTO `upload_sessions` (`session_id`, `memory_id`, `user_id`, `status`, `expected_file_count`, `reserved_bytes`, `registered_files`, `registered_bytes`, `created_at`, `expires_at`, `completed_at`) VALUES
('0335dc93-bd2e-4709-8efc-f61a10c16e67', 115, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'complete', 2, 5884183, 2, 5884183, '2026-10-20 17:15:57', '2026-10-21 17:15:57', '2026-10-20 17:16:14'),
('0a1ec149-6591-4326-9a01-e73c5dcd45bf', 115, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'complete', 2, 4915869, 2, 4915869, '2026-10-20 17:25:03', '2026-10-21 17:25:03', '2026-10-20 17:25:14'),
('393c6f40-a4ff-49e9-a54f-1f7e17f4ddd7', 127, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'complete', 4, 17233363, 4, 17233363, '2026-11-14 15:15:23', '2026-11-15 15:15:23', '2026-11-14 15:15:44'),
('3f5b7f85-c26c-46b1-bfe5-891880d78e18', 115, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'complete', 2, 2931681, 2, 2931681, '2026-10-20 17:21:02', '2026-10-21 17:21:02', '2026-10-20 17:21:10'),
('b8b26a53-a3d2-4584-bbd7-85e335e25387', 125, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'complete', 7, 17746084, 7, 17746084, '2026-10-21 18:27:18', '2026-10-22 18:27:18', '2026-10-21 18:27:47'),
('cf808bc3-b87b-4e18-b95f-f2d4bcf69111', 115, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'complete', 2, 4595906, 2, 4595906, '2026-10-20 17:19:03', '2026-10-21 17:19:03', '2026-10-20 17:19:09'),
('e6a0eea5-dfa8-477d-901c-1d1982caefcf', 126, 'NPFiASPHZPTT5FkwnKK5VHwWncq2', 'complete', 10, 90891821, 10, 90891821, '2026-10-25 09:24:01', '2026-10-26 09:24:01', '2026-10-25 15:29:15');

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
('DoMcITZOdAdR74DsCsyuB7EOWiE2', 'fighting.pandas2@gmail.com', 'Flo Hofer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, 'FREE', NULL, NULL, NULL),
('i9DBWDl8KhTmtOl6jI3gHhOfjPH2', 'hofer.florian@siemens-energy.com', 'N A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, 'FREE', NULL, NULL, NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 'miriam.langthaller@icloud.com', 'Mimal', '2006-02-05', 'Female', NULL, 'Once tried to high-five a mirror (it didn\'t end well)', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FjNeck60VMGTg8dRYbdUHPWaE56g1%2Fprofile.jpg?alt=media&token=f7d97a7f-3665-4e00-9747-f78969b65e55', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FjNeck60VMGTg8dRYbdUHPWaE56g1%2Fthumbnail.jpg?alt=media&token=6ce68827-2e00-4677-a46e-25c4a30f1fcb', NULL, 'Austria', '', NULL, NULL, 0, 'PRO', NULL, NULL, NULL),
('NCb6y0zFkqaHqz5rQjGhom0wPUr1', 'memorise@online.com', 'Memorise Admin', '2025-05-08T22:00:00.000Z', 'Male', NULL, 'On the rigth side of force!', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNCb6y0zFkqaHqz5rQjGhom0wPUr1%2Fprofile.jpg?alt=media&token=ccd93b8c-206f-4f8c-86d1-a8ef70c42131', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNCb6y0zFkqaHqz5rQjGhom0wPUr1%2Fthumbnail.jpg?alt=media&token=1449e958-e53d-47e6-9c4b-fb9836cd6598', 'big boss', 'Austria', '', NULL, NULL, 0, 'FREE', NULL, NULL, NULL),
('NPFiASPHZPTT5FkwnKK5VHwWncq2', 'florianhofer024@gmail.com', 'Florian Hofer', '2002-12-24T00:00:00.000', 'Male', NULL, 'Find happienes in the simplicity of getting things done', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNPFiASPHZPTT5FkwnKK5VHwWncq2%2Fprofile.jpg?alt=media&token=72b7dc09-7cb0-41a2-acdf-7937a984098d', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FNPFiASPHZPTT5FkwnKK5VHwWncq2%2Fthumbnail.jpg?alt=media&token=0d80c9e5-7711-4eef-8c44-2a280b7c591b', NULL, NULL, '', NULL, NULL, 726442262, 'UNLIMITED', 1, NULL, NULL),
('PwGtN8NAPERY4E1yubhZhNdx0r82', 'test.memorise@memorise.online', 'Nicht Angegeben', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, 'FREE', NULL, NULL, NULL),
('q51SjsmPOoNQOHCt0auiDIcdqUd2', 'a.k.hofer@aon.com', 'Karin Hofer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, 0, 'FREE', NULL, NULL, NULL),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 'niki.gugi@gmail.com', 'Guginator', '2003-08-31T22:00:00.000Z', 'Male', NULL, 'so ca. |     |', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FqCRU6GRChTXyX9oMI3OUAYBnhQ92%2Fprofile.jpg?alt=media&token=31e76d9a-7ac3-48d4-89cd-c6191659c33a', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FqcxAEes01wMUkQqZo00Hv1ALNzj2%2Fthumbnail.jpg?alt=media&token=28ba4645-eabc-488d-833a-1b2b8595777e', 'Guginator', 'Austria', '', NULL, 'Geilesau123', 0, 'FREE', NULL, NULL, NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 'jonaskra@gmail.com', 'Jonas Krahofer', '2003-07-09T22:00:00.000Z', 'Male', NULL, 'test bio', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FzMu6buowgTdvrhrJ7eXF3sCma1p1%2Fprofile.jpg?alt=media&token=43a22d18-636e-424b-ba8a-1fe844887fc8', 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/profile-pictures%2FzMu6buowgTdvrhrJ7eXF3sCma1p1%2Fthumbnail.jpg?alt=media&token=6f8f4708-5a43-4254-b349-0fd65a08f225', 'tset', 'Austria', '', NULL, 'test123123', 0, 'FREE', NULL, NULL, NULL);

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
('jNeck60VMGTg8dRYbdUHPWaE56g1', 113, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 114, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 116, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 119, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 120, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 121, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 122, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 124, 'friend', NULL),
('jNeck60VMGTg8dRYbdUHPWaE56g1', 125, 'friend', NULL),
('NCb6y0zFkqaHqz5rQjGhom0wPUr1', 113, 'friend', NULL),
('NCb6y0zFkqaHqz5rQjGhom0wPUr1', 115, 'friend', NULL),
('placeholder_1787679357694', 121, 'friend', NULL),
('placeholder_1787983825655', 116, 'friend', NULL),
('placeholder_1787984169530', 116, 'friend', NULL),
('placeholder_1791390972122', 122, 'friend', NULL),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 115, 'friend', '#FF0000'),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 125, 'friend', NULL),
('qCRU6GRChTXyX9oMI3OUAYBnhQ92', 126, 'friend', NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 115, 'friend', '#00FF00'),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 120, 'friend', NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 121, 'friend', NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 123, 'friend', NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 124, 'friend', NULL),
('zMu6buowgTdvrhrJ7eXF3sCma1p1', 125, 'friend', NULL);

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
-- Indizes für die Tabelle `link_previews`
--
ALTER TABLE `link_previews`
  ADD PRIMARY KEY (`url_hash`);

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
  ADD UNIQUE KEY `uq_memories_create_request` (`user_id`,`create_request_id`),
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
-- Indizes für die Tabelle `memory_photos`
--
ALTER TABLE `memory_photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD UNIQUE KEY `uq_memory_photos_client` (`memory_id`,`client_id`),
  ADD UNIQUE KEY `uq_memory_photos_path` (`storage_path`),
  ADD KEY `idx_memory_photos_memory_taken` (`memory_id`,`taken_at`),
  ADD KEY `fk_memory_photos_session` (`upload_session_id`);

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
-- Indizes für die Tabelle `placeholders`
--
ALTER TABLE `placeholders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_placeholders_created_by` (`created_by`),
  ADD KEY `fk_placeholders_claimed_by` (`claimed_by_user_id`);

--
-- Indizes für die Tabelle `placeholder_has_memory`
--
ALTER TABLE `placeholder_has_memory`
  ADD PRIMARY KEY (`placeholder_id`,`memory_id`),
  ADD KEY `fk_phm_memory` (`memory_id`);

--
-- Indizes für die Tabelle `plan_availability`
--
ALTER TABLE `plan_availability`
  ADD PRIMARY KEY (`memory_id`,`user_id`,`day`);

--
-- Indizes für die Tabelle `plan_availability_responses`
--
ALTER TABLE `plan_availability_responses`
  ADD PRIMARY KEY (`memory_id`,`user_id`),
  ADD KEY `idx_par_user` (`user_id`);

--
-- Indizes für die Tabelle `plan_bookings`
--
ALTER TABLE `plan_bookings`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_pb_status` (`status`,`kind`);

--
-- Indizes für die Tabelle `plan_date_finder`
--
ALTER TABLE `plan_date_finder`
  ADD PRIMARY KEY (`memory_id`);

--
-- Indizes für die Tabelle `plan_destination`
--
ALTER TABLE `plan_destination`
  ADD PRIMARY KEY (`memory_id`),
  ADD KEY `idx_pd_source_poll` (`source_poll_id`);

--
-- Indizes für die Tabelle `plan_events`
--
ALTER TABLE `plan_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_plan_events_memory` (`memory_id`,`event_id`);

--
-- Indizes für die Tabelle `plan_items`
--
ALTER TABLE `plan_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_plan_items_memory` (`memory_id`,`status`);

--
-- Indizes für die Tabelle `plan_item_assignees`
--
ALTER TABLE `plan_item_assignees`
  ADD PRIMARY KEY (`item_id`,`user_id`),
  ADD KEY `idx_pia_user` (`user_id`);

--
-- Indizes für die Tabelle `plan_item_comments`
--
ALTER TABLE `plan_item_comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `idx_pic_item` (`item_id`,`comment_id`);

--
-- Indizes für die Tabelle `plan_item_reactions`
--
ALTER TABLE `plan_item_reactions`
  ADD PRIMARY KEY (`item_id`,`user_id`,`reaction`),
  ADD KEY `fk_pir_user` (`user_id`);

--
-- Indizes für die Tabelle `plan_milestones`
--
ALTER TABLE `plan_milestones`
  ADD PRIMARY KEY (`memory_id`,`milestone`);

--
-- Indizes für die Tabelle `plan_polls`
--
ALTER TABLE `plan_polls`
  ADD PRIMARY KEY (`item_id`);

--
-- Indizes für die Tabelle `plan_poll_options`
--
ALTER TABLE `plan_poll_options`
  ADD PRIMARY KEY (`option_id`),
  ADD KEY `idx_ppo_item` (`item_id`,`sort_order`);

--
-- Indizes für die Tabelle `plan_poll_votes`
--
ALTER TABLE `plan_poll_votes`
  ADD PRIMARY KEY (`option_id`,`user_id`),
  ADD KEY `idx_ppv_item_user` (`item_id`,`user_id`),
  ADD KEY `fk_ppv_user` (`user_id`);

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
-- Indizes für die Tabelle `upload_sessions`
--
ALTER TABLE `upload_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_upload_sessions_user_active` (`user_id`,`status`,`expires_at`),
  ADD KEY `idx_upload_sessions_memory` (`memory_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT für Tabelle `location`
--
ALTER TABLE `location`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT für Tabelle `memories`
--
ALTER TABLE `memories`
  MODIFY `memory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

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
-- AUTO_INCREMENT für Tabelle `plan_events`
--
ALTER TABLE `plan_events`
  MODIFY `event_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT für Tabelle `plan_items`
--
ALTER TABLE `plan_items`
  MODIFY `item_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT für Tabelle `plan_item_comments`
--
ALTER TABLE `plan_item_comments`
  MODIFY `comment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `plan_poll_options`
--
ALTER TABLE `plan_poll_options`
  MODIFY `option_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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
-- Constraints der Tabelle `memory_photos`
--
ALTER TABLE `memory_photos`
  ADD CONSTRAINT `fk_memory_photos_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_memory_photos_session` FOREIGN KEY (`upload_session_id`) REFERENCES `upload_sessions` (`session_id`) ON DELETE SET NULL;

--
-- Constraints der Tabelle `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`subscription_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `placeholders`
--
ALTER TABLE `placeholders`
  ADD CONSTRAINT `fk_placeholders_claimed_by` FOREIGN KEY (`claimed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_placeholders_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `placeholder_has_memory`
--
ALTER TABLE `placeholder_has_memory`
  ADD CONSTRAINT `fk_phm_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_phm_placeholder` FOREIGN KEY (`placeholder_id`) REFERENCES `placeholders` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_availability`
--
ALTER TABLE `plan_availability`
  ADD CONSTRAINT `fk_pa_response` FOREIGN KEY (`memory_id`,`user_id`) REFERENCES `plan_availability_responses` (`memory_id`, `user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_availability_responses`
--
ALTER TABLE `plan_availability_responses`
  ADD CONSTRAINT `fk_par_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_par_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_bookings`
--
ALTER TABLE `plan_bookings`
  ADD CONSTRAINT `fk_pb_item` FOREIGN KEY (`item_id`) REFERENCES `plan_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_date_finder`
--
ALTER TABLE `plan_date_finder`
  ADD CONSTRAINT `fk_pdf_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_destination`
--
ALTER TABLE `plan_destination`
  ADD CONSTRAINT `fk_pd_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_events`
--
ALTER TABLE `plan_events`
  ADD CONSTRAINT `fk_plan_events_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_items`
--
ALTER TABLE `plan_items`
  ADD CONSTRAINT `fk_plan_items_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_item_assignees`
--
ALTER TABLE `plan_item_assignees`
  ADD CONSTRAINT `fk_pia_item` FOREIGN KEY (`item_id`) REFERENCES `plan_items` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pia_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_item_comments`
--
ALTER TABLE `plan_item_comments`
  ADD CONSTRAINT `fk_pic_item` FOREIGN KEY (`item_id`) REFERENCES `plan_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_item_reactions`
--
ALTER TABLE `plan_item_reactions`
  ADD CONSTRAINT `fk_pir_item` FOREIGN KEY (`item_id`) REFERENCES `plan_items` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pir_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_milestones`
--
ALTER TABLE `plan_milestones`
  ADD CONSTRAINT `fk_pm_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_polls`
--
ALTER TABLE `plan_polls`
  ADD CONSTRAINT `fk_pp_item` FOREIGN KEY (`item_id`) REFERENCES `plan_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_poll_options`
--
ALTER TABLE `plan_poll_options`
  ADD CONSTRAINT `fk_ppo_item` FOREIGN KEY (`item_id`) REFERENCES `plan_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `plan_poll_votes`
--
ALTER TABLE `plan_poll_votes`
  ADD CONSTRAINT `fk_ppv_option` FOREIGN KEY (`option_id`) REFERENCES `plan_poll_options` (`option_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ppv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

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
-- Constraints der Tabelle `upload_sessions`
--
ALTER TABLE `upload_sessions`
  ADD CONSTRAINT `fk_upload_sessions_memory` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`memory_id`) ON DELETE CASCADE;

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
