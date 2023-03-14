const mysql = require("./database");
const fs = require("fs");
const archiver = require('archiver');





class Backup{

    constructor(){

        this.validTables = [
            "nstats_ace_joins",
            "nstats_ace_kicks",
            "nstats_ace_players",
            "nstats_ace_screenshots",
            "nstats_ace_sshot_requests",
            "nstats_assault_match_objectives",
            "nstats_assault_objects",
            "nstats_countries",
            "nstats_ctf_assists",
            "nstats_ctf_cap_records",
            "nstats_ctf_caps",
            "nstats_ctf_carry_times",
            "nstats_ctf_covers",
            "nstats_ctf_cr_kills",
            "nstats_ctf_events",
            "nstats_ctf_flag_deaths",
            "nstats_ctf_flag_drops",
            "nstats_ctf_flag_pickups",
            "nstats_ctf_returns",
            "nstats_ctf_seals",
            "nstats_ctf_self_covers",
            "nstats_dom_control_points",
            "nstats_dom_match_caps",
            "nstats_dom_match_control_points",
            "nstats_dom_match_player_score",
            "nstats_faces",
            "nstats_ftp",
            "nstats_gametypes",
            "nstats_headshots",
            "nstats_hits",
            "nstats_items",
            "nstats_items_match",
            "nstats_items_player",
            "nstats_kills",
            "nstats_logs",
            "nstats_logs_folder",
            "nstats_map_combogib",
            "nstats_map_spawns",
            "nstats_maps",
            "nstats_maps_flags",
            "nstats_match_combogib",
            "nstats_match_connections",
            "nstats_match_pings",
            "nstats_match_player_score",
            "nstats_match_team_changes",
            "nstats_matches",
            "nstats_monster_kills",
            "nstats_monsters",
            "nstats_monsters_match",
            "nstats_monsters_player_match",
            "nstats_monsters_player_totals",
            "nstats_nexgen_stats_viewer",
            "nstats_player_combogib",
            "nstats_player_ctf_best",
            "nstats_player_ctf_best_life",
            "nstats_player_ctf_match",
            "nstats_player_ctf_totals",
            "nstats_player_maps",
            "nstats_player_matches",
            "nstats_player_totals",
            "nstats_player_weapon_match",
            "nstats_player_weapon_totals",
            "nstats_powerups",
            "nstats_powerups_carry_times",
            "nstats_powerups_player_match",
            "nstats_powerups_player_totals",
            "nstats_ranking_player_current",
            "nstats_ranking_player_history",
            "nstats_ranking_values",
            "nstats_servers",
            "nstats_sessions",
            "nstats_site_settings",
            "nstats_sprees",
            "nstats_user_agents",
            "nstats_users",
            "nstats_visitors",
            "nstats_visitors_countries",
            "nstats_voices",
            "nstats_weapons",
            "nstats_winrates",
            "nstats_winrates_latest"
        ];

        this.createArchive();
    }

    createArchive(){

        const now = new Date(Date.now());

        const dayOfMonth = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        this.fileName = `DBBACKUP-${dayOfMonth}-${month}-${year}-${hours}${minutes}`;



        // create a file to stream archive data to.
        this.output = fs.createWriteStream(`./backups/${this.fileName}.zip`);
        this.archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        this.output.on('close', () => {
            console.log(this.archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            //process.exit();
        });

        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        this.output.on('end', function() {
            console.log('Data has been drained');
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        this.archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        // good practice to catch this error explicitly
        this.archive.on('error', function(err) {
            throw err;
        });


    }

    async test(){

        const query = `SELECT * FROM nstats_player_totals`;

        const result = await mysql.simpleQuery(query);

        console.log(result);

        const test = JSON.stringify(result);

        console.log(test);

        fs.writeFileSync("nstats_player_totals.json", test);

    }

    async anotherTest(){

        const data = fs.readFileSync("nstats_player_totals.json");
        console.log(data);
        console.log(JSON.parse(data));
    }


    async dumpTableToJSON(table, dir){

        if(this.validTables.indexOf(table) === -1) throw new Error(`Not a valid table to dump`);

        const query = `SELECT * FROM ${table} ORDER BY id ASC`;

        const result = await mysql.simpleQuery(query);
        if(result.length === 0) return null;

        const keys = Object.keys(result[0])

        const data = {"keys": keys, "data": []};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const currentRow = [];

            for(let x = 0; x < keys.length; x++){

                currentRow.push(r[keys[x]]);
            }

            data.data.push(currentRow);
        }

        //console.log(data);
        // append a file from string
       // console.log(data);
        this.archive.append(JSON.stringify(data), { name: `${table}.json` });
        //fs.writeFileSync(`${dir}/${table}.json`, JSON.stringify(data));

    }


    async dumpAllTableNames(){

        const query = `SELECT table_name as name FROM information_schema.tables
        WHERE table_schema = 'node_utstats_2';`;

        const result = await mysql.simpleQuery(query);

        const data = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data.push(r.name);
        }

        fs.writeFileSync("table_names.json", JSON.stringify(data));
    }

    async dumpAllTablesToJSON(){

        //const dir = `./backups/${dayOfMonth}-${month}-${year}-${hours}${minutes}/`;

        //fs.mkdirSync(dir);

        for(let i = 0; i < this.validTables.length; i++){

            const table = this.validTables[i];

            console.log(`Dumping ${table}`);

            await this.dumpTableToJSON(table);
        }

        // pipe archive data to the file
        this.archive.pipe(this.output);
        this.archive.finalize();
        
    }



}

module.exports = Backup;