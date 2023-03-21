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

        await mysql.simpleQuery("UPDATE nstats_kills SET killer=? WHERE killer=?", [newId, oldId]);
        await mysql.simpleQuery("UPDATE nstats_kills SET victim=? WHERE victim=?", [newId, oldId]);
        
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

    createGraphDataType(indexes, names){

        const data = [];

        for(let i = 0; i < indexes.length; i++){

<<<<<<< Updated upstream
        let killsData = [];
        let deathsData = [];
        let suicidesData = [];
        let teammateKillsData = [];

        let teamsKillsData = [];
        let teamsDeathsData = [];
        let teamsSuicidesData = [];
        let teamsTeammateKillsData = [];

        for(const [key, value] of Object.entries(players)){

            playerIndexes.push(parseInt(key));

            killsData.push({"name": value, "data": [0], "lastValue": 0});
            deathsData.push({"name": value, "data": [0], "lastValue": 0});
            suicidesData.push({"name": value, "data": [0], "lastValue": 0});
            teammateKillsData.push({"name": value, "data": [0], "lastValue": 0});
=======
            const index = indexes[i];
            data.push({"name": names[index], "data": [0]});
>>>>>>> Stashed changes
        }

        return data;  
    }

<<<<<<< Updated upstream
            teamsKillsData.push({"name": Functions.getTeamName(i), "data": [0], "lastValue": 0});
            teamsDeathsData.push({"name": Functions.getTeamName(i), "data": [0], "lastValue": 0});
            teamsSuicidesData.push({"name": Functions.getTeamName(i), "data": [0], "lastValue": 0});
            teamsTeammateKillsData.push({"name": Functions.getTeamName(i), "data": [0], "lastValue": 0});
=======
    updateOthersGraphData(data, ignoreIndex){

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(i === ignoreIndex) continue;

            const previousValue = d.data[d.data.length - 1];
            d.data.push(previousValue);
>>>>>>> Stashed changes
        }

        return data;
    }

    updateGraphData(data, index, newValue){

        if(typeof newValue !== "string"){

            data[index].data.push(newValue);

        }else{

            const previousValue = data[index].data[data[index].data.length - 1];
            data[index].data.push(previousValue + 1);
        }

        this.updateOthersGraphData(data, index);
    }

    createGraphData(data, players, totalTeams){

        console.log(data);

        const playerIndexes = Object.keys(players).map((playerId) => parseInt(playerId));
        const teams = ["Red Team", "Blue Team", "Green Team", "Yellow Team"];
        const teamIndexes = [0,1,2,3];

        const kills = this.createGraphDataType(playerIndexes, players);
        const deaths = this.createGraphDataType(playerIndexes, players);
        const suicides = this.createGraphDataType(playerIndexes, players);
        const teamKills = this.createGraphDataType(playerIndexes, players);
        const teamTotalKills = this.createGraphDataType(teamIndexes, teams);
        const teamTotalDeaths = this.createGraphDataType(teamIndexes, teams);
        const teamTotalSuicides = this.createGraphDataType(teamIndexes, teams);
        const teamTotalTeamKills = this.createGraphDataType(teamIndexes, teams);


        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const {killer, victim} = d;
            const killerIndex = playerIndexes.indexOf(d.killer);
            const victimIndex = playerIndexes.indexOf(d.victim);
            const killerTeam = d.killer_team;
            const victimTeam = d.victim_team;

<<<<<<< Updated upstream

            if(teams > 1){
                
                if(victimTeam !== -1){

                    if(killerTeam !== victimTeam){
                        //kills
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
                        //team kills
                        teamsTeammateKillsData[killerTeam].lastValue++;
                        teamsTeammateKillsData[killerTeam].data.push(teamsTeammateKillsData[killerTeam].lastValue);

                        teamsDeathsData[victimTeam].lastValue++;
                        teamsDeathsData[victimTeam].data.push(teamsDeathsData[victimTeam].lastValue);

                        for(let x = 0; x < teams; x++){

                            if(x !== killerTeam){
                                teamsTeammateKillsData[x].data.push(teamsTeammateKillsData[x].lastValue);
                            }

                            if(x !== victimTeam){
                                teamsDeathsData[x].data.push(teamsDeathsData[x].lastValue);
                            }
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
            }


=======
>>>>>>> Stashed changes
            //suicides
            if(victimTeam === -1){
                
                this.updateGraphData(suicides, killerIndex, "++");
                this.updateGraphData(teamTotalSuicides, killerTeam, "++");
                this.updateGraphData(deaths, killerIndex, "++");
                this.updateGraphData(teamTotalDeaths, killerTeam, "++");

<<<<<<< Updated upstream
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
                    //kills
                    killsData[killerIndex].lastValue++;
                    killsData[killerIndex].data.push(killsData[killerIndex].lastValue);

                    for(let x = 0; x < playerIndexes.length; x++){

                        if(x !== killerIndex){
                            killsData[x].data.push(killsData[x].lastValue);
                        }
                    }

                }else{
                    //team kills
                    teammateKillsData[killerIndex].lastValue++;
                    teammateKillsData[killerIndex].data.push(teammateKillsData[killerIndex].lastValue);

                    for(let x = 0; x < playerIndexes.length; x++){

                        if(x !== killerIndex){
                            teammateKillsData[x].data.push(teammateKillsData[x].lastValue);
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
=======
                continue;
>>>>>>> Stashed changes
            }

            if(killer !== victim && killerTeam !== victimTeam){

                this.updateGraphData(kills, killerIndex, "++");
                this.updateGraphData(teamTotalKills, killerTeam, "++");

                this.updateGraphData(deaths, victimIndex, "++");
                this.updateGraphData(teamTotalDeaths, victimTeam, "++");

                continue;
            }

            if(killerTeam === victimTeam){

                this.updateGraphData(teamKills, killerIndex, "++");
                this.updateGraphData(teamTotalTeamKills, killerTeam, "++");

                this.updateGraphData(deaths, victimIndex, "++");
                this.updateGraphData(teamTotalDeaths, victimTeam, "++");
            }

        }

<<<<<<< Updated upstream
        const max = 50;

        deathsData = Functions.reduceGraphDataPoints(deathsData, max);
        suicidesData = Functions.reduceGraphDataPoints(suicidesData, max);
        killsData = Functions.reduceGraphDataPoints(killsData, max);
        teammateKillsData = Functions.reduceGraphDataPoints(teammateKillsData, max);

        if(teams > 1){
            teamsDeathsData = Functions.reduceGraphDataPoints(teamsDeathsData, max);
            teamsSuicidesData = Functions.reduceGraphDataPoints(teamsSuicidesData, max);
            teamsKillsData = Functions.reduceGraphDataPoints(teamsKillsData, max);
            teamsTeammateKillsData = Functions.reduceGraphDataPoints(teamsTeammateKillsData, max);
        }

        const sortByLastValue = (a, b) =>{

            a = a.lastValue;
            b = b.lastValue;

            if(a < b) return 1;
            if(a > b) return -1;
            return 0;
        }

        killsData.sort(sortByLastValue);
        deathsData.sort(sortByLastValue);
        suicidesData.sort(sortByLastValue);

        
        return {
            "deaths": deathsData, 
            "suicides": suicidesData, 
            "kills": killsData, 
            "teamDeaths": teamsDeathsData, 
            "teamKills": teamsKillsData, 
            "teamSuicides": teamsSuicidesData,
            "teammateKills": teammateKillsData,
            "teamsTeammateKills": teamsTeammateKillsData,
=======
        return {
            "deaths": deaths, 
            "suicides": suicides, 
            "kills": kills, 
            "teamDeaths": teamTotalDeaths, 
            "teamKills": teamTotalKills, 
            "teamSuicides": teamTotalSuicides,
            "teammateKills": teamKills,
            "teamsTeammateKills": teamTotalTeamKills
>>>>>>> Stashed changes
        };
    }

    async getGraphData(matchId, players, totalTeams){

        const query = "SELECT timestamp,killer,victim,killer_team,victim_team FROM nstats_kills WHERE match_id=? ORDER BY timestamp ASC";
        
        const result =  await mysql.simpleQuery(query, [matchId]);

        return this.createGraphData(result, players, totalTeams);
    }


    async getMatchKillsBetween(matchId, start, end){

        const query = `SELECT killer,killer_team,COUNT(*) as total_kills 
        FROM nstats_kills 
        WHERE match_id=? AND timestamp >= ? AND timestamp <= ?
        GROUP BY killer`;

        return await mysql.simpleQuery(query, [matchId, start, end]);
    }
}

module.exports = Kills;