-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 03, 2021 at 08:27 PM
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
(20, 'Players Page', 'Default Sort Type', 'name'),
(21, 'Players Page', 'Default Order', 'DESC'),
(22, 'Players Page', 'Default Display Per Page', '75'),
(23, 'Players Page', 'Default Display Type', '0'),
(24, 'Home', 'Display Recent Players', 'true'),
(25, 'Navigation', 'Display Admin', 'true'),
(26, 'Matches Page', 'Default Gametype', '0'),
(27, 'Matches Page', 'Default Display Per Page', '75'),
(28, 'Matches Page', 'Default Display Type', '0'),
(29, 'Home', 'Recent Matches Display Type', '1'),
(30, 'Home', 'Recent Matches To Display', '10'),
(31, 'Records Page', 'Default Record Type', 'Player'),
(33, 'Records Page', 'Default Per Page', '75'),
(34, 'Maps Page', 'Default Display Per Page', '75'),
(35, 'Maps Page', 'Default Display Type', '1'),
(36, 'Match Pages', 'Display Summary', 'false'),
(37, 'Match Pages', 'Display Screenshot', 'true'),
(38, 'Match Pages', 'Display Frag Summary', 'false'),
(39, 'Match Pages', 'Display Frags Graphs', 'false'),
(40, 'Match Pages', 'Display Capture The Flag Summary', 'false'),
(41, 'Match Pages', 'Display Capture The Flag Graphs', 'false'),
(42, 'Match Pages', 'Display Capture The Flag Caps', 'false'),
(43, 'Match Pages', 'Display Special Events', 'false'),
(44, 'Match Pages', 'Display Kills Match Up', 'false'),
(45, 'Match Pages', 'Display Powerup Control', 'false'),
(46, 'Match Pages', 'Display Weapon Statistics', 'false'),
(47, 'Match Pages', 'Display Pickup Summary', 'false'),
(48, 'Match Pages', 'Display Player Ping Graph', 'false'),
(49, 'Match Pages', 'Display Players Connected to Server Graph', 'false'),
(50, 'Match Pages', 'Display Team Changes', 'false'),
(51, 'Match Pages', 'Display Server Settings', 'false'),
(52, 'Match Pages', 'Display Assault Summary', 'false'),
(53, 'Match Pages', 'Display Domination Summary', 'false'),
(54, 'Match Pages', 'Display Domination Graphs', 'false'),
(55, 'Match Pages', 'Display Match Report Title', 'false');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
