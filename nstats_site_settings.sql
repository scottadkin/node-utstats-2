-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 04, 2021 at 12:02 PM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

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
-- Table structure for table `nstats_site_settings`
--

CREATE TABLE `nstats_site_settings` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `nstats_site_settings`
--

INSERT INTO `nstats_site_settings` (`id`, `category`, `name`, `value`) VALUES
(2, 'Home', 'Display Recent Matches', 'true'),
(3, 'Home', 'Display Recent Matches & Player Stats', 'false'),
(4, 'Home', 'Display Most Played Gametypes', 'true'),
(5, 'Home', 'Display Most Played Maps', 'true'),
(6, 'Home', 'Display Addicted Players', 'true'),
(7, 'Home', 'Display Most Used Faces', 'true'),
(8, 'Home', 'Display Most Popular Countries', 'true'),
(13, 'Navigation', 'Display Home', 'true'),
(14, 'Navigation', 'Display Matches', 'true'),
(15, 'Navigation', 'Display Players', 'true'),
(16, 'Navigation', 'Display Rankings', 'true'),
(17, 'Navigation', 'Display Records', 'true'),
(18, 'Navigation', 'Display Maps', 'true'),
(19, 'Navigation', 'Display Login/Logout', 'true'),
(20, 'Players Page', 'Default Sort Type', 'matches'),
(21, 'Players Page', 'Default Order', 'ASC'),
(22, 'Players Page', 'Default Display Per Page', '10'),
(23, 'Players Page', 'Default Display Type', '1'),
(24, 'Home', 'Display Recent Players', 'true'),
(25, 'Navigation', 'Display Admin', 'true'),
(26, 'Matches Page', 'Default Gametype', '0'),
(27, 'Matches Page', 'Default Display Per Page', '75'),
(28, 'Matches Page', 'Default Display Type', '0'),
(29, 'Home', 'Recent Matches Display Type', '0'),
(30, 'Home', 'Recent Matches To Display', '3'),
(31, 'Records Page', 'Default Record Type', '1'),
(33, 'Records Page', 'Default Per Page', '25'),
(34, 'Maps Page', 'Default Display Per Page', '75'),
(35, 'Maps Page', 'Default Display Type', '1'),
(36, 'Match Pages', 'Display Summary', 'true'),
(37, 'Match Pages', 'Display Screenshot', 'true'),
(38, 'Match Pages', 'Display Frag Summary', 'true'),
(39, 'Match Pages', 'Display Frags Graphs', 'true'),
(40, 'Match Pages', 'Display Capture The Flag Summary', 'true'),
(41, 'Match Pages', 'Display Capture The Flag Graphs', 'true'),
(42, 'Match Pages', 'Display Capture The Flag Caps', 'true'),
(43, 'Match Pages', 'Display Special Events', 'true'),
(44, 'Match Pages', 'Display Kills Match Up', 'true'),
(45, 'Match Pages', 'Display Powerup Control', 'true'),
(46, 'Match Pages', 'Display Weapon Statistics', 'true'),
(47, 'Match Pages', 'Display Pickup Summary', 'true'),
(48, 'Match Pages', 'Display Player Ping Graph', 'true'),
(49, 'Match Pages', 'Display Players Connected to Server Graph', 'true'),
(50, 'Match Pages', 'Display Team Changes', 'true'),
(51, 'Match Pages', 'Display Server Settings', 'true'),
(52, 'Match Pages', 'Display Assault Summary', 'true'),
(53, 'Match Pages', 'Display Domination Summary', 'true'),
(54, 'Match Pages', 'Display Domination Graphs', 'true'),
(55, 'Match Pages', 'Display Match Report Title', 'true'),
(56, 'Player Pages', 'Display Summary', 'true'),
(57, 'Player Pages', 'Display Gametype Stats', 'true'),
(58, 'Player Pages', 'Display Capture The Flag Summary', 'true'),
(59, 'Player Pages', 'Display Assault & Domination', 'true'),
(60, 'Player Pages', 'Display Frag Summary', 'true'),
(61, 'Player Pages', 'Display Special Events', 'true'),
(62, 'Player Pages', 'Display Weapon Stats', 'true'),
(63, 'Player Pages', 'Display Pickup History', 'true'),
(64, 'Player Pages', 'Display Ping History Graph', 'true'),
(65, 'Player Pages', 'Display Recent Activity Graph', 'true'),
(66, 'Player Pages', 'Display Recent Matches', 'true'),
(67, 'Player Pages', 'Default Recent Matches Display', '1'),
(68, 'Player Pages', 'Default Weapon Display', '1'),
(69, 'Player Pages', 'Recent Matches Per Page', '100'),
(70, 'Rankings', 'Rankings Per Gametype (Main)', '25'),
(71, 'Rankings', 'Rankings Per Page (Individual)', '50');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `nstats_site_settings`
--
ALTER TABLE `nstats_site_settings`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `nstats_site_settings`
--
ALTER TABLE `nstats_site_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
