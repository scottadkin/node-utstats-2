import mysql from './database';

class Rankings{

    constructor(){

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
}

export default Rankings;