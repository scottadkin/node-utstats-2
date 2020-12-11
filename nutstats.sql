-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2020 at 03:52 PM
-- Server version: 10.4.10-MariaDB
-- PHP Version: 7.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nutstats`
--

-- --------------------------------------------------------

--
-- Table structure for table `nstats_assault_match_objectives`
--

CREATE TABLE `nstats_assault_match_objectives` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `obj_id` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `bfinal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_assault_objects`
--

CREATE TABLE `nstats_assault_objects` (
  `id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `obj_id` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `taken` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_dom_control_points`
--

CREATE TABLE `nstats_dom_control_points` (
  `id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `captured` int(11) NOT NULL,
  `matches` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_dom_match_control_points`
--

CREATE TABLE `nstats_dom_match_control_points` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `captured` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_faces`
--

CREATE TABLE `nstats_faces` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `uses` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_gametypes`
--

CREATE TABLE `nstats_gametypes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `playtime` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_logs`
--

CREATE TABLE `nstats_logs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `imported` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_maps`
--

CREATE TABLE `nstats_maps` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `title` varchar(100) NOT NULL,
  `author` varchar(100) NOT NULL,
  `ideal_player_count` varchar(100) NOT NULL,
  `level_enter_text` varchar(100) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `playtime` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_map_spawns`
--

CREATE TABLE `nstats_map_spawns` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `map` int(11) NOT NULL,
  `x` double NOT NULL,
  `y` double NOT NULL,
  `z` double NOT NULL,
  `spawns` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_matches`
--

CREATE TABLE `nstats_matches` (
  `id` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `server` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `version` int(11) NOT NULL,
  `min_version` int(11) NOT NULL,
  `admin` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `region` int(11) NOT NULL,
  `motd` text NOT NULL,
  `playtime` float NOT NULL,
  `end_type` varchar(50) NOT NULL,
  `start` float NOT NULL,
  `end` float NOT NULL,
  `insta` int(11) NOT NULL,
  `team_game` int(11) NOT NULL,
  `game_speed` int(11) NOT NULL,
  `hardcore` int(11) NOT NULL,
  `tournament` int(11) NOT NULL,
  `air_control` float NOT NULL,
  `use_translocator` int(11) NOT NULL,
  `friendly_fire_scale` float NOT NULL,
  `net_mode` varchar(100) NOT NULL,
  `max_spectators` int(11) NOT NULL,
  `max_players` int(11) NOT NULL,
  `players` int(11) NOT NULL,
  `time_limit` int(11) NOT NULL,
  `target_score` int(11) NOT NULL,
  `dm_winner` varchar(50) NOT NULL,
  `dm_score` int(11) NOT NULL,
  `team_score_0` float NOT NULL,
  `team_score_1` float NOT NULL,
  `team_score_2` float NOT NULL,
  `team_score_3` float NOT NULL,
  `attacking_team` int(11) NOT NULL,
  `dom_caps` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_player_totals`
--

CREATE TABLE `nstats_player_totals` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `ip` varchar(50) NOT NULL,
  `country` varchar(2) NOT NULL,
  `face` int(100) NOT NULL,
  `gametype` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `wins` int(11) NOT NULL,
  `losses` int(11) NOT NULL,
  `draws` int(11) NOT NULL,
  `playtime` double NOT NULL,
  `first_bloods` int(11) NOT NULL,
  `frags` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `kills` int(11) NOT NULL,
  `deaths` int(11) NOT NULL,
  `suicides` int(11) NOT NULL,
  `team_kills` int(11) NOT NULL,
  `spawn_kills` int(11) NOT NULL,
  `efficiency` float NOT NULL,
  `multi_1` int(11) NOT NULL,
  `multi_2` int(11) NOT NULL,
  `multi_3` int(11) NOT NULL,
  `multi_4` int(11) NOT NULL,
  `multi_5` int(11) NOT NULL,
  `multi_6` int(11) NOT NULL,
  `multi_7` int(11) NOT NULL,
  `multi_best` int(11) NOT NULL,
  `spree_1` int(11) NOT NULL,
  `spree_2` int(11) NOT NULL,
  `spree_3` int(11) NOT NULL,
  `spree_4` int(11) NOT NULL,
  `spree_5` int(11) NOT NULL,
  `spree_6` int(11) NOT NULL,
  `spree_7` int(11) NOT NULL,
  `spree_best` int(11) NOT NULL,
  `fastest_kill` float NOT NULL,
  `slowest_kill` float NOT NULL,
  `best_spawn_kill_spree` int(11) NOT NULL,
  `flag_assist` int(11) NOT NULL,
  `flag_return` int(11) NOT NULL,
  `flag_taken` int(11) NOT NULL,
  `flag_dropped` int(11) NOT NULL,
  `flag_capture` int(11) NOT NULL,
  `flag_pickup` int(11) NOT NULL,
  `flag_cover` int(11) NOT NULL,
  `flag_kill` int(11) NOT NULL,
  `flag_save` int(11) NOT NULL,
  `assault_objectives` int(11) NOT NULL,
  `dom_caps` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_servers`
--

CREATE TABLE `nstats_servers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `ip` varchar(100) NOT NULL,
  `port` int(5) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `playtime` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `nstats_assault_match_objectives`
--
ALTER TABLE `nstats_assault_match_objectives`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_assault_objects`
--
ALTER TABLE `nstats_assault_objects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_dom_control_points`
--
ALTER TABLE `nstats_dom_control_points`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_dom_match_control_points`
--
ALTER TABLE `nstats_dom_match_control_points`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_faces`
--
ALTER TABLE `nstats_faces`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_gametypes`
--
ALTER TABLE `nstats_gametypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_logs`
--
ALTER TABLE `nstats_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_maps`
--
ALTER TABLE `nstats_maps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_map_spawns`
--
ALTER TABLE `nstats_map_spawns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_matches`
--
ALTER TABLE `nstats_matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_player_totals`
--
ALTER TABLE `nstats_player_totals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_servers`
--
ALTER TABLE `nstats_servers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `nstats_assault_match_objectives`
--
ALTER TABLE `nstats_assault_match_objectives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_assault_objects`
--
ALTER TABLE `nstats_assault_objects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_dom_control_points`
--
ALTER TABLE `nstats_dom_control_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_dom_match_control_points`
--
ALTER TABLE `nstats_dom_match_control_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_faces`
--
ALTER TABLE `nstats_faces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_gametypes`
--
ALTER TABLE `nstats_gametypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_logs`
--
ALTER TABLE `nstats_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_maps`
--
ALTER TABLE `nstats_maps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_map_spawns`
--
ALTER TABLE `nstats_map_spawns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_matches`
--
ALTER TABLE `nstats_matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_player_totals`
--
ALTER TABLE `nstats_player_totals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_servers`
--
ALTER TABLE `nstats_servers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
