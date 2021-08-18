import mysql from './database';
import Players from './players';
import Gametypes from './gametypes';

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

    async getTotalPlayers(gametypeId){

        const query = "SELECT COUNT(*) as total_players FROM uts_rank WHERE gid=?";

        const result = await mysql.simpleQuery(query, [gametypeId]);

        if(result.length > 0) return result[0].total_players;

        return 0;
    }

    async getTopPlayers(gametype, page, perPage, bSetPlayerNames){

        const query = "SELECT time,pid,rank,prevrank,matches FROM uts_rank WHERE gid=? ORDER BY rank DESC LIMIT ?, ?";
        let start = page * perPage;

        if(start < 0) start = 0;

        const result = await mysql.simpleQuery(query, [gametype, start, perPage]);

        const totalPlayers = await this.getTotalPlayers(gametype);

        if(bSetPlayerNames){

            const playerIds = [];

            for(let i = 0; i < result.length; i++){

                playerIds.push(result[i].pid);
            }

            const playerNames = await this.players.getNamesAndCountry(playerIds);

            for(let i = 0; i < result.length; i++){

                const r = result[i];
                const player = (playerNames[r.pid] !== undefined) ? playerNames[r.pid] : {"name": "Not Found", "country": "xx"};

                r.name = player.name;
                r.country = player.country;
            }

            return {"data": result, "totalPlayers": totalPlayers};
        }

        return {"data": result, "totalPlayers": totalPlayers};
    }


    async getMultipleTopPlayers(gametypes, page, perPage){

        if(gametypes.length === 0) return {};

        const playerIds = [];

        const data = {};

        for(const [key, value] of Object.entries(gametypes)){

            const currentResult = await this.getTopPlayers(key, page, perPage, false);

            for(let i = 0; i < currentResult.data.length; i++){

                const c = currentResult.data[i];

                if(playerIds.indexOf(c.pid) === -1){
                    playerIds.push(c.pid);
                }    
            }

            data[key] = {
                "name": value,
                "data": currentResult.data,
                "totalPlayers": currentResult.totalPlayers
            };
        }

        const playerData = await this.players.getNamesAndCountry(playerIds);

        return {"data": data, "players": playerData};
    }


    async getPlayerData(id){

        const query = "SELECT time,gid,rank,prevrank,matches FROM uts_rank WHERE pid=?";

        const result = await mysql.simpleQuery(query, [id]);

        const gametypeIds = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i].gid;
            gametypeIds.push(r);
        }

        const gametypeManager = new Gametypes();

        const names = await gametypeManager.getNames(gametypeIds);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            r.name = (names[r.gid] !== undefined) ? names[r.gid] : "Not Found";
            r.position = await this.getPosition(r.gid, r.rank);
            r.totalPlayers = await this.getTotalPlayers(r.gid);
        }

        return result;
    }

}

export default Rankings;