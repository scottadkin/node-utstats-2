import Message from "./api/message.js";
import { existsSync, writeFileSync } from "fs";
import { DEFAULT_MIN_DATE, generateRandomString } from "./api/generic.mjs";
import mysql from "mysql2/promise";
import config from "./config.json" with {"type": "json"};
import { DEFAULT_PAGE_SETTINGS } from "./api/sitesettings.js";
import { DEFAULT_RANKING_VALUES } from "./api/rankings.js";
import { DEFAULT_ITEMS } from "./api/items.js";


let mysqlObject = mysql.createPool({
    "host": config.mysql.host,
    "user": config.mysql.user,
    "password": config.mysql.password,
});


const queries = [
    `CREATE DATABASE IF NOT EXISTS ${config.mysql.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_assault_match_objectives (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        map int(11) NOT NULL,
        timestamp float NOT NULL,
        obj_id int(11) NOT NULL,
        player int(11) NOT NULL,
        bfinal int(11) NOT NULL,
        PRIMARY KEY (id))
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_assault_objects (
        id int(11) NOT NULL AUTO_INCREMENT,
        map int(11) NOT NULL,
        obj_order int(11) NOT NULL,
        name varchar(100) NOT NULL,
        obj_id int(11) NOT NULL,
        matches int(11) NOT NULL,
        taken int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_countries (
        id int(11) NOT NULL AUTO_INCREMENT,
        code varchar(2) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        total int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_caps (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        gametype_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        cap_team int NOT NULL,
        flag_team int NOT NULL,
        grab_time float NOT NULL,
        grab_player int NOT NULL,
        cap_time float NOT NULL,
        cap_player int NOT NULL,
        travel_time float NOT NULL,
        carry_time float NOT NULL,
        carry_time_percent float NOT NULL,
        drop_time float NOT NULL,
        drop_time_percent float NOT NULL,
        total_drops int NOT NULL,
        total_pickups int NOT NULL,
        total_covers int NOT NULL,
        total_seals int NOT NULL,
        total_assists int NOT NULL,
        total_self_covers int NOT NULL,
        total_deaths int NOT NULL,
        total_suicides int NOT NULL,
        team_0_kills int NOT NULL,
        team_1_kills int NOT NULL,
        team_2_kills int NOT NULL,
        team_3_kills int NOT NULL,
        team_0_suicides int NOT NULL,
        team_1_suicides int NOT NULL,
        team_2_suicides int NOT NULL,
        team_3_suicides int NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ctf_assists (
      id int NOT NULL AUTO_INCREMENT,
      match_id int NOT NULL,
      match_date DATETIME NOT NULL,
      map_id int NOT NULL,
      cap_id int NOT NULL,
      player_id int NOT NULL,
      pickup_time float NOT NULL,
      dropped_time float NOT NULL,
      carry_time float NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_covers (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        cap_id int NOT NULL,
        timestamp float NOT NULL,
        killer_id int NOT NULL,
        killer_team int NOT NULL,
        victim_id int NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_self_covers (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        cap_id int NOT NULL,
        timestamp float NOT NULL,
        killer_id int NOT NULL,
        killer_team int NOT NULL,
        victim_id int NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_seals (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        cap_id int NOT NULL,
        timestamp float NOT NULL,
        killer_id int NOT NULL,
        victim_id int NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_carry_times (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        cap_id int NOT NULL,
        flag_team int NOT NULL,
        player_id int NOT NULL,
        player_team int NOT NULL,
        start_time float NOT NULL,
        end_time float NOT NULL,
        carry_time float NOT NULL,
        carry_percent float NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_returns (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        flag_team int NOT NULL,
        grab_time float NOT NULL,
        grab_player int NOT NULL,
        return_time float NOT NULL,
        return_player int NOT NULL,
        return_string VARCHAR(60) NOT NULL,
        distance_to_cap float NOT NULL,
        pos_x float NOT NULL,
        pos_y float NOT NULL,
        pos_z float NOT NULL,
        travel_time float NOT NULL,
        carry_time float NOT NULL,
        carry_time_percent float NOT NULL,
        drop_time float NOT NULL,
        drop_time_percent float NOT NULL,
        total_drops int NOT NULL,
        total_pickups int NOT NULL,
        total_covers int NOT NULL,
        total_seals int NOT NULL,
        total_self_covers int NOT NULL,
        total_deaths int NOT NULL,
        total_suicides int NOT NULL,
        team_0_kills int NOT NULL,
        team_1_kills int NOT NULL,
        team_2_kills int NOT NULL,
        team_3_kills int NOT NULL,
        team_0_suicides int NOT NULL,
        team_1_suicides int NOT NULL,
        team_2_suicides int NOT NULL,
        team_3_suicides int NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_flag_deaths (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        timestamp float NOT NULL,
        cap_id int NOT NULL,
        killer_id int NOT NULL,
        killer_team int NOT NULL,
        victim_id int NOT NULL,
        victim_team int NOT NULL,
        kill_distance float NOT NULL,
        distance_to_cap float NOT NULL,
        distance_to_enemy_base float NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_flag_drops (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        timestamp float NOT NULL,
        cap_id int NOT NULL,
        flag_team int NOT NULL,
        player_id int NOT NULL,
        player_team int NOT NULL,
        distance_to_cap float NOT NULL,
        position_x float NOT NULL,
        position_y float NOT NULL,
        position_z float NOT NULL,
        time_dropped float NOT NULL,
        PRIMARY KEY(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_ctf_flag_pickups (
        id int NOT NULL AUTO_INCREMENT,
        match_id int NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int NOT NULL,
        cap_id int NOT NULL,
        timestamp float NOT NULL,
        player_id int NOT NULL,
        player_team int NOT NULL,
        flag_team int NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS nstats_ctf_cr_kills (
          id int NOT NULL AUTO_INCREMENT,
          match_id int NOT NULL,
          match_date DATETIME NOT NULL,
          map_id int NOT NULL,
          cap_id int NOT NULL,
          event_type int NOT NULL,
          timestamp float NOT NULL,
          player_id int NOT NULL,
          player_team int NOT NULL,
          total_events int NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ctf_events (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        event varchar(30) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_control_points (
        id int(11) NOT NULL AUTO_INCREMENT,
        map int(11) NOT NULL,
        name varchar(100) NOT NULL,
        captured int(11) NOT NULL,
        matches int(11) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_match_caps (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        time float NOT NULL,
        player int(11) NOT NULL,
        point int(11) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_match_control_points (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        map int(11) NOT NULL,
        name varchar(100) NOT NULL,
        captured int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_match_player_score (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        score int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_faces (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        uses int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ftp (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        host varchar(250) NOT NULL,
        port int(11) NOT NULL,
        user varchar(50) NOT NULL,
        password varchar(50) NOT NULL,
        target_folder varchar(250) NOT NULL,
        delete_after_import tinyint(1) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        total_imports int(11) NOT NULL,
        delete_tmp_files int(1) NOT NULL,
        total_logs_imported int(11) NOT NULL,
        ignore_bots int(1) NOT NULL,
        ignore_duplicates int(1) NOT NULL,
        min_players int(2) NOT NULL,
        min_playtime int(11) NOT NULL,
        sftp int(1) NOT NULL,
        import_ace INT(1) NOT NULL,
        delete_ace_logs int(1) NOT NULL,
        delete_ace_screenshots int(1) NOT NULL,
        total_ace_kick_logs INT(1) NOT NULL,
        total_ace_join_logs INT(1) NOT NULL,
        total_ace_screenshots INT(1) NOT NULL,
        enabled INT(1) NOT NULL,
        use_ace_player_hwid INT(1) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_logs_folder (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        total_imports int(11) NOT NULL,
        total_logs_imported int(11) NOT NULL,
        ignore_bots int(1) NOT NULL,
        ignore_duplicates int(1) NOT NULL,
        min_players int(2) NOT NULL,
        min_playtime int(11) NOT NULL,
        import_ace INT(1) NOT NULL,
        total_ace_kick_logs INT(1) NOT NULL,
        total_ace_join_logs INT(1) NOT NULL,
        total_ace_screenshots INT(1) NOT NULL,
        use_ace_player_hwid INT(1) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS nstats_gametypes (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL,
        auto_merge_id int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_headshots (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        killer int(11) NOT NULL,
        victim int(11) NOT NULL,
        distance float NOT NULL,
        killer_team int(11) NOT NULL,
        victim_team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_items (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        display_name varchar(100) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        uses int(11) NOT NULL,
        matches int(11) NOT NULL,
        type int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_items_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        item int(11) NOT NULL,
        uses int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
    `CREATE TABLE IF NOT EXISTS nstats_items_player (
        id int(11) NOT NULL AUTO_INCREMENT,
        player int(11) NOT NULL,
        item int(11) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        uses int(11) NOT NULL,
        matches int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_kills (
        id BIGINT NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        killer int(11) NOT NULL,
        killer_team int(11) NOT NULL,
        victim int(11) NOT NULL,
        victim_team int(11) NOT NULL,
        killer_weapon int(11) NOT NULL,
        victim_weapon int(11) NOT NULL,
        distance float NOT NULL,
        killer_x float NOT NULL,
        killer_y float NOT NULL,
        killer_z float NOT NULL,
        victim_x float NOT NULL,
        victim_y float NOT NULL,
        victim_z float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_logs (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        imported DATETIME NOT NULL,
        match_id int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_maps (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        title varchar(100) NOT NULL,
        author varchar(100) NOT NULL,
        ideal_player_count varchar(100) NOT NULL,
        level_enter_text varchar(100) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL,
        import_as_id int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_maps_flags (
        id int(11) NOT NULL AUTO_INCREMENT,
        map int(11) NOT NULL,
        team int(11) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_map_spawns (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(50) NOT NULL,
        map int(11) NOT NULL,
        x double NOT NULL,
        y double NOT NULL,
        z double NOT NULL,
        spawns int(11) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_matches (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_hash varchar(32) NOT NULL,
        date DATETIME NOT NULL,
        server int(11) NOT NULL,
        gametype int(11) NOT NULL,
        map int(11) NOT NULL,
        version int(11) NOT NULL,
        min_version int(11) NOT NULL,
        admin varchar(50) NOT NULL,
        email varchar(100) NOT NULL,
        region int(11) NOT NULL,
        motd text NOT NULL,
        mutators text NOT NULL,
        playtime float NOT NULL,
        end_type varchar(50) NOT NULL,
        start float NOT NULL,
        end float NOT NULL,
        insta int(11) NOT NULL,
        team_game int(11) NOT NULL,
        game_speed int(11) NOT NULL,
        hardcore int(11) NOT NULL,
        tournament int(11) NOT NULL,
        air_control float NOT NULL,
        use_translocator int(11) NOT NULL,
        friendly_fire_scale float NOT NULL,
        net_mode varchar(100) NOT NULL,
        max_spectators int(11) NOT NULL,
        max_players int(11) NOT NULL,
        total_teams int(11) NOT NULL,
        players int(11) NOT NULL,
        time_limit int(11) NOT NULL,
        target_score int(11) NOT NULL,
        dm_winner int(11) NOT NULL,
        dm_score int(11) NOT NULL,
        team_score_0 float NOT NULL,
        team_score_1 float NOT NULL,
        team_score_2 float NOT NULL,
        team_score_3 float NOT NULL,
        attacking_team int(11) NOT NULL,
        assault_caps int(11) NOT NULL,
        dom_caps int(11) NOT NULL,
        mh_kills int(11) NOT NULL,
        mh int(11) NOT NULL,
        views int(11) NOT NULL,
        ping_min_average float NOT NULL,
        ping_average_average float NOT NULL,
        ping_max_average float NOT NULL,
        amp_kills int(11) NOT NULL,
        amp_kills_team_0 int(11) NOT NULL,
        amp_kills_team_1 int(11) NOT NULL,
        amp_kills_team_2 int(11) NOT NULL,
        amp_kills_team_3 int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_match_connections (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        event tinyint(4) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_match_pings (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp int(11) NOT NULL,
        player int(11) NOT NULL,
        ping int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_match_player_score (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        score int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
    `CREATE TABLE IF NOT EXISTS nstats_match_team_changes (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
    `CREATE TABLE IF NOT EXISTS nstats_monsters (
        id int(11) NOT NULL AUTO_INCREMENT,
        class_name varchar(150) COLLATE utf8_unicode_ci NOT NULL,
        display_name varchar(50) COLLATE utf8_unicode_ci NOT NULL,
        matches int(11) NOT NULL,
        deaths int(11) NOT NULL,
        kills int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monsters_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        monster int(11) NOT NULL,
        deaths int(11) NOT NULL,
        kills int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monsters_player_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        monster int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monsters_player_totals (
        id int(11) NOT NULL AUTO_INCREMENT,
        player int(11) NOT NULL,
        monster int(11) NOT NULL,
        matches int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monster_kills (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        monster int(11) NOT NULL,
        player int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_nexgen_stats_viewer (
        id int(11) NOT NULL AUTO_INCREMENT,
        title varchar(100) COLLATE utf8_unicode_ci NOT NULL,
        type int(11) NOT NULL,
        gametype int(11) NOT NULL,
        players int(11) NOT NULL,
        position int(11) NOT NULL,
        enabled tinyint(1) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_matches (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        match_date DATETIME NOT NULL,
        map_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        hwid varchar(32) NOT NULL,
        bot tinyint(1) NOT NULL,
        spectator tinyint(1) NOT NULL,
        played tinyint(1) NOT NULL,
        ip varchar(50) NOT NULL,
        country varchar(5) NOT NULL,
        face int(11) NOT NULL,
        voice int(11) NOT NULL,
        gametype int(11) NOT NULL,
        winner int(11) NOT NULL,
        draw int(11) NOT NULL,
        playtime float NOT NULL,
        team_0_playtime float NOT NULL,
        team_1_playtime float NOT NULL,
        team_2_playtime float NOT NULL,
        team_3_playtime float NOT NULL,
        spec_playtime float NOT NULL,
        team int(1) NOT NULL,
        first_blood int(1) NOT NULL,
        frags int(11) NOT NULL,
        score int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        spawn_kills int(11) NOT NULL,
        efficiency float NOT NULL,
        multi_1 int(11) NOT NULL,
        multi_2 int(11) NOT NULL,
        multi_3 int(11) NOT NULL,
        multi_4 int(11) NOT NULL,
        multi_5 int(11) NOT NULL,
        multi_6 int(11) NOT NULL,
        multi_7 int(11) NOT NULL,
        multi_best int(11) NOT NULL,
        spree_1 int(11) NOT NULL,
        spree_2 int(11) NOT NULL,
        spree_3 int(11) NOT NULL,
        spree_4 int(11) NOT NULL,
        spree_5 int(11) NOT NULL,
        spree_6 int(11) NOT NULL,
        spree_7 int(11) NOT NULL,
        spree_best int(11) NOT NULL,
        best_spawn_kill_spree int(11) NOT NULL,
        assault_objectives int(11) NOT NULL,
        dom_caps int(11) NOT NULL,
        dom_caps_best_life int(11) NOT NULL,
        ping_min int(11) NOT NULL,
        ping_average int(11) NOT NULL,
        ping_max int(11) NOT NULL,
        accuracy float NOT NULL,
        shortest_kill_distance float NOT NULL,
        average_kill_distance float NOT NULL,
        longest_kill_distance float NOT NULL,
        k_distance_normal int(11) NOT NULL,
        k_distance_long int(11) NOT NULL,
        k_distance_uber int(11) NOT NULL,
        headshots int(11) NOT NULL,
        shield_belt int(11) NOT NULL,
        amp int(11) NOT NULL,
        amp_time float NOT NULL,
        invisibility int(11) NOT NULL,
        invisibility_time float NOT NULL,
        pads int(11) NOT NULL,
        armor int(11) NOT NULL,
        boots int(11) NOT NULL,
        super_health int(11) NOT NULL,
        mh_kills int(11) NOT NULL,
        mh_kills_best_life int(11) NOT NULL,
        views int(11) NOT NULL,
        mh_deaths int(11) NOT NULL,
        telefrag_kills int(11) NOT NULL,
        telefrag_deaths int(11) NOT NULL,
        telefrag_best_spree int(11) NOT NULL,
        telefrag_best_multi int(11) NOT NULL,
        tele_disc_kills int(11) NOT NULL,
        tele_disc_deaths int(11) NOT NULL,
        tele_disc_best_spree int(11) NOT NULL,
        tele_disc_best_multi int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_totals (
        id int(11) NOT NULL AUTO_INCREMENT,
        hwid varchar(32) NOT NULL,
        name varchar(30) NOT NULL,
        player_id int(11) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        ip varchar(50) NOT NULL,
        country varchar(2) NOT NULL,
        face int(100) NOT NULL,
        voice int(11) NOT NULL,
        gametype int(11) NOT NULL,
        map int(11) NOT NULL,
        matches int(11) NOT NULL,
        wins int(11) NOT NULL,
        losses int(11) NOT NULL,
        draws int(11) NOT NULL,
        winrate float NOT NULL,
        playtime double NOT NULL,
        team_0_playtime float NOT NULL,
        team_1_playtime float NOT NULL,
        team_2_playtime float NOT NULL,
        team_3_playtime float NOT NULL,
        spec_playtime float NOT NULL,
        first_bloods int(11) NOT NULL,
        frags int(11) NOT NULL,
        score int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        spawn_kills int(11) NOT NULL,
        efficiency float NOT NULL,
        multi_1 int(11) NOT NULL,
        multi_2 int(11) NOT NULL,
        multi_3 int(11) NOT NULL,
        multi_4 int(11) NOT NULL,
        multi_5 int(11) NOT NULL,
        multi_6 int(11) NOT NULL,
        multi_7 int(11) NOT NULL,
        multi_best int(11) NOT NULL,
        spree_1 int(11) NOT NULL,
        spree_2 int(11) NOT NULL,
        spree_3 int(11) NOT NULL,
        spree_4 int(11) NOT NULL,
        spree_5 int(11) NOT NULL,
        spree_6 int(11) NOT NULL,
        spree_7 int(11) NOT NULL,
        spree_best int(11) NOT NULL,
        fastest_kill float NOT NULL,
        slowest_kill float NOT NULL,
        best_spawn_kill_spree int(11) NOT NULL,
        assault_objectives int(11) NOT NULL,
        dom_caps int(11) NOT NULL,
        dom_caps_best int(11) NOT NULL,
        dom_caps_best_life int(11) NOT NULL,
        accuracy float NOT NULL,
        k_distance_normal int(11) NOT NULL,
        k_distance_long int(11) NOT NULL,
        k_distance_uber int(11) NOT NULL,
        headshots int(11) NOT NULL,
        shield_belt int(11) NOT NULL,
        amp int(11) NOT NULL,
        amp_time float NOT NULL,
        invisibility int(11) NOT NULL,
        invisibility_time float NOT NULL,
        pads int(11) NOT NULL,
        armor int(11) NOT NULL,
        boots int(11) NOT NULL,
        super_health int(11) NOT NULL,
        mh_kills int(11) NOT NULL,
        mh_kills_best_life int(11) NOT NULL,
        mh_kills_best int(11) NOT NULL,
        views int(11) NOT NULL,
        mh_deaths int(11) NOT NULL,
        mh_deaths_worst int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_weapon_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        gametype_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        weapon_id int(11) NOT NULL,
        kills int(11) NOT NULL,
        best_kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        best_team_kills int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint(11) NOT NULL,
        efficiency float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_weapon_totals (
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        gametype int(11) NOT NULL,
        playtime FLOAT NOT NULL,
        weapon int(11) NOT NULL,
        kills int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        efficiency float NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint NOT NULL,
        matches int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS nstats_player_weapon_best (
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        gametype_id int(11) NOT NULL,
        weapon_id int(11) NOT NULL,
        kills int(11) NOT NULL,
        kills_best_life int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        team_kills_best_life int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        efficiency int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ranking_player_current (
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id int(11) NOT NULL,
        gametype int(11) NOT NULL,
        matches int(11) NOT NULL,
        playtime float NOT NULL,
        ranking Decimal(10,4) NOT NULL,
        ranking_change Decimal(10,4) NOT NULL,
        last_active DATETIME NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ranking_player_history (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        gametype int(11) NOT NULL,
        ranking Decimal(10,4) NOT NULL,
        match_ranking Decimal(10,4) NOT NULL,
        ranking_change Decimal(10,4) NOT NULL,
        match_ranking_change Decimal(10,4) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ranking_values (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(30) NOT NULL,
        display_name varchar(75) NOT NULL,
        description varchar(250) NOT NULL,
        value float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_servers (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        ip varchar(100) NOT NULL,
        port int(5) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL,
        display_name varchar(100) NOT NULL,
        display_address varchar(100) NOT NULL,
        password varchar(100) NOT NULL,
        country varchar(2) NOT NULL,
        last_match_id INT(11) NOT NULL,
        last_map_id INT(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_sessions (
        id int(11) NOT NULL AUTO_INCREMENT,
        date DATETIME NOT NULL,
        user int(11) NOT NULL,
        hash varchar(64) NOT NULL,
        created DATETIME NOT NULL,
        expires DATETIME NOT NULL,
        login_ip varchar(50) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_site_settings (
        id int(11) NOT NULL AUTO_INCREMENT,
        category varchar(50) NOT NULL,
        value_type varchar(100) NOT NULL,
        name varchar(100) NOT NULL,
        value varchar(100) NOT NULL,
        page_order INT(11) NOT NULL,
        moveable tinyint NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_sprees (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        kills int(11) NOT NULL,
        start_timestamp float NOT NULL,
        end_timestamp float NOT NULL,
        total_time float NOT NULL,
        killer int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_users (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(20) NOT NULL,
        password varchar(64) NOT NULL,
        joined DATETIME NOT NULL,
        activated int(1) NOT NULL,
        logins int(11) NOT NULL,
        admin int(11) NOT NULL,
        last_login DATETIME NOT NULL,
        last_active DATETIME NOT NULL,
        last_ip varchar(50) NOT NULL,
        banned int(11) NOT NULL,
        upload_images int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_voices (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        uses int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_weapons (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        matches int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint(20) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_winrates (
        id int(11) NOT NULL AUTO_INCREMENT,
        date DATETIME NOT NULL,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        gametype int(11) NOT NULL,
        map int(11) NOT NULL,
        match_result int(11) NOT NULL,
        matches int(11) NOT NULL,
        wins int(11) NOT NULL,
        draws int(11) NOT NULL,
        losses int(11) NOT NULL,
        winrate float NOT NULL,
        current_win_streak int(11) NOT NULL,
        current_draw_streak int(11) NOT NULL,
        current_lose_streak int(11) NOT NULL,
        max_win_streak int(11) NOT NULL,
        max_draw_streak int(11) NOT NULL,
        max_lose_streak int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_winrates_latest (
        id int(11) NOT NULL AUTO_INCREMENT,
        date DATETIME NOT NULL,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        gametype int(11) NOT NULL,
        map int(11) NOT NULL,
        matches int(11) NOT NULL,
        wins int(11) NOT NULL,
        draws int(11) NOT NULL,
        losses int(11) NOT NULL,
        winrate float NOT NULL,
        current_win_streak int(11) NOT NULL,
        current_draw_streak int(11) NOT NULL,
        current_lose_streak int(11) NOT NULL,
        max_win_streak int(11) NOT NULL,
        max_draw_streak int(11) NOT NULL,
        max_lose_streak int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_hits (
        id int(11) NOT NULL AUTO_INCREMENT,
        ip varchar(50) NOT NULL,
        date DATETIME NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_visitors (
          id int(11) NOT NULL AUTO_INCREMENT,
          ip varchar(50) NOT NULL,
          first DATETIME NOT NULL,
          last DATETIME NOT NULL,
          total int(11) NOT NULL,
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_visitors_countries (
        id int(11) NOT NULL AUTO_INCREMENT,
        code varchar(2) NOT NULL,
        country varchar(100) NOT NULL,
        first DATETIME NOT NULL,
        last DATETIME NOT NULL,
        total int(11) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_user_agents (
          id int(11) NOT NULL AUTO_INCREMENT,
          system_name varchar(100) NOT NULL,
          browser varchar(100) NOT NULL,
          first DATETIME NOT NULL,
          last DATETIME NOT NULL,
          total int(11) NOT NULL,
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


    `CREATE TABLE IF NOT EXISTS nstats_ace_joins (
        id int(11) NOT NULL AUTO_INCREMENT,
        log_file varchar(255) NOT NULL,
        ace_version varchar(50) NOT NULL,
        timestamp DATETIME NOT NULL,
        player varchar(30) NOT NULL,
        ip varchar(50) NOT NULL,
        country varchar(2) NOT NULL,
        os varchar(250) NOT NULL,
        mac1 varchar(32) NOT NULL,
        mac2 varchar(32) NOT NULL,
        hwid varchar(32) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_ace_kicks (
        id int(11) NOT NULL AUTO_INCREMENT,
        file varchar(255) NOT NULL,
        raw_data LONGTEXT NOT NULL,
        name varchar(30) NOT NULL,
        ace_version varchar(20) NOT NULL,
        ip varchar(50) NOT NULL,
        country varchar(2) NOT NULL,
        os varchar(100) NOT NULL,
        cpu varchar(100) NOT NULL,
        cpu_speed decimal(10,5) NOT NULL,
        nic_desc varchar(100) NOT NULL,
        mac1 varchar(32) NOT NULL,
        mac2 varchar(32) NOT NULL,
        hwid varchar(32) NOT NULL,
        game_version varchar(100) NOT NULL,
        renderer varchar(100) NOT NULL,
        sound_device varchar(100) NOT NULL,
        command_line varchar(255) NOT NULL,
        timestamp int(11) NOT NULL,
        kick_reason varchar(100) NOT NULL,
        package_name varchar(100) NOT NULL,
        package_path varchar(100) NOT NULL,
        package_size int(11) NOT NULL,
        package_hash varchar(32) NOT NULL,
        package_version varchar(100) NOT NULL,
        screenshot_file varchar(255) NOT NULL,
        screenshot_status varchar(100) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_ace_players (
          id int(11) NOT NULL AUTO_INCREMENT,
          name varchar(30) NOT NULL,
          ip varchar(50) NOT NULL,
          country varchar(2) NOT NULL,
          mac1 varchar(32) NOT NULL,
          mac2 varchar(32) NOT NULL,
          hwid varchar(32) NOT NULL,
          first DATETIME NOT NULL,
          last DATETIME NOT NULL,
          times_connected int(11) NOT NULL,
          times_kicked int(11) NOT NULL,
          last_kick DATETIME NOT NULL,
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_ace_sshot_requests (
          id int(11) NOT NULL AUTO_INCREMENT,
          file varchar(255) NOT NULL,
          raw_data LONGTEXT NOT NULL,
          player varchar(30) NOT NULL,
          ip varchar(50) NOT NULL,
          country varchar(2) NOT NULL,
          ace_version varchar(10) NOT NULL,
          os varchar(255) NOT NULL,
          cpu varchar(255) NOT NULL,
          cpu_speed decimal(10,5) NOT NULL,
          nic_desc varchar(255) NOT NULL,
          mac1 varchar(32) NOT NULL,
          mac2 varchar(32) NOT NULL,
          hwid varchar(32) NOT NULL,
          game_version varchar(100) NOT NULL,
          renderer varchar(255) NOT NULL,
          sound_device varchar(255) NOT NULL,
          command_line varchar(255) NOT NULL,
          timestamp DATETIME NOT NULL,
          admin_name varchar(30) NOT NULL,
          screenshot_file varchar(255) NOT NULL,
          screenshot_status varchar(50) NOT NULL,
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

          `CREATE TABLE IF NOT EXISTS nstats_ace_screenshots (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            date_downloaded DATETIME NOT NULL,
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


            `CREATE TABLE IF NOT EXISTS nstats_match_combogib (
              id int(11) NOT NULL AUTO_INCREMENT,
              player_id int(11) NOT NULL,
              gametype_id int(11) NOT NULL,
              match_id int(11) NOT NULL,
              map_id int(11) NOT NULL,
              playtime float NOT NULL,
              primary_kills int(11) NOT NULL,
              primary_deaths int(11) NOT NULL,
              primary_efficiency float NOT NULL,
              primary_kpm float NOT NULL,
              shockball_kills int(11) NOT NULL,
              shockball_deaths int(11) NOT NULL,
              shockball_efficiency float NOT NULL,
              shockball_kpm float NOT NULL,
              combo_kills int(11) NOT NULL,
              combo_deaths int(11) NOT NULL,
              combo_efficiency float NOT NULL,
              combo_kpm float NOT NULL,
              insane_kills INT(11) NOT NULL,
              insane_deaths INT(11) NOT NULL,
              insane_efficiency float NOT NULL,
              insane_kpm float NOT NULL,
              best_single_combo int(11) NOT NULL,
              best_single_shockball int(11) NOT NULL,
              best_single_insane int(11) NOT NULL,
              best_primary_spree int(11) NOT NULL,
              best_shockball_spree int(11) NOT NULL,
              best_combo_spree int(11) NOT NULL,
              best_insane_spree int(11) NOT NULL,
              PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

              `CREATE TABLE IF NOT EXISTS nstats_map_combogib (
                  id int(11) NOT NULL AUTO_INCREMENT,
                  map_id int(11) NOT NULL,
                  gametype_id int(11) NOT NULL,
                  matches int(11) NOT NULL,
                  playtime float NOT NULL,
                  primary_kills int(11) NOT NULL,
                  primary_kpm float NOT NULL,
                  shockball_kills int(11) NOT NULL,
                  shockball_kpm float NOT NULL,
                  combo_kills int(11) NOT NULL,
                  combo_kpm float NOT NULL,
                  insane_kills INT(11) NOT NULL,
                  insane_kpm float NOT NULL,
                  best_single_combo int(11) NOT NULL,
                  best_single_combo_player_id int(11) NOT NULL,
                  best_single_combo_match_id int(11) NOT NULL,
                  best_single_shockball int(11) NOT NULL,
                  best_single_shockball_player_id int(11) NOT NULL,
                  best_single_shockball_match_id int(11) NOT NULL,
                  best_single_insane int(11) NOT NULL,
                  best_single_insane_player_id int(11) NOT NULL,
                  best_single_insane_match_id int(11) NOT NULL,
                  best_primary_spree int(11) NOT NULL,
                  best_primary_spree_player_id int(11) NOT NULL,
                  best_primary_spree_match_id int(11) NOT NULL,
                  best_shockball_spree int(11) NOT NULL,
                  best_shockball_spree_player_id int(11) NOT NULL,
                  best_shockball_spree_match_id int(11) NOT NULL,
                  best_combo_spree int(11) NOT NULL,
                  best_combo_spree_player_id int(11) NOT NULL,
                  best_combo_spree_match_id int(11) NOT NULL,
                  best_insane_spree int(11) NOT NULL,
                  best_insane_spree_player_id int(11) NOT NULL,
                  best_insane_spree_match_id int(11) NOT NULL,
                  max_combo_kills int(11) NOT NULL,
                  max_combo_kills_player_id int(11) NOT NULL,
                  max_combo_kills_match_id int(11) NOT NULL,
                  max_insane_kills int(11) NOT NULL,
                  max_insane_kills_player_id int(11) NOT NULL,
                  max_insane_kills_match_id int(11) NOT NULL,
                  max_shockball_kills int(11) NOT NULL,
                  max_shockball_kills_player_id int(11) NOT NULL,
                  max_shockball_kills_match_id int(11) NOT NULL,
                  max_primary_kills int(11) NOT NULL,
                  max_primary_kills_player_id int(11) NOT NULL,
                  max_primary_kills_match_id int(11) NOT NULL,
  
                  PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  
                  `CREATE TABLE IF NOT EXISTS nstats_player_combogib (
                      id int(11) NOT NULL AUTO_INCREMENT,
                      player_id int(11) NOT NULL,
                      gametype_id int(11) NOT NULL,
                      map_id int(11) NOT NULL,
                      total_matches int(11) NOT NULL,
                      playtime float NOT NULL,
                      combo_kills int(11) NOT NULL,
                      combo_deaths int(11) NOT NULL,
                      combo_efficiency FLOAT NOT NULL,
                      combo_kpm float NOT NULL,
                      insane_kills INT(11) NOT NULL,
                      insane_deaths INT(11) NOT NULL,
                      insane_efficiency FLOAT NOT NULL,
                      insane_kpm float NOT NULL,
                      shockball_kills int(11) NOT NULL,
                      shockball_deaths int(11) NOT NULL,
                      shockball_efficiency FLOAT NOT NULL,
                      shockball_kpm float NOT NULL,
                      primary_kills int(11) NOT NULL,
                      primary_deaths int(11) NOT NULL,
                      primary_efficiency FLOAT NOT NULL,
                      primary_kpm float NOT NULL,      
  
                      best_single_combo int(11) NOT NULL,
                      best_single_combo_match_id int(11) NOT NULL,
                      best_single_insane int(11) NOT NULL,
                      best_single_insane_match_id int(11) NOT NULL,
                      best_single_shockball int(11) NOT NULL,
                      best_single_shockball_match_id int(11) NOT NULL,
                      
                      max_combo_kills int(11) NOT NULL,
                      max_combo_kills_match_id int(11) NOT NULL,
                      max_insane_kills int(11) NOT NULL,
                      max_insane_kills_match_id int(11) NOT NULL,
                      max_shockball_kills int(11) NOT NULL,
                      max_shockball_kills_match_id int(11) NOT NULL,
                      max_primary_kills int(11) NOT NULL,
                      max_primary_kills_match_id int(11) NOT NULL,
  
                      best_combo_spree int(11) NOT NULL,
                      best_combo_spree_match_id int(11) NOT NULL,
  
                      best_insane_spree int(11) NOT NULL,
                      best_insane_spree_match_id int(11) NOT NULL,
  
                      best_shockball_spree int(11) NOT NULL,
                      best_shockball_spree_match_id int(11) NOT NULL,
  
                      best_primary_spree int(11) NOT NULL,
                      best_primary_spree_match_id int(11) NOT NULL,
      
                      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `INSERT INTO nstats_logs_folder VALUES(NULL, 'Logs Folder',"${DEFAULT_MIN_DATE}","1999-11-30",0,0,0,0,0,0,0,0,0,0,0)`,

    `CREATE TABLE IF NOT EXISTS nstats_player_ctf_match (
      id int NOT NULL AUTO_INCREMENT,
      player_id int NOT NULL,
      match_id int NOT NULL,
      gametype_id int NOT NULL,
      server_id int NOT NULL,
      map_id int NOT NULL,
      match_date DATETIME NOT NULL,
      playtime float NOT NULL,
      flag_assist INT(11) NOT NULL,
      flag_assist_best INT(11) NOT NULL,
      flag_return INT(11) NOT NULL, 
      flag_return_best INT(11) NOT NULL, 
      flag_return_base INT(11) NOT NULL, 
      flag_return_base_best INT(11) NOT NULL, 
      flag_return_mid INT(11) NOT NULL, 
      flag_return_mid_best INT(11) NOT NULL, 
      flag_return_enemy_base INT(11) NOT NULL, 
      flag_return_enemy_base_best INT(11) NOT NULL, 
      flag_return_save INT(11) NOT NULL, 
      flag_return_save_best INT(11) NOT NULL, 
      flag_dropped INT(11) NOT NULL, 
      flag_dropped_best INT(11) NOT NULL, 
      flag_kill INT(11) NOT NULL, 
      flag_kill_best INT(11) NOT NULL, 
      flag_suicide INT(11) NOT NULL, 
      flag_seal INT(11) NOT NULL, 
      flag_seal_best INT(11) NOT NULL, 
      flag_seal_pass INT(11) NOT NULL, 
      flag_seal_pass_best INT(11) NOT NULL, 
      flag_seal_fail INT(11) NOT NULL, 
      flag_seal_fail_best INT(11) NOT NULL, 
      best_single_seal INT(11) NOT NULL, 
      flag_cover INT(11) NOT NULL, 
      flag_cover_best INT(11) NOT NULL, 
      flag_cover_pass INT(11) NOT NULL, 
      flag_cover_pass_best INT(11) NOT NULL, 
      flag_cover_fail INT(11) NOT NULL, 
      flag_cover_fail_best INT(11) NOT NULL, 
      flag_cover_multi INT(11) NOT NULL,
      flag_cover_multi_best INT(11) NOT NULL,
      flag_cover_spree INT(11) NOT NULL,
      flag_cover_spree_best INT(11) NOT NULL,
      best_single_cover INT(11) NOT NULL,
      flag_capture INT(11) NOT NULL, 
      flag_capture_best INT(11) NOT NULL, 
      flag_carry_time float NOT NULL, 
      flag_carry_time_best float NOT NULL, 
      flag_taken INT(11) NOT NULL,
      flag_taken_best INT(11) NOT NULL,
      flag_pickup INT(11) NOT NULL,
      flag_pickup_best INT(11) NOT NULL,
      flag_self_cover INT(11) NOT NULL,
      flag_self_cover_best INT(11) NOT NULL,
      flag_self_cover_pass INT(11) NOT NULL,
      flag_self_cover_pass_best INT(11) NOT NULL,
      flag_self_cover_fail INT(11) NOT NULL,
      flag_self_cover_fail_best INT(11) NOT NULL,
      best_single_self_cover INT(11) NOT NULL,
      flag_solo_capture INT(11) NOT NULL,
      flag_solo_capture_best INT(11) NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


      `CREATE TABLE IF NOT EXISTS nstats_powerups (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        display_name varchar(100) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS  nstats_powerups_carry_times (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        match_date DATETIME NOT NULL,
        player_id int(11) NOT NULL,
        powerup_id int(11) NOT NULL,
        start_timestamp float NOT NULL,
        end_timestamp float NOT NULL,
        carry_time float NOT NULL,
        kills int(11) NOT NULL,
        end_reason int(1) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_powerups_player_match (
          id int NOT NULL AUTO_INCREMENT,
          match_id int NOT NULL,
          match_date DATETIME NOT NULL,
          map_id int NOT NULL,
          gametype_id int NOT NULL,
          player_id int NOT NULL,
          powerup_id int NOT NULL,
          times_used int NOT NULL,
          carry_time float NOT NULL,
          carry_time_best float NOT NULL,
          total_kills int NOT NULL,
          best_kills int NOT NULL,
          end_deaths int NOT NULL,
          end_suicides int NOT NULL,
          end_timeouts int NOT NULL,
          end_match_end int NOT NULL,
          carrier_kills int NOT NULL,
          carrier_kills_best int NOT NULL,
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

          `CREATE TABLE IF NOT EXISTS nstats_powerups_player_totals (
            id int NOT NULL AUTO_INCREMENT,
            player_id int NOT NULL,
            gametype_id int NOT NULL,
            total_matches int NOT NULL,
            total_playtime float NOT NULL,
            powerup_id int NOT NULL,
            times_used int NOT NULL,
            times_used_best int NOT NULL,
            carry_time float NOT NULL,
            carry_time_best float NOT NULL,
            total_kills int NOT NULL,
            best_kills int NOT NULL,
            best_kills_single_use int NOT NULL,
            end_deaths int NOT NULL,
            end_suicides int NOT NULL,
            end_timeouts int NOT NULL,
            end_match_end int NOT NULL,
            total_carrier_kills int NOT NULL,
            carrier_kills_best int NOT NULL,
            carrier_kills_single_life int NOT NULL,
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


            `CREATE TABLE IF NOT EXISTS nstats_player_ctf_totals (
              id int NOT NULL AUTO_INCREMENT,
              player_id int NOT NULL,
              gametype_id int NOT NULL,
              map_id int NOT NULL,
              total_matches int NOT NULL,      
              playtime float NOT NULL,
              flag_assist INT(11) NOT NULL,
              flag_return INT(11) NOT NULL, 
              flag_return_base INT(11) NOT NULL, 
              flag_return_mid INT(11) NOT NULL, 
              flag_return_enemy_base INT(11) NOT NULL, 
              flag_return_save INT(11) NOT NULL, 
              flag_dropped INT(11) NOT NULL, 
              flag_kill INT(11) NOT NULL, 
              flag_suicide INT(11) NOT NULL, 
              flag_seal INT(11) NOT NULL, 
              flag_seal_pass INT(11) NOT NULL, 
              flag_seal_fail INT(11) NOT NULL, 
              best_single_seal INT(11) NOT NULL, 
              flag_cover INT(11) NOT NULL, 
              flag_cover_pass INT(11) NOT NULL, 
              flag_cover_fail INT(11) NOT NULL, 
              flag_cover_multi INT(11) NOT NULL,
              flag_cover_spree INT(11) NOT NULL,
              best_single_cover INT(11) NOT NULL,
              flag_capture INT(11) NOT NULL, 
              flag_carry_time float NOT NULL, 
              flag_taken INT(11) NOT NULL,
              flag_pickup INT(11) NOT NULL,
              flag_self_cover INT(11) NOT NULL,
              flag_self_cover_pass INT(11) NOT NULL,
              flag_self_cover_fail INT(11) NOT NULL,
              best_single_self_cover INT(11) NOT NULL,
              flag_solo_capture INT(11) NOT NULL,
              PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

              `CREATE TABLE IF NOT EXISTS nstats_player_ctf_best (
                id int NOT NULL AUTO_INCREMENT,
                player_id int NOT NULL,
                gametype_id int NOT NULL,
                map_id int NOT NULL,
                flag_assist INT(11) NOT NULL,
                flag_return INT(11) NOT NULL, 
                flag_return_base INT(11) NOT NULL, 
                flag_return_mid INT(11) NOT NULL, 
                flag_return_enemy_base INT(11) NOT NULL, 
                flag_return_save INT(11) NOT NULL, 
                flag_dropped INT(11) NOT NULL, 
                flag_kill INT(11) NOT NULL, 
                flag_suicide INT(11) NOT NULL, 
                flag_seal INT(11) NOT NULL, 
                flag_seal_pass INT(11) NOT NULL, 
                flag_seal_fail INT(11) NOT NULL, 
                best_single_seal INT(11) NOT NULL, 
                flag_cover INT(11) NOT NULL, 
                flag_cover_pass INT(11) NOT NULL, 
                flag_cover_fail INT(11) NOT NULL, 
                flag_cover_multi INT(11) NOT NULL,
                flag_cover_spree INT(11) NOT NULL,
                best_single_cover INT(11) NOT NULL,
                flag_capture INT(11) NOT NULL, 
                flag_carry_time float NOT NULL, 
                flag_taken INT(11) NOT NULL,
                flag_pickup INT(11) NOT NULL,
                flag_self_cover INT(11) NOT NULL,
                flag_self_cover_pass INT(11) NOT NULL,
                flag_self_cover_fail INT(11) NOT NULL,
                best_single_self_cover INT(11) NOT NULL,
                flag_solo_capture INT(11) NOT NULL,
                PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

                `CREATE TABLE IF NOT EXISTS nstats_player_ctf_best_life (
                  id int NOT NULL AUTO_INCREMENT,
                  player_id int NOT NULL,
                  gametype_id int NOT NULL,
                  map_id int NOT NULL,
                  flag_assist INT(11) NOT NULL,
                  flag_return INT(11) NOT NULL, 
                  flag_return_base INT(11) NOT NULL, 
                  flag_return_mid INT(11) NOT NULL, 
                  flag_return_enemy_base INT(11) NOT NULL, 
                  flag_return_save INT(11) NOT NULL, 
                  flag_dropped INT(11) NOT NULL, 
                  flag_kill INT(11) NOT NULL, 
                  flag_seal INT(11) NOT NULL, 
                  flag_seal_pass INT(11) NOT NULL, 
                  flag_seal_fail INT(11) NOT NULL, 
                  best_single_seal INT(11) NOT NULL, 
                  flag_cover INT(11) NOT NULL, 
                  flag_cover_pass INT(11) NOT NULL, 
                  flag_cover_fail INT(11) NOT NULL, 
                  flag_cover_multi INT(11) NOT NULL,
                  flag_cover_spree INT(11) NOT NULL,
                  best_single_cover INT(11) NOT NULL,
                  flag_capture INT(11) NOT NULL, 
                  flag_carry_time float NOT NULL, 
                  flag_taken INT(11) NOT NULL,
                  flag_pickup INT(11) NOT NULL,
                  flag_self_cover INT(11) NOT NULL,
                  flag_self_cover_pass INT(11) NOT NULL,
                  flag_self_cover_fail INT(11) NOT NULL,
                  best_single_self_cover INT(11) NOT NULL,
                  flag_solo_capture INT(11) NOT NULL,
                  PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


                  `CREATE TABLE IF NOT EXISTS nstats_ctf_cap_records(
                    id int(11) NOT NULL AUTO_INCREMENT,
                    cap_id INT(11) NOT NULL,
                    map_id INT(11) NOT NULL,
                    gametype_id INT(11) NOT NULL,
                    match_id INT(11) NOT NULL,
                    travel_time float NOT NULL,
                    carry_time float NOT NULL,
                    drop_time float NOT NULL,
                    cap_type INT(1) NOT NULL,
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    
    `CREATE TABLE IF NOT EXISTS nstats_tele_frags(
      id int(11) NOT NULL AUTO_INCREMENT,
      match_id INT(11) NOT NULL,
      map_id INT(11) NOT NULL,
      gametype_id INT(11) NOT NULL,
      timestamp float NOT NULL,
      killer_id INT(11) NOT NULL,
      killer_team INT(3) NOT NULL,
      victim_id INT(11) NOT NULL,
      victim_team INT(3) NOT NULL,
      disc_kill TINYINT(1) NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_player_telefrags(
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id INT(11) NOT NULL,
        map_id INT(11) NOT NULL,
        gametype_id INT(11) NOT NULL,
        playtime FLOAT NOT NULL,
        total_matches INT(11) NOT NULL,
        tele_kills INT(11) NOT NULL,
        tele_deaths INT(11) NOT NULL,
        tele_efficiency FLOAT NOT NULL,
        best_tele_kills INT(11) NOT NULL,
        worst_tele_deaths INT(11) NOT NULL,
        best_tele_multi INT(11) NOT NULL,
        best_tele_spree INT(11) NOT NULL,
        disc_kills INT(11) NOT NULL,
        disc_deaths INT(11) NOT NULL,
        disc_efficiency FLOAT NOT NULL,
        best_disc_kills INT(11) NOT NULL,
        worst_disc_deaths INT(11) NOT NULL,
        best_disc_multi INT(11) NOT NULL,
        best_disc_spree INT(11) NOT NULL,
    PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


    `CREATE TABLE IF NOT EXISTS nstats_map_items_locations(
      id BIGINT NOT NULL AUTO_INCREMENT,
      map_id int(11) NOT NULL,
      match_id int(11) NOT NULL,
      item_id int(11) NOT NULL,
      item_name varchar(100) NOT NULL,
      pos_x float NOT NULL,
      pos_y float NOT NULL,
      pos_z float NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      
      `CREATE TABLE IF NOT EXISTS nstats_map_items(
      id int(11) NOT NULL AUTO_INCREMENT,
      item_class varchar(100) NOT NULL,
      item_type varchar(20) NOT NULL,
      item_image varchar(100) NOT NULL,
      item_display_name varchar(100) NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_server_query(
        id int(11) NOT NULL AUTO_INCREMENT,
        ip varchar(100) NOT NULL,
        port int(11) NOT NULL,
        last_response DATETIME NOT NULL,
        server_name varchar(100) NOT NULL,
        gametype_name varchar(100) NOT NULL,
        map_name varchar(100) NOT NULL,
        current_players int(3) NOT NULL,
        max_players int(3) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_server_query_history(
        id int(11) NOT NULL AUTO_INCREMENT,
        server int(11) NOT NULL,
        timestamp int(11) NOT NULL,
        player_count int(3) NOT NULL,
        map_id int(11) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  
        `CREATE TABLE IF NOT EXISTS nstats_server_query_maps(
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_server_query_players(
          id int(11) NOT NULL AUTO_INCREMENT,
          server int(11) NOT NULL,
          timestamp DATETIME NOT NULL,
          name varchar(30) NOT NULL,
          face varchar(100) NOT NULL,
          country varchar(2) NOT NULL,
          team int(3) NOT NULL,
          ping int(11) NOT NULL,
          time int(11) NOT NULL,
          frags int(11) NOT NULL,
          deaths int(11) NOT NULL,
          spree int(11) NOT NULL, 
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


          `CREATE TABLE IF NOT EXISTS nstats_hwid_to_name(
            id int(11) NOT NULL AUTO_INCREMENT,
            hwid varchar(32) NOT NULL,
            player_name varchar(30) NOT NULL,
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

       `CREATE TABLE IF NOT EXISTS nstats_map_totals (
        id int(11) NOT NULL AUTO_INCREMENT,
        gametype_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        first_match DATETIME NOT NULL,
        last_match DATETIME NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL,
        frags bigint NOT NULL,
        score bigint NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        spawn_kills int(11) NOT NULL,
        multi_1 int(11) NOT NULL,
        multi_2 int(11) NOT NULL,
        multi_3 int(11) NOT NULL,
        multi_4 int(11) NOT NULL,
        multi_5 int(11) NOT NULL,
        multi_6 int(11) NOT NULL,
        multi_7 int(11) NOT NULL,
        multi_best int(11) NOT NULL,
        spree_1 int(11) NOT NULL,
        spree_2 int(11) NOT NULL,
        spree_3 int(11) NOT NULL,
        spree_4 int(11) NOT NULL,
        spree_5 int(11) NOT NULL,
        spree_6 int(11) NOT NULL,
        spree_7 int(11) NOT NULL,
        spree_best int(11) NOT NULL,
        best_spawn_kill_spree int(11) NOT NULL,
        assault_objectives int(11) NOT NULL,
        dom_caps int(11) NOT NULL,
        dom_caps_best int(11) NOT NULL,
        dom_caps_best_life int(11) NOT NULL,
        k_distance_normal int(11) NOT NULL,
        k_distance_long int(11) NOT NULL,
        k_distance_uber int(11) NOT NULL,
        headshots int(11) NOT NULL,
        shield_belt int(11) NOT NULL,
        amp int(11) NOT NULL,
        amp_time float NOT NULL,
        invisibility int(11) NOT NULL,
        invisibility_time float NOT NULL,
        pads int(11) NOT NULL,
        armor int(11) NOT NULL,
        boots int(11) NOT NULL,
        super_health int(11) NOT NULL,
        mh_kills int(11) NOT NULL,
        mh_kills_best_life int(11) NOT NULL,
        mh_kills_best int(11) NOT NULL,
        mh_deaths int(11) NOT NULL,
        mh_deaths_worst int(11) NOT NULL,
        telefrag_kills int(11) NOT NULL,
        telefrag_kills_best int(11) NOT NULL,
        telefrag_deaths int(11) NOT NULL,
        telefrag_best_spree int(11) NOT NULL,
        tele_disc_kills int(11) NOT NULL,
        tele_disc_kills_best int(11) NOT NULL,
        tele_disc_deaths int(11) NOT NULL,
        tele_disc_best_spree int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  

];


async function basicQuery(query){
	return await mysqlObject.query(query);
} 

async function simpleQuery(query, vars){

	if(vars === undefined) vars = [];

	const [result, fields] = await mysqlObject.query(query, vars);
	
	return result;
}

async function bSettingAlreadyExist(cat, name){

	const query = `SELECT COUNT(*) as total_rows FROM nstats_site_settings WHERE category=? AND name=?`;
	const result = await simpleQuery(query, [cat, name]);

	return result[0].total_rows > 0;

}

async function insertSiteSettings(){

	const query = `INSERT INTO nstats_site_settings VALUES(NULL,?,?,?,?,?,?)`;

	for(const [cat, cData] of Object.entries(DEFAULT_PAGE_SETTINGS)){

		for(let i = 0; i < cData.length; i++){

			const c = cData[i];

			if(!await bSettingAlreadyExist(cat, c.name)){

				await simpleQuery(query, [cat, c.valueType, c.name, c.value, c.pageOrder, c.moveable]);
				new Message(`Inserted Site Setting: ${cat}->${c.name} inserted successfully.`,"pass");

			}else{

				new Message(`Site Setting: ${cat}->${c.name} already exists.`,"pass");
			}
		}
	}
}

async function bRankingValueExist(name){

	const query = `SELECT COUNT(*) as total_rows FROM nstats_ranking_values WHERE name=?`;

	const result = await simpleQuery(query, [name]);

	return result[0].total_rows > 0;
}

async function insertRankingValues(){

	const query = `INSERT INTO nstats_ranking_values VALUES(NULL,?,?,?,?)`;

	for(let i = 0; i < DEFAULT_RANKING_VALUES.length; i++){

		const r = DEFAULT_RANKING_VALUES[i];

		if(!await bRankingValueExist(r.name)){

			await simpleQuery(query, [r.name, r.display_name, r.description, r.value]);
			new Message(`Inserted Ranking value for event: ${r.display_name} `, "pass");
		}else{
			new Message(`Ranking value for event: ${r.display_name} already exists`, "pass");
		}
	}
}

async function bItemExist(name){

	const query = `SELECT COUNT(*) as total_rows FROM nstats_items WHERE name=?`;
	const result = await simpleQuery(query, [name]);

	return result[0].total_rows > 0;
}

async function insertItems(){

	const query = `INSERT INTO nstats_items VALUES(NULL,?,?,?,?,0,0,?)`;

	for(let i = 0; i < DEFAULT_ITEMS.length; i++){

		const d = DEFAULT_ITEMS[i];
		
		if(!await bItemExist(d.name)){

			await simpleQuery(query, [d.name, d.display_name,"1999-11-30","1999-11-30", d.type]);
			new Message(`Inserted item ${d.name} into items table.`,"pass");

		}else{
			new Message(`There is already an item called ${d.name} in the items table.`,"pass");
		}
	}
}

(async () =>{


      

    try{
        
        for(let i = 0; i < queries.length; i++){

            
            await basicQuery(queries[i]);

            if(i === 0){
                mysqlObject.releaseConnection();
                mysqlObject = mysql.createPool({
                    "host": config.mysql.host,
                    "user": config.mysql.user,
                    "password": config.mysql.password,
                    "database": config.mysql.database
                });
            }
            new Message(`Performed query ${i+1} of ${queries.length}`,"pass");
        }

		await insertSiteSettings();
		await insertRankingValues();
		await insertItems();

        mysqlObject.releaseConnection();

        const saltFileDest = "./salt.js";

        if(!existsSync(saltFileDest)){
			new Message(`Creating password salt file`, "note");
            const seed = generateRandomString(10000);
            const fileContents = `export default function (){  return \`${seed}\`;}`;

            writeFileSync(saltFileDest, fileContents);
        }else{
			new Message(`Password salt file already exists, delete salt.js if you wish to create a new salt.`,"note");
			new Message(`You will not be able to login if if you create a new salt.js`,"note");
		}

        process.exit();

    }catch(err){
        console.trace(err);
    }
})();

