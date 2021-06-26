const mysql = require('./database');
const Player = require('./player');
const Functions = require('./functions');

class NexgenStatsViewer{

    constructor(){


        this.playerManager = new Player();
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

            console.log(data);

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
}


module.exports = NexgenStatsViewer;