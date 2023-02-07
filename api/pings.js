const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const Functions = require('./functions');


class Pings{

    constructor(){

    }

    insert(match, timestamp, player, ping){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_match_pings VALUES(NULL,?,?,?,?)";

            mysql.query(query, [match, timestamp, player, ping], (err) =>{
            
                if(err) reject(err);

                resolve();
            });
        });
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

        return Functions.reduceGraphDataPoints(data, 50);
        
    }

    async getMatchData(id, players){


        const query = "SELECT timestamp,player,ping FROM nstats_match_pings WHERE match_id=? ORDER BY timestamp ASC";
        const data = await mysql.simpleQuery(query, [id]);

        return this.createMatchGraphData(data, players);

    }

    getPlayerHistoryAfter(player, limit){

        return new Promise((resolve, reject) =>{
            const query = "SELECT ping_min,ping_average,ping_max FROM nstats_player_matches WHERE player_id=? ORDER by match_date DESC LIMIT ?";

            mysql.query(query, [player, limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push({
                            "min": result[i].ping_min,
                            "average": result[i].ping_average,
                            "max": result[i].ping_max
                        });

                    }

                    resolve(data);
                }

                resolve([]);
            });
        });     
    }

    async deletePlayerMatchData(playerId, matchId){

         return await mysql.simpleDelete("DELETE FROM nstats_match_pings WHERE player=? AND match_id=?", [playerId, matchId]);
     
    }

    async changePlayerIds(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_match_pings SET player=? WHERE player=?", [newId, oldId]);

    }

    async deletePlayer(playerId){
        await mysql.simpleDelete("DELETE FROM nstats_match_pings WHERE player=?", [playerId]);
    }

    async deleteMatches(ids){

        if(ids.length === 0) return;

        await mysql.simpleQuery("DELETE FROM nstats_match_pings WHERE match_id IN (?)", [ids]);
    }

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT timestamp,ping FROM nstats_match_pings WHERE match_id=? AND player=? ORDER BY timestamp ASC";

        const data = await mysql.simpleQuery(query, [matchId, playerId]);

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
            pingText.push(Functions.MMSS(d.timestamp));
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
}

module.exports = Pings;