const mysql = require('./database');
const Promise = require('promise');
const Functions = require('./functions');

class Kills{

    constructor(){

    }


    insert(matchId, timestamp, killer, killerTeam, victim, victimTeam, killerWeapon, victimWeapon, distance){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_kills VALUES(NULL,?,?,?,?,?,?,?,?,?)";

            const vars = [matchId, timestamp, killer, killerTeam, victim, victimTeam, killerWeapon, victimWeapon, distance];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchData(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,killer,killer_team,victim,victim_team FROM nstats_kills WHERE match_id=? ORDER BY timestamp ASC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });

        });
    }

    deleteMatchData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_kills WHERE match_id=?";

            mysql.query(query, [id], (err) =>{
                
                if(err) reject(err);

                resolve();
            }); 
        });
    }

    deletePlayerMatchData(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_kills WHERE (killer=? AND match_id=?) OR (victim=? AND match_id=?)";

            mysql.query(query, [playerId, matchId, playerId, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async changePlayerIds(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_kills SET killer=? WHERE killer=?", [newId, oldId]);
        await mysql.simpleUpdate("UPDATE nstats_kills SET victim=? WHERE victim=?", [newId, oldId]);
        
    }

    async deletePlayer(player){

        await mysql.simpleDelete("DELETE FROM nstats_kills WHERE (killer = ?) OR (victim = ?)", [player, player]);
    }

    async deleteMatches(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_kills WHERE match_id IN (?)", [ids]);
    }

    async getMatchKillsIncludingPlayer(matchId, playerId){

        const query = `SELECT timestamp,killer,killer_team,victim,victim_team,killer_weapon,victim_weapon,distance
        FROM nstats_kills WHERE match_id=? AND (killer=? OR victim=?) ORDER BY timestamp ASC`;

        return await mysql.simpleFetch(query, [matchId, playerId, playerId]);
    }


    async getMatchKillsBasic(matchId){

        const query = "SELECT killer,victim FROM nstats_kills WHERE match_id=?";

        return await mysql.simpleFetch(query, [matchId]);
   
    }


    async getKillsMatchUp(matchId){

        const kills = await this.getMatchKillsBasic(matchId);

        const data = [];

        const getIndex = (killer, victim) =>{

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                if(d.killer === killer && d.victim === victim){
                    return i;
                }
            }

            return -1;
        }


        for(let i = 0; i < kills.length; i++){

            const k = kills[i];

            //ignore suicides
            if(k.victim === 0) continue;

            let index = getIndex(k.killer, k.victim);

            if(index === -1){
                data.push({"killer": k.killer, "victim": k.victim, "kills": 0});
                index = data.length - 1;
            }

            data[index].kills++;

        }

        return data;
    }

    reduceDataPoints(inputData){

        const max = 50;
        const totalDataPoints = inputData[0].data.length;
        const increment = Math.ceil(totalDataPoints / 50);

        if(totalDataPoints <= max) return inputData;

        const outputData = [];

        for(let i = 0; i < inputData.length; i++){

            const current = inputData[i];

            outputData.push({"name": current.name, data: [0], "lastValue":current.lastValue});
        }


        for(let i = increment; i < totalDataPoints; i += increment){

            for(let x = 0; x < inputData.length; x++){

                outputData[x].data.push(inputData[x].data[i]);
            }
        }

        return outputData;
    }

    reduceTotalDataPoints(data, players, teams){

        const playerIndexes = [];
        let killsData = [];
        let deathsData = [];
        let suicidesData = [];

        let teamsKillsData = [];
        let teamsDeathsData = [];
        let teamsSuicidesData = [];

        for(const [key, value] of Object.entries(players)){

            playerIndexes.push(parseInt(key));

            killsData.push({"name": value, "data": [0], "lastValue": 0});
            deathsData.push({"name": value, "data": [0], "lastValue": 0});
            suicidesData.push({"name": value, "data": [0], "lastValue": 0});
        }

        for(let i = 0; i < teams; i++){

            teamsKillsData.push({"name": Functions.getTeamName(i), "data": [0], "lastValue": 0});
            teamsDeathsData.push({"name": Functions.getTeamName(i), "data": [0], "lastValue": 0});
            teamsSuicidesData.push({"name": Functions.getTeamName(i), "data": [0], "lastValue": 0});
        }


        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const killerIndex = playerIndexes.indexOf(d.killer);
            const victimIndex = playerIndexes.indexOf(d.victim);

            const killerTeam = d.killer_team;
            const victimTeam = d.victim_team;


            if(victimTeam !== -1){

                teamsKillsData[killerTeam].lastValue++;
                teamsKillsData[killerTeam].data.push(teamsKillsData[killerTeam].lastValue);

                teamsDeathsData[victimTeam].lastValue++;
                teamsDeathsData[victimTeam].data.push(teamsDeathsData[victimTeam].lastValue);

                for(let x = 0; x < teams; x++){

                    if(x !== killerTeam){
                        teamsKillsData[x].data.push(teamsKillsData[x].lastValue);
                    }

                    if(x !== victimTeam){
                        teamsDeathsData[x].data.push(teamsDeathsData[x].lastValue);
                    }
                }

            }else{

                teamsSuicidesData[killerTeam].lastValue++;
                teamsSuicidesData[killerTeam].data.push(teamsSuicidesData[killerTeam].lastValue);
                teamsDeathsData[killerTeam].lastValue++;
                teamsDeathsData[killerTeam].data.push(teamsDeathsData[killerTeam].lastValue);

                for(let x = 0; x < teams; x++){

                    if(x !== killerTeam){
                        teamsSuicidesData[x].data.push(teamsSuicidesData[x].lastValue);
                        teamsDeathsData[x].data.push(teamsDeathsData[x].lastValue);
                    }
                }
            }


            //suicides
            if(victimTeam === -1){

                suicidesData[killerIndex].lastValue++;
                deathsData[killerIndex].lastValue++;
                suicidesData[killerIndex].data.push(suicidesData[killerIndex].lastValue);
                deathsData[killerIndex].data.push(deathsData[killerIndex].lastValue);

                for(let x = 0; x < playerIndexes.length; x++){

                    if(x !== killerIndex){
                        suicidesData[x].data.push(suicidesData[x].lastValue);
                        deathsData[x].data.push(deathsData[x].lastValue);
                    }
                }

            }else{

                if(killerTeam !== victimTeam){

                    killsData[killerIndex].lastValue++;
                    killsData[killerIndex].data.push(killsData[killerIndex].lastValue);

                    for(let x = 0; x < playerIndexes.length; x++){

                        if(x !== killerIndex){
                            killsData[x].data.push(killsData[x].lastValue);
                        }
                    }

                }

                deathsData[victimIndex].lastValue++;
                deathsData[victimIndex].data.push(deathsData[victimIndex].lastValue);

                for(let x = 0; x < playerIndexes.length; x++){

                    if(x !== victimIndex){
                        deathsData[x].data.push(deathsData[x].lastValue);
                    }
                }
            }
        }
        
        console.log(teamsDeathsData);

        //sort scores by lastvalue
        //sort scores by lastvalue
        //sort scores by lastvalue
        //sort scores by lastvalue
        //sort scores by lastvalue

        deathsData = this.reduceDataPoints(deathsData);
        suicidesData = this.reduceDataPoints(suicidesData);
        killsData = this.reduceDataPoints(killsData);

        teamsDeathsData = this.reduceDataPoints(teamsDeathsData);
        teamsSuicidesData = this.reduceDataPoints(teamsSuicidesData);
        teamsKillsData = this.reduceDataPoints(teamsKillsData);
        
        return {
            "deaths": deathsData, 
            "suicides": suicidesData, 
            "kills": killsData, 
            "teamDeaths": teamsDeathsData, 
            "teamKills": teamsKillsData, 
            "teamSuicides": teamsSuicidesData
        };
    }

    async getGraphData(matchId, players, totalTeams){

        const query = "SELECT timestamp,killer,victim,killer_team,victim_team FROM nstats_kills WHERE match_id=? ORDER BY timestamp ASC";
        
        const result =  await mysql.simpleQuery(query, [matchId]);

        return this.reduceTotalDataPoints(result, players, totalTeams);
    }
}

module.exports = Kills;