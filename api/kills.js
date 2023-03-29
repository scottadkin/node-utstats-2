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
        await mysql.simpleQuery("UPDATE nstats_tele_frags SET killer_id=? WHERE killer_id=?", [newId, oldId]);
        await mysql.simpleQuery("UPDATE nstats_tele_frags SET victim_id=? WHERE victim_id=?", [newId, oldId]);
        
    }

    async deletePlayer(player){

        await mysql.simpleDelete("DELETE FROM nstats_kills WHERE (killer = ?) OR (victim = ?)", [player, player]);
        await mysql.simpleDelete("DELETE FROM nstats_tele_frags WHERE (killer_id = ?) OR (victim_id = ?)", [player, player]);
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

            const index = indexes[i];
            data.push({"name": names[index], "data": [0]});
        }

        return data;  
    }

    updateOthersGraphData(data, ignoreIndexes){

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(ignoreIndexes.indexOf(i) !== -1) continue;

            const previousValue = d.data[d.data.length - 1];
            d.data.push(previousValue);
        }

        return data;
    }

    updateGraphData(data, index, newValue, bSkipUpdatedOthers){

        if(bSkipUpdatedOthers === undefined) bSkipUpdatedOthers = false;

        if(typeof newValue !== "string"){

            data[index].data.push(newValue);

        }else{

            const previousValue = data[index].data[data[index].data.length - 1];
            data[index].data.push(previousValue + 1);
        }

        if(!bSkipUpdatedOthers){
            this.updateOthersGraphData(data, [index]);
        }
    }

    getCurrentGraphDataValue(data, index){
        
        return data[index].data[data[index].data.length - 1];
    }

    calculateEfficiency(kills, deaths){

        if(kills > 0){

            if(deaths > 0){
                return parseFloat(((kills / (deaths + kills)) * 100).toFixed(2));
            }

            return 100;
        }

        return 0;
    }

    createGraphData(data, players, totalTeams){

        const playerIndexes = Object.keys(players).map((playerId) => parseInt(playerId));
        const teams = ["Red Team", "Blue Team", "Green Team", "Yellow Team"];
        const teamIndexes = [0,1,2,3];

        const kills = this.createGraphDataType(playerIndexes, players);
        const deaths = this.createGraphDataType(playerIndexes, players);
        const suicides = this.createGraphDataType(playerIndexes, players);
        const teamKills = this.createGraphDataType(playerIndexes, players);
        const efficiency = this.createGraphDataType(playerIndexes, players);

        const teamTotalKills = this.createGraphDataType(teamIndexes, teams);
        const teamTotalDeaths = this.createGraphDataType(teamIndexes, teams);
        const teamTotalSuicides = this.createGraphDataType(teamIndexes, teams);
        const teamTotalTeamKills = this.createGraphDataType(teamIndexes, teams);
        const teamEfficiency = this.createGraphDataType(teamIndexes, teams);


        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const {killer, victim} = d;
            const killerIndex = playerIndexes.indexOf(d.killer);
            const victimIndex = playerIndexes.indexOf(d.victim);
            const killerTeam = d.killer_team;
            const victimTeam = d.victim_team;

          
            if(killer === victim){
                
                this.updateGraphData(suicides, killerIndex, "++");
                this.updateGraphData(deaths, killerIndex, "++");

                if(totalTeams > 1){
                    this.updateGraphData(teamTotalSuicides, killerTeam, "++");
                    this.updateGraphData(teamTotalDeaths, killerTeam, "++");
                }

            }else if(killerTeam !== victimTeam || totalTeams < 2){

                this.updateGraphData(kills, killerIndex, "++");
                this.updateGraphData(deaths, victimIndex, "++");

                if(totalTeams > 1){
                    this.updateGraphData(teamTotalKills, killerTeam, "++");
                    this.updateGraphData(teamTotalDeaths, victimTeam, "++");
                }

            }else if(killerTeam === victimTeam && totalTeams > 1){

                this.updateGraphData(teamKills, killerIndex, "++");
                this.updateGraphData(deaths, victimIndex, "++");

                if(totalTeams > 1){
                    this.updateGraphData(teamTotalTeamKills, killerTeam, "++");
                    this.updateGraphData(teamTotalDeaths, victimTeam, "++");
                }
            }

            const killerKills = this.getCurrentGraphDataValue(kills, killerIndex);
            const killerDeaths = this.getCurrentGraphDataValue(deaths, killerIndex);
            const killerEfficiency = this.calculateEfficiency(killerKills, killerDeaths);
            this.updateGraphData(efficiency, killerIndex, killerEfficiency, true);

            if(totalTeams > 1){
                const killerTeamKills = this.getCurrentGraphDataValue(teamTotalKills, killerTeam);
                const killerTeamDeaths = this.getCurrentGraphDataValue(teamTotalDeaths, killerTeam);
                const killerTeamEfficiency = this.calculateEfficiency(killerTeamKills, killerTeamDeaths);
                this.updateGraphData(teamEfficiency, killerTeam, killerTeamEfficiency, killerTeam !== victimTeam);
            }

            const ignoreEfficiencyIndexes = [killerIndex];
            const ignoreTeamEfficiencyIndexes = [killerTeam];


            if(victim !== killer){

                const victimKills = this.getCurrentGraphDataValue(kills, victimIndex);
                const victimDeaths = this.getCurrentGraphDataValue(deaths, victimIndex);

                const victimEfficiency = this.calculateEfficiency(victimKills, victimDeaths);
                this.updateGraphData(efficiency, victimIndex, victimEfficiency, true);

                if(totalTeams > 1){
                    const victimTeamKills = this.getCurrentGraphDataValue(teamTotalKills, victimTeam);
                    const victimTeamDeaths = this.getCurrentGraphDataValue(teamTotalDeaths, victimTeam);
                    const victimTeamEfficiency = this.calculateEfficiency(victimTeamKills, victimTeamDeaths);
                    this.updateGraphData(teamEfficiency, victimTeam, victimTeamEfficiency, true);
                }

                ignoreEfficiencyIndexes.push(victimIndex);
                ignoreTeamEfficiencyIndexes.push(victimTeam);
                
            }


            this.updateOthersGraphData(efficiency, ignoreEfficiencyIndexes);
            if(totalTeams > 1){
                this.updateOthersGraphData(teamEfficiency, ignoreTeamEfficiencyIndexes);
            }
        }

        const maxDataPoints = 50;

        return {
            "deaths": Functions.reduceGraphDataPoints(deaths, maxDataPoints), 
            "suicides": Functions.reduceGraphDataPoints(suicides, maxDataPoints),
            "kills": Functions.reduceGraphDataPoints(kills, maxDataPoints),
            "teamDeaths": Functions.reduceGraphDataPoints(teamTotalDeaths, maxDataPoints),
            "teamKills": Functions.reduceGraphDataPoints(teamTotalKills, maxDataPoints),
            "teamSuicides": Functions.reduceGraphDataPoints(teamTotalSuicides,maxDataPoints),
            "teammateKills": Functions.reduceGraphDataPoints(teamKills,maxDataPoints),
            "teamsTeammateKills": Functions.reduceGraphDataPoints(teamTotalTeamKills,maxDataPoints),
            "efficiency": Functions.reduceGraphDataPoints(efficiency, maxDataPoints),
            "teamEfficiency": Functions.reduceGraphDataPoints(teamEfficiency, maxDataPoints)
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

    async insertTeleFrag(matchId, mapId, gametypeId, data){

        const query = `INSERT INTO nstats_tele_frags VALUES(NULL,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            matchId,
            mapId, 
            gametypeId,
            data.timestamp,
            data.killerId,
            data.killerTeam,
            data.victimId,
            data.victimTeam,
            data.bDiscKill
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async insertTeleFrags(matchId, mapId, gametypeId, teleFrags){
        

        for(let i = 0; i < teleFrags.length; i++){

            const t = teleFrags[i];

            await this.insertTeleFrag(matchId, mapId, gametypeId, t);
        }
    }
}

module.exports = Kills;