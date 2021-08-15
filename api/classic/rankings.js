import mysql from './database';
import Players from './players';

class Rankings{

    constructor(){

        this.players = new Players();

    }

    async getPlayers(players, gametype){

        const query = "SELECT pid,rank,prevrank,matches,time FROM uts_rank WHERE pid IN (?) AND gid=? ORDER BY rank DESC";

        const result = await mysql.simpleQuery(query, [players, gametype]);
   
        const data = [];

        let r = 0;

        for(let i = 0; i < result.length; i++){

            r = result[i];

            data.push( {
                "player": r.pid, 
                "rank": r.rank,
                "difference": r.rank - r.prevrank,
                "change": (r.rank === r.prevrank) ? "nc" : (r.rank > r.prevrank) ? "up" : "down",
                "matches": r.matches,
                "time": r.time,
                "position": await this.getPosition(gametype, r.rank)
            });
        }
        
        return data;

    }

    async getPosition(gametype, points){

        const query = "SELECT COUNT(*) + 1 as current_position FROM uts_rank WHERE rank > ?+1 AND gid=? ORDER BY rank DESC";

        const result = await mysql.simpleQuery(query, [points, gametype]);

        if(result.length > 0){
            return result[0].current_position;
        }

        return -1;
        
    }


    async getTopPlayers(gametype, page, perPage, bSetPlayerNames){

        const query = "SELECT time,pid,rank,prevrank,matches FROM uts_rank WHERE gid=? ORDER BY rank DESC LIMIT ?, ?";
        const start = page * perPage;

        const result = await mysql.simpleQuery(query, [gametype, start, perPage]);

        if(bSetPlayerNames){

            const playerIds = [];

            for(let i = 0; i < result.length; i++){

                playerIds.push(result[i].pid);
            }

            return {"data": result, "playerIds": playerIds};
        }

        return result;
    }


    async getMultipleTopPlayers(gametypes, page, perPage){

        if(gametypes.length === 0) return {};

        const playerIds = [];

        const data = {};

        for(const [key, value] of Object.entries(gametypes)){

            const currentResult = await this.getTopPlayers(key, page, perPage, false);

            for(let i = 0; i < currentResult.length; i++){

                const c = currentResult[i];

                if(playerIds.indexOf(c.pid) === -1){
                    playerIds.push(c.pid);
                }    
            }

            data[key] = {
                "name": value,
                "data": currentResult
            };
        }

        const playerData = await this.players.getNamesAndCountry(playerIds);

        return {"data": data, "players": playerData};
    }

}

export default Rankings;