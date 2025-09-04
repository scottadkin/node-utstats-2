import { simpleQuery, bulkInsert } from "./database.js";


export default class Pings{

    constructor(){}

    async insert(match, timestamp, player, ping){

        const query = "INSERT INTO nstats_match_pings VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [match, timestamp, player, ping]);
    }

    async bulkInsert(vars){

        const query = `INSERT INTO nstats_match_pings (match_id,timestamp,player,ping) VALUES ?`;

        return await bulkInsert(query, vars);
    }

    createMatchGraphData(inputData, players){

        const playerIndexes = [];
        const data = [];

        for(const [key, value] of Object.entries(players)){

            playerIndexes.push(parseInt(key));
            data.push({"name": value, "data": [], "lastValue": 0, "total": 0, "average": 0});
        }

        const updateOthers = (ignore) =>{

            for(let i = 0; i < playerIndexes.length; i++){

                const p = playerIndexes[i];

                if(ignore.indexOf(p) === -1){

                    data[i].data.push(0);
                }
            }
        }

        let ignore = [];
        let lastTimestamp = -1;

        const uniqueTimestamps = [...new Set(inputData.map((d) =>{
            return d.timestamp;
        }))]

        for(let i = 0; i < inputData.length; i++){

            const d = inputData[i];
            const ping = d.ping;

            if(d.timestamp !== lastTimestamp){

                updateOthers(ignore);
                ignore = [];
                lastTimestamp = d.timestamp;
            }
            
            const index = playerIndexes.indexOf(d.player);

            if(index !== -1){

                ignore.push(d.player);
                data[index].data.push(ping);
                data[index].lastValue = ping;

                data[index].total += ping;

            }   
        }

        updateOthers(ignore);

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(d.total > 0){

                d.average = d.total / (d.data.length - 1);
                
            }
        }

        data.sort((a, b) =>{

            a = a.average;
            b = b.average;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }
            return 0;
        });

        return {"timestamps": uniqueTimestamps, "data": data};
        
    }

    async getMatchData(id, players){


        const query = "SELECT timestamp,player,ping FROM nstats_match_pings WHERE match_id=? ORDER BY timestamp ASC";
        const data = await simpleQuery(query, [id]);

        return this.createMatchGraphData(data, players);

    }

    async getPlayerHistoryAfter(player, limit){

        const query = "SELECT ping_min,ping_average,ping_max FROM nstats_player_matches WHERE player_id=? ORDER by match_date DESC LIMIT ?";

        const result = await simpleQuery(query, [player, limit]);

        const data = [];

        for(let i = 0; i < result.length; i++){

            data.push({
                "min": result[i].ping_min,
                "average": result[i].ping_average,
                "max": result[i].ping_max
            });

        }

        return data;
    }

    async deletePlayerMatchData(playerId, matchId){

         return await simpleQuery("DELETE FROM nstats_match_pings WHERE player=? AND match_id=?", [playerId, matchId]);
     
    }

    async changePlayerIds(oldId, newId){

        await simpleQuery("UPDATE nstats_match_pings SET player=? WHERE player=?", [newId, oldId]);

    }

    async deletePlayer(playerId){
        await simpleQuery("DELETE FROM nstats_match_pings WHERE player=?", [playerId]);
    }

    async deleteMatches(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_match_pings WHERE match_id IN (?)", [ids]);
    }

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT timestamp,ping FROM nstats_match_pings WHERE match_id=? AND player=? ORDER BY timestamp ASC";

        const data = await simpleQuery(query, [matchId, playerId]);

        if(data.length === 0){
            return [];
        }

        return data;
    }

    createPlayerMatchGraphData(data){

        const pingData = [];
        const pingText = [];

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            pingData.push(d.ping);
            pingText.push(d.timestamp);
        }

        return {"graphData": [{"name": "Ping", "data": pingData}], "graphText": pingText};
    }

    createPlayerMatchBasicInfo(data){

        let min = 0;
        let max = 0;
        let total = 0;

        for(let i = 0; i < data.length; i++){

            const {ping} = data[i];

            total += ping;

            if(i === 0){
                min = max = ping;
                continue;
            }

            if(ping < min) min = ping;
            if(ping > max) max = ping;

        }


        let average = 0;

        if(total !== 0 && data.length > 0){
            average = parseFloat((total / data.length).toFixed(2));
        }

        return {"min": min, "average": average, "max": max};
    }

    async getPlayerHistory(playerId, limit){

        const query = `SELECT match_date,ping_min,ping_average,ping_max FROM nstats_player_matches 
        WHERE player_id=? ORDER BY match_date DESC LIMIT ?`;

        return await simpleQuery(query, [playerId, limit]);
    }

    async getPlayerHistoryGraphData(playerId, limit){

        const result = await this.getPlayerHistory(playerId, limit);


        const data = [
            {"name": "Min", "values": []},
            {"name": "Average", "values": []},
            {"name": "Max", "values": []}
        ];
        
        const labels = [];

        
        const MAX_PING_LIMIT = 1000;

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[0].values.push((r.ping_min < MAX_PING_LIMIT) ? r.ping_min : MAX_PING_LIMIT);
            data[1].values.push((r.ping_average < MAX_PING_LIMIT) ? r.ping_average : MAX_PING_LIMIT);
            data[2].values.push((r.ping_max < MAX_PING_LIMIT) ? r.ping_max : MAX_PING_LIMIT);

            labels.push(r.match_date);
        }

        return {"data": data, "labels": labels};
    }
}
