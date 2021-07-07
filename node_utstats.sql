-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 07, 2021 at 10:34 PM
-- Server version: 10.4.19-MariaDB
-- PHP Version: 8.0.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `node_utstats`
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
  `obj_order` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `obj_id` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `taken` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_countries`
--

CREATE TABLE `nstats_countries` (
  `id` int(11) NOT NULL,
  `code` varchar(2) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `total` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_ctf_caps`
--

CREATE TABLE `nstats_ctf_caps` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `team` int(11) NOT NULL,
  `grab_time` float NOT NULL,
  `grab` int(11) NOT NULL,
  `drops` text NOT NULL,
  `drop_times` text NOT NULL,
  `pickups` text NOT NULL,
  `pickup_times` text NOT NULL,
  `covers` varchar(1000) NOT NULL,
  `cover_times` text NOT NULL,
  `assists` varchar(1000) NOT NULL,
  `assist_carry_times` text NOT NULL,
  `assist_carry_ids` text NOT NULL,
  `cap` int(11) NOT NULL,
  `cap_time` float NOT NULL,
  `travel_time` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_ctf_events`
--

CREATE TABLE `nstats_ctf_events` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `player` int(11) NOT NULL,
  `event` varchar(30) NOT NULL,
  `team` int(11) NOT NULL
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
  `matches` int(11) NOT NULL,
  `x` float NOT NULL,
  `y` float NOT NULL,
  `z` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_dom_match_caps`
--

CREATE TABLE `nstats_dom_match_caps` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `time` float NOT NULL,
  `player` int(11) NOT NULL,
  `point` int(11) NOT NULL,
  `team` int(11) NOT NULL
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
-- Table structure for table `nstats_dom_match_player_score`
--

CREATE TABLE `nstats_dom_match_player_score` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `player` int(11) NOT NULL,
  `score` int(11) NOT NULL
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
-- Table structure for table `nstats_ftp`
--

CREATE TABLE `nstats_ftp` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `host` varchar(250) NOT NULL,
  `port` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `target_folder` varchar(250) NOT NULL,
  `delete_after_import` tinyint(1) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `total_imports` int(11) NOT NULL,
  `delete_tmp_files` int(1) NOT NULL,
  `total_logs_imported` int(11) NOT NULL,
  `ignore_bots` int(1) NOT NULL,
  `ignore_duplicates` int(1) NOT NULL
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
-- Table structure for table `nstats_headshots`
--

CREATE TABLE `nstats_headshots` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `killer` int(11) NOT NULL,
  `victim` int(11) NOT NULL,
  `distance` float NOT NULL,
  `killer_team` int(11) NOT NULL,
  `victim_team` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_items`
--

CREATE TABLE `nstats_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `uses` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_items_match`
--

CREATE TABLE `nstats_items_match` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `item` int(11) NOT NULL,
  `uses` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_items_player`
--

