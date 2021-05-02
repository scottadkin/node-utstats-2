-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 02, 2021 at 11:39 PM
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
(34, 'Maps Page', 'Default Display Per Page', '25'),
(35, 'Maps Page', 'Default Display Type', '0');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
