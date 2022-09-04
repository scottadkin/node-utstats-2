const mysql = require('./database');
const Player = require('./player');
const Functions = require('./functions');

class NexgenStatsViewer{

    constructor(){

        this.validTypes = [
            {"name": "Default (Top Gametype Rankings)", "id": 0},
            {"name": "Most Wins", "id": 1, "column": "wins"},
            {"name": "Most Playtime", "id": 2, "column": "playtime"},
            {"name": "Top Score", "id": 3, "column": "frags"},
            {"name": "Top Kills", "id": 4, "column": "kills"},
            {"name": "Top Spawn Kills", "id": 5, "column": "spawn_kills"},
            {"name": "Top Deaths", "id": 6, "column": "deaths"},
            {"name": "Top Suicides", "id": 7, "column": "suicides"},
            {"name": "Most Monster Kills", "id": 8, "column": null},
            {"name": "Most Godlikes", "id": 9, "column": null},
            {"name": "Longest Sprees", "id": 10, "column": "spree_best"},
            {"name": "Flag Grabs", "id": 11, "column": "flag_taken"},
            {"name": "Flag Captures", "id": 12, "column": "flag_capture"},
            {"name": "Flag Kills", "id": 13, "column": "flag_kill"},
            {"name": "Flag Covers", "id": 14, "column": "flag_cover"},
            {"name": "Assault Objective Caps", "id": 15, "column": "assault_objectives"},
            {"name": "Domination Control Point Caps", "id": 16, "column": "dom_caps"}
        ];

        this.playerManager = new Player();
    }

    async getCurrentSettings(bOnlyActivated){

        let query = "SELECT * FROM nstats_nexgen_stats_viewer ORDER BY position ASC";

        if(bOnlyActivated !== undefined){
            if(bOnlyActivated === true){
                query = "SELECT * FROM nstats_nexgen_stats_viewer WHERE enabled=1 ORDER BY position ASC";
            }
        }

        const data = await mysql.simpleFetch(query);

        for(let i = 0; i < data.length; i++){

            data[i].position = i;
        }

        return data;
    }

    cleanString(string){

        return string.replace(/["\\]/ig, "");
    }


    async getDefaultData(gametype, amount){

        const query = `SELECT player_id,ranking as value,ranking_change FROM nstats_ranking_player_current 
            WHERE gametype=? ORDER BY ranking DESC LIMIT ?`;

        return await mysql.simpleFetch(query, [gametype, amount]);
    }

    async setPlayerData(data){

        try{

            const playerIds = [];

            let r = 0;

            for(let i = 0; i < data.length; i++){
                
                r = data[i];

                if(playerIds.indexOf(r.player_id) === -1){
                    playerIds.push(r.player_id);
                }
            }

            const players = await this.playerManager.getPlayerNames(playerIds);

            let currentPlayer = 0;
            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                currentPlayer = Functions.getPlayer(players, d.player_id);

                d.playerName = currentPlayer.name;
                d.playerCountry = currentPlayer.country;

                if(d.playerCountry === ""){
                    d.playerCountry = "xx";
                }
            }

        }catch(err){
            console.trace(err);
        }
    }

    async getDefaultList(gametype, amount){


        try{

            const result = await this.getDefaultData(gametype, amount);

            await this.setPlayerData(result);

            return result;

        }catch(err){
            console.trace(err);
            return [];
        }

    }

    async displayDefaultList(title, data){

        try{

        
            let string = `beginlist "${this.cleanString(title)}"\r\n`;

            let icon = 0;
            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];


                if(d.ranking_change > 0){
                    icon = "up";
                }else if(d.ranking_change < 0){
                    icon = "down";
                }else{
                    icon = "nc";
                }

                string += `addplayer "${this.cleanString(d.playerName)}" ${d.value.toFixed(2)} ${d.playerCountry} ${icon}\r\n`;
            }

            return string;

        }catch(err){

            console.trace(err);
            return "";
        }
    }


    async updateSetting(settings){

        const query = `UPDATE nstats_nexgen_stats_viewer SET
        title=?,
        type=?,
        gametype=?,
        players=?,
        position=?,
        enabled=?
        WHERE id=?`;

        const vars = [
            settings.title,
            settings.type,
            settings.gametype,
            settings.players,
            settings.position,
            settings.enabled,
            settings.id
        ];

        await mysql.simpleUpdate(query, vars);
    }

    async updateSettings(settings){

        try{

            for(let i = 0; i < settings.length; i++){

                await this.updateSetting(settings[i]);

            }

            return true;

        }catch(err){
            console.trace(err);
            return err;
        }
    }


    async deleteList(id){

        const query = "DELETE FROM nstats_nexgen_stats_viewer WHERE id=?";

        const result = await mysql.updateReturnAffectedRows(query, [id]);

        if(result === 0){
            return false;
        }

        return true;
    }


    async createList(data){

        const query = "INSERT INTO nstats_nexgen_stats_viewer VALUES(NULL,?,?,?,?,?,?)";

        const vars = [
            data.title,
            data.type,
            data.gametype,
            data.players,
            9999,
            data.enabled
        ];

        return await mysql.insertReturnInsertId(query, vars)
              
    }

    getValidType(id){

        let v = 0;

        for(let i = 0; i < this.validTypes.length; i++){

            v = this.validTypes[i];

            if(v.id === id) return v.column;
        }

        return null;
    }

    async getPlayerTotalsList(type, gametype, players){

        if(type > this.validTypes.length || type < 1) return [];

        const query = `SELECT player_id,${this.validTypes[type].column} as totals FROM nstats_player_totals
        WHERE gametype=? ORDER BY ${this.validTypes[type].column} DESC LIMIT ?`;

        const data = await mysql.simpleFetch(query, [gametype, players]);

        await this.setPlayerData(data);

        return data;

    }

    async getPlayerGodlikes(gametype, players){

        const query = `SELECT player_id,SUM(spree_5 + spree_6 + spree_7) as totals 
        FROM nstats_player_totals WHERE gametype=? 
        GROUP BY(player_id) ORDER BY totals DESC LIMIT ?`;

        const data = await mysql.simpleFetch(query, [gametype, players]);

        await this.setPlayerData(data);

        return data;
    }


    async getPlayerMonsterKills(gametype, players){

        const query = `SELECT player_id,SUM(multi_4 + multi_5 + multi_6 + multi_7) as totals
        FROM nstats_player_totals WHERE gametype=?
        GROUP BY(player_id) ORDER BY totals DESC LIMIT ?`;

        const data = await mysql.simpleFetch(query, [gametype, players]);

        await this.setPlayerData(data);

        return data;
    }

    displayCustomList(title, data){

        try{

        
            let string = `beginlist "${this.cleanString(title)}"\r\n`;

            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                string += `addplayer "${this.cleanString(d.playerName)}" ${d.totals} ${d.playerCountry} nc\r\n`;
            }

            return string;

        }catch(err){

            console.trace(err);
            return "";
        }
    }

    getAllTypes(){

        return this.validTypes;
    }
}


module.exports = NexgenStatsViewer;