CREATE TABLE `nstats_items_player` (
  `id` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `item` int(11) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `uses` int(11) NOT NULL,
  `matches` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_kills`
--

CREATE TABLE `nstats_kills` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `killer` int(11) NOT NULL,
  `killer_team` int(11) NOT NULL,
  `victim` int(11) NOT NULL,
  `victim_team` int(11) NOT NULL,
  `killer_weapon` int(11) NOT NULL,
  `victim_weapon` int(11) NOT NULL,
  `distance` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_logs`
--

CREATE TABLE `nstats_logs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `imported` int(11) NOT NULL,
  `match_id` int(11) NOT NULL
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
-- Table structure for table `nstats_maps_flags`
--

CREATE TABLE `nstats_maps_flags` (
  `id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `team` int(11) NOT NULL,
  `x` float NOT NULL,
  `y` float NOT NULL,
  `z` float NOT NULL
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
  `spawns` int(11) NOT NULL,
  `team` int(11) NOT NULL
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
  `mutators` text NOT NULL,
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
  `total_teams` int(11) NOT NULL,
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
  `assault_caps` int(11) NOT NULL,
  `dom_caps` int(11) NOT NULL,
  `mh_kills` int(11) NOT NULL,
  `mh` int(11) NOT NULL,
  `views` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_match_connections`
--

CREATE TABLE `nstats_match_connections` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `player` int(11) NOT NULL,
  `event` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_match_pings`
--

CREATE TABLE `nstats_match_pings` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `ping` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_match_player_score`
--

CREATE TABLE `nstats_match_player_score` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `player` int(11) NOT NULL,
  `score` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_match_team_changes`
--

CREATE TABLE `nstats_match_team_changes` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `player` int(11) NOT NULL,
  `team` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_monsters`
--

CREATE TABLE `nstats_monsters` (
  `id` int(11) NOT NULL,
  `class_name` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `display_name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `matches` int(11) NOT NULL,
  `deaths` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_monsters_match`
--

CREATE TABLE `nstats_monsters_match` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `monster` int(11) NOT NULL,
  `deaths` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_monsters_player_match`
--

CREATE TABLE `nstats_monsters_player_match` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `monster` int(11) NOT NULL,
  `kills` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_monsters_player_totals`
--

CREATE TABLE `nstats_monsters_player_totals` (
  `id` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `monster` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `kills` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_monster_kills`
--

CREATE TABLE `nstats_monster_kills` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `timestamp` float NOT NULL,
  `monster` int(11) NOT NULL,
  `player` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_nexgen_stats_viewer`
--

CREATE TABLE `nstats_nexgen_stats_viewer` (
  `id` int(11) NOT NULL,
  `title` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `type` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `players` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `enabled` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_player_maps`
--

CREATE TABLE `nstats_player_maps` (
  `id` int(11) NOT NULL,
  `map` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `first` int(11) NOT NULL,
  `first_id` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `last_id` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `playtime` double NOT NULL,
  `longest` float NOT NULL,
  `longest_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_player_matches`
--

CREATE TABLE `nstats_player_matches` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `match_date` int(11) NOT NULL,
  `map_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `bot` tinyint(1) NOT NULL,
  `spectator` tinyint(1) NOT NULL,
  `played` tinyint(1) NOT NULL,
  `ip` varchar(50) NOT NULL,
  `country` varchar(5) NOT NULL,
  `face` int(11) NOT NULL,
  `voice` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `winner` int(11) NOT NULL,
  `draw` int(11) NOT NULL,
  `playtime` float NOT NULL,
  `team` int(1) NOT NULL,
  `first_blood` int(1) NOT NULL,
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
  `best_spawn_kill_spree` int(11) NOT NULL,
  `flag_assist` int(11) NOT NULL,
  `flag_return` int(11) NOT NULL,
  `flag_taken` int(11) NOT NULL,
  `flag_dropped` int(11) NOT NULL,
  `flag_capture` int(11) NOT NULL,
  `flag_pickup` int(11) NOT NULL,
  `flag_seal` int(11) NOT NULL,
  `flag_cover` int(11) NOT NULL,
  `flag_cover_pass` int(11) NOT NULL,
  `flag_cover_fail` int(11) NOT NULL,
  `flag_self_cover` int(11) NOT NULL,
  `flag_self_cover_pass` int(11) NOT NULL,
  `flag_self_cover_fail` int(11) NOT NULL,
  `flag_multi_cover` int(11) NOT NULL,
  `flag_spree_cover` int(11) NOT NULL,
  `flag_cover_best` int(11) NOT NULL,
  `flag_self_cover_best` int(11) NOT NULL,
  `flag_kill` int(11) NOT NULL,
  `flag_save` int(11) NOT NULL,
  `flag_carry_time` double NOT NULL,
  `assault_objectives` int(11) NOT NULL,
  `dom_caps` int(11) NOT NULL,
  `dom_caps_best_life` int(11) NOT NULL,
  `ping_min` int(11) NOT NULL,
  `ping_average` int(11) NOT NULL,
  `ping_max` int(11) NOT NULL,
  `accuracy` float NOT NULL,
  `shortest_kill_distance` float NOT NULL,
  `average_kill_distance` float NOT NULL,
  `longest_kill_distance` float NOT NULL,
  `k_distance_normal` int(11) NOT NULL,
  `k_distance_long` int(11) NOT NULL,
  `k_distance_uber` int(11) NOT NULL,
  `headshots` int(11) NOT NULL,
  `shield_belt` int(11) NOT NULL,
  `amp` int(11) NOT NULL,
  `amp_time` float NOT NULL,
  `invisibility` int(11) NOT NULL,
  `invisibility_time` float NOT NULL,
  `pads` int(11) NOT NULL,
  `armor` int(11) NOT NULL,
  `boots` int(11) NOT NULL,
  `super_health` int(11) NOT NULL,
  `mh_kills` int(11) NOT NULL,
  `mh_kills_best_life` int(11) NOT NULL,
  `views` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_player_totals`
--

CREATE TABLE `nstats_player_totals` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `player_id` int(11) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `ip` varchar(50) NOT NULL,
  `country` varchar(2) NOT NULL,
  `face` int(100) NOT NULL,
  `voice` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `wins` int(11) NOT NULL,
  `losses` int(11) NOT NULL,
  `draws` int(11) NOT NULL,
  `winrate` float NOT NULL,
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
  `flag_seal` int(11) NOT NULL,
  `flag_cover` int(11) NOT NULL,
  `flag_cover_pass` int(11) NOT NULL,
  `flag_cover_fail` int(11) NOT NULL,
  `flag_self_cover` int(11) NOT NULL,
  `flag_self_cover_pass` int(11) NOT NULL,
  `flag_self_cover_fail` int(11) NOT NULL,
  `flag_multi_cover` int(11) NOT NULL,
  `flag_spree_cover` int(11) NOT NULL,
  `flag_cover_best` int(11) NOT NULL,
  `flag_self_cover_best` int(11) NOT NULL,
  `flag_kill` int(11) NOT NULL,
  `flag_save` int(11) NOT NULL,
  `flag_carry_time` double NOT NULL,
  `assault_objectives` int(11) NOT NULL,
  `dom_caps` int(11) NOT NULL,
  `dom_caps_best` int(11) NOT NULL,
  `dom_caps_best_life` int(11) NOT NULL,
  `accuracy` float NOT NULL,
  `k_distance_normal` int(11) NOT NULL,
  `k_distance_long` int(11) NOT NULL,
  `k_distance_uber` int(11) NOT NULL,
  `headshots` int(11) NOT NULL,
  `shield_belt` int(11) NOT NULL,
  `amp` int(11) NOT NULL,
  `amp_time` float NOT NULL,
  `invisibility` int(11) NOT NULL,
  `invisibility_time` float NOT NULL,
  `pads` int(11) NOT NULL,
  `armor` int(11) NOT NULL,
  `boots` int(11) NOT NULL,
  `super_health` int(11) NOT NULL,
  `mh_kills` int(11) NOT NULL,
  `mh_kills_best_life` int(11) NOT NULL,
  `mh_kills_best` int(11) NOT NULL,
  `views` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_player_weapon_match`
--

CREATE TABLE `nstats_player_weapon_match` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `weapon_id` int(11) NOT NULL,
  `kills` int(11) NOT NULL,
  `deaths` int(11) NOT NULL,
  `accuracy` float NOT NULL,
  `shots` int(11) NOT NULL,
  `hits` int(11) NOT NULL,
  `damage` bigint(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_player_weapon_totals`
--

CREATE TABLE `nstats_player_weapon_totals` (
  `id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `weapon` int(11) NOT NULL,
  `kills` int(11) NOT NULL,
  `deaths` int(11) NOT NULL,
  `efficiency` int(11) NOT NULL,
  `accuracy` float NOT NULL,
  `shots` int(11) NOT NULL,
  `hits` int(11) NOT NULL,
  `damage` bigint(11) NOT NULL,
  `matches` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_ranking_player_current`
--

CREATE TABLE `nstats_ranking_player_current` (
  `id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `playtime` float NOT NULL,
  `ranking` double NOT NULL,
  `ranking_change` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_ranking_player_history`
--

CREATE TABLE `nstats_ranking_player_history` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `ranking` float NOT NULL,
  `match_ranking` float NOT NULL,
  `ranking_change` float NOT NULL,
  `match_ranking_change` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_ranking_values`
--

CREATE TABLE `nstats_ranking_values` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `display_name` varchar(75) NOT NULL,
  `description` varchar(250) NOT NULL,
  `value` float NOT NULL
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

-- --------------------------------------------------------

--
-- Table structure for table `nstats_sessions`
--

CREATE TABLE `nstats_sessions` (
  `id` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `created` int(11) NOT NULL,
  `expires` int(11) NOT NULL,
  `login_ip` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_site_settings`
--

CREATE TABLE `nstats_site_settings` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_sprees`
--

CREATE TABLE `nstats_sprees` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `kills` int(11) NOT NULL,
  `start_timestamp` float NOT NULL,
  `end_timestamp` float NOT NULL,
  `total_time` float NOT NULL,
  `killer` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_users`
--

CREATE TABLE `nstats_users` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `password` varchar(64) NOT NULL,
  `joined` int(11) NOT NULL,
  `activated` int(1) NOT NULL,
  `logins` int(11) NOT NULL,
  `admin` int(11) NOT NULL,
  `last_login` int(11) NOT NULL,
  `last_active` int(11) NOT NULL,
  `last_ip` varchar(50) NOT NULL,
  `banned` int(11) NOT NULL,
  `upload_images` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_voices`
--

CREATE TABLE `nstats_voices` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `first` int(11) NOT NULL,
  `last` int(11) NOT NULL,
  `uses` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_weapons`
--

CREATE TABLE `nstats_weapons` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `matches` int(11) NOT NULL,
  `kills` int(11) NOT NULL,
  `deaths` int(11) NOT NULL,
  `accuracy` float NOT NULL,
  `shots` int(11) NOT NULL,
  `hits` int(11) NOT NULL,
  `damage` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_winrates`
--

CREATE TABLE `nstats_winrates` (
  `id` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `match_result` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `wins` int(11) NOT NULL,
  `draws` int(11) NOT NULL,
  `losses` int(11) NOT NULL,
  `winrate` float NOT NULL,
  `current_win_streak` int(11) NOT NULL,
  `current_draw_streak` int(11) NOT NULL,
  `current_lose_streak` int(11) NOT NULL,
  `max_win_streak` int(11) NOT NULL,
  `max_draw_streak` int(11) NOT NULL,
  `max_lose_streak` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `nstats_winrates_latest`
--

CREATE TABLE `nstats_winrates_latest` (
  `id` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `player` int(11) NOT NULL,
  `gametype` int(11) NOT NULL,
  `matches` int(11) NOT NULL,
  `wins` int(11) NOT NULL,
  `draws` int(11) NOT NULL,
  `losses` int(11) NOT NULL,
  `winrate` float NOT NULL,
  `current_win_streak` int(11) NOT NULL,
  `current_draw_streak` int(11) NOT NULL,
  `current_lose_streak` int(11) NOT NULL,
  `max_win_streak` int(11) NOT NULL,
  `max_draw_streak` int(11) NOT NULL,
  `max_lose_streak` int(11) NOT NULL
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
-- Indexes for table `nstats_countries`
--
ALTER TABLE `nstats_countries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_ctf_caps`
--
ALTER TABLE `nstats_ctf_caps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_ctf_events`
--
ALTER TABLE `nstats_ctf_events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_dom_control_points`
--
ALTER TABLE `nstats_dom_control_points`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_dom_match_caps`
--
ALTER TABLE `nstats_dom_match_caps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_dom_match_control_points`
--
ALTER TABLE `nstats_dom_match_control_points`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_dom_match_player_score`
--
ALTER TABLE `nstats_dom_match_player_score`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_faces`
--
ALTER TABLE `nstats_faces`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_ftp`
--
ALTER TABLE `nstats_ftp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_gametypes`
--
ALTER TABLE `nstats_gametypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_headshots`
--
ALTER TABLE `nstats_headshots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_items`
--
ALTER TABLE `nstats_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_items_match`
--
ALTER TABLE `nstats_items_match`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_items_player`
--
ALTER TABLE `nstats_items_player`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_kills`
--
ALTER TABLE `nstats_kills`
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
-- Indexes for table `nstats_maps_flags`
--
ALTER TABLE `nstats_maps_flags`
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
-- Indexes for table `nstats_match_connections`
--
ALTER TABLE `nstats_match_connections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_match_pings`
--
ALTER TABLE `nstats_match_pings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_match_player_score`
--
ALTER TABLE `nstats_match_player_score`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_match_team_changes`
--
ALTER TABLE `nstats_match_team_changes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_monsters`
--
ALTER TABLE `nstats_monsters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_monsters_match`
--
ALTER TABLE `nstats_monsters_match`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_monsters_player_match`
--
ALTER TABLE `nstats_monsters_player_match`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_monsters_player_totals`
--
ALTER TABLE `nstats_monsters_player_totals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_monster_kills`
--
ALTER TABLE `nstats_monster_kills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_nexgen_stats_viewer`
--
ALTER TABLE `nstats_nexgen_stats_viewer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_player_maps`
--
ALTER TABLE `nstats_player_maps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_player_matches`
--
ALTER TABLE `nstats_player_matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_player_totals`
--
ALTER TABLE `nstats_player_totals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_player_weapon_match`
--
ALTER TABLE `nstats_player_weapon_match`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_player_weapon_totals`
--
ALTER TABLE `nstats_player_weapon_totals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_ranking_player_current`
--
ALTER TABLE `nstats_ranking_player_current`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_ranking_player_history`
--
ALTER TABLE `nstats_ranking_player_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_ranking_values`
--
ALTER TABLE `nstats_ranking_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_servers`
--
ALTER TABLE `nstats_servers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_sessions`
--
ALTER TABLE `nstats_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_site_settings`
--
ALTER TABLE `nstats_site_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_sprees`
--
ALTER TABLE `nstats_sprees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_users`
--
ALTER TABLE `nstats_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_voices`
--
ALTER TABLE `nstats_voices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_weapons`
--
ALTER TABLE `nstats_weapons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_winrates`
--
ALTER TABLE `nstats_winrates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nstats_winrates_latest`
--
ALTER TABLE `nstats_winrates_latest`
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
-- AUTO_INCREMENT for table `nstats_countries`
--
ALTER TABLE `nstats_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_ctf_caps`
--
ALTER TABLE `nstats_ctf_caps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_ctf_events`
--
ALTER TABLE `nstats_ctf_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_dom_control_points`
--
ALTER TABLE `nstats_dom_control_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_dom_match_caps`
--
ALTER TABLE `nstats_dom_match_caps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_dom_match_control_points`
--
ALTER TABLE `nstats_dom_match_control_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_dom_match_player_score`
--
ALTER TABLE `nstats_dom_match_player_score`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_faces`
--
ALTER TABLE `nstats_faces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_ftp`
--
ALTER TABLE `nstats_ftp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_gametypes`
--
ALTER TABLE `nstats_gametypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_headshots`
--
ALTER TABLE `nstats_headshots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_items`
--
ALTER TABLE `nstats_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_items_match`
--
ALTER TABLE `nstats_items_match`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_items_player`
--
ALTER TABLE `nstats_items_player`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_kills`
--
ALTER TABLE `nstats_kills`
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
-- AUTO_INCREMENT for table `nstats_maps_flags`
--
ALTER TABLE `nstats_maps_flags`
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
-- AUTO_INCREMENT for table `nstats_match_connections`
--
ALTER TABLE `nstats_match_connections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_match_pings`
--
ALTER TABLE `nstats_match_pings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_match_player_score`
--
ALTER TABLE `nstats_match_player_score`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_match_team_changes`
--
ALTER TABLE `nstats_match_team_changes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_monsters`
--
ALTER TABLE `nstats_monsters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_monsters_match`
--
ALTER TABLE `nstats_monsters_match`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_monsters_player_match`
--
ALTER TABLE `nstats_monsters_player_match`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_monsters_player_totals`
--
ALTER TABLE `nstats_monsters_player_totals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_monster_kills`
--
ALTER TABLE `nstats_monster_kills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_nexgen_stats_viewer`
--
ALTER TABLE `nstats_nexgen_stats_viewer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_player_maps`
--
ALTER TABLE `nstats_player_maps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_player_matches`
--
ALTER TABLE `nstats_player_matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_player_totals`
--
ALTER TABLE `nstats_player_totals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_player_weapon_match`
--
ALTER TABLE `nstats_player_weapon_match`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_player_weapon_totals`
--
ALTER TABLE `nstats_player_weapon_totals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_ranking_player_current`
--
ALTER TABLE `nstats_ranking_player_current`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_ranking_player_history`
--
ALTER TABLE `nstats_ranking_player_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_ranking_values`
--
ALTER TABLE `nstats_ranking_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_servers`
--
ALTER TABLE `nstats_servers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_sessions`
--
ALTER TABLE `nstats_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_site_settings`
--
ALTER TABLE `nstats_site_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_sprees`
--
ALTER TABLE `nstats_sprees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_users`
--
ALTER TABLE `nstats_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_voices`
--
ALTER TABLE `nstats_voices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_weapons`
--
ALTER TABLE `nstats_weapons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_winrates`
--
ALTER TABLE `nstats_winrates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nstats_winrates_latest`
--
ALTER TABLE `nstats_winrates_latest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
