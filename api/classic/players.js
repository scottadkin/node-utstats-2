import mysql from './database';

class Players{

    constructor(){

    }

    async getPlayerName(playerId){

        const query = "SELECT name FROM uts_pinfo WHERE id=?";

        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0){

            return result[0].name;
        }

        return "Not Found";
    }

    async getDmWinner(matchId){

        const query = "SELECT pid from uts_player WHERE matchid=? ORDER by frags DESC LIMIT 1";

        const result = await mysql.simpleQuery(query, [matchId]);

        if(result.length > 0){
            return await this.getPlayerName(result[0].pid);
        }

        return null;
    }

    async getNames(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name FROM uts_pinfo WHERE id IN (?)";

        const result =  await mysql.simpleQuery(query, [ids]);

        const names = {};

        for(let i = 0; i < result.length; i++){

            names[result[i].id] = result[i].name;
        }

        return names;
    }

    async getMatchData(matchId, bBasic){

        let query = "SELECT * FROM uts_player WHERE matchid=? ORDER BY gamescore DESC";

        if(bBasic){
            query = "SELECT pid,team,country,id,matchid FROM uts_player WHERE matchid=? ORDER BY matchid DESC";
        }

        const players = await mysql.simpleQuery(query, [matchId]);

        const playerIds = [];

        for(let i = 0; i < players.length; i++){

            playerIds.push(players[i].pid);
        }

        const names = await this.getNames(playerIds);

        let p = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            if(names[p.pid] === undefined){
                p.name = "Not Found";
            }else{
                p.name = names[p.pid];
            }
        }

        return players;

    }


    async getDefaultPlayers(page, perPage){

        const query = "SELECT id,name,country FROM uts_pinfo ORDER by name ASC LIMIT ?, ?";
        page--;

        const start = page * perPage;

        const result = await mysql.simpleQuery(query, [start, perPage]);

        if(result.length === 0) return [];

        const names = {};

        const playerIds = [];

        for(let i = 0; i < result.length; i++){

            playerIds.push(result[i].id);

            names[result[i].id] = {"name": result[i].name, "country": result[i].country};
        }
        
        const statsQuery = `SELECT COUNT(*) as total_matches,pid,SUM(gamescore) as gamescore,
        SUM(frags) as frags, SUM(kills) as kills, SUM(deaths) as deaths,
        eff,SUM(gametime) as gametime FROM uts_player WHERE pid IN(?) GROUP BY(pid)`;

        const stats = await mysql.simpleQuery(statsQuery, [playerIds]);

        for(let i = 0; i < stats.length; i++){

            stats[i].name = names[stats[i].pid].name;
            stats[i].country = names[stats[i].pid].country;
        }

        stats.sort((a, b) =>{

            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            if(a > b) return 1;
            if(a < b) return -1;
            return 0;
        });

        return stats;
    }

}


export default Players;