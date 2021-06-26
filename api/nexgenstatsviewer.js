const mysql = require('./database');
const Player = require('./player');
const Functions = require('./functions');

class NexgenStatsViewer{

    constructor(){

        this.validTypes = [
            {"name": "Default (Top Gametype Rankings)", "id": 0},
            {"name": "Most Wins", "id": 1},
            {"name": "Most Playtime", "id": 2},
            {"name": "Top Scores", "id": 3},
            {"name": "Top Kills", "id": 4},
            {"name": "Top Spawn Kills", "id": 5},
            {"name": "Top Deaths", "id": 6},
            {"name": "Top Suicides", "id": 7},
            {"name": "Most Monster Kills", "id": 8},
            {"name": "Most Godlikes", "id": 9},
            {"name": "Longest Sprees", "id": 10},
            {"name": "Flag Grabs", "id": 11},
            {"name": "Flag Captures", "id": 12},
            {"name": "Flag Kills", "id": 13},
            {"name": "Flag Covers", "id": 14},
            {"name": "Assault Objective Caps", "id": 15},
            {"name": "Domination Control Point Caps", "id": 16}
        ];

        this.playerManager = new Player();
    }

    async getCurrentSettings(){

        const query = "SELECT * FROM nstats_nexgen_stats_viewer ORDER BY position ASC";

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

                string += `addplayer "${this.cleanString(d.playerName)}" ${d.value.toFixed(2)} gb ${icon}\r\n`;
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
}


module.exports = NexgenStatsViewer;