import Matches from '../../api/matches';
import Players from '../../api/players';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import Gametypes from '../../api/gametypes';

async function getNames(matchesData){

    const serverManager = new Servers();
    const mapManager = new Maps();
    const gametypeManager = new Gametypes();

    const uniqueServers = [];
    const uniqueMaps = [];
    const uniqueGametypes = [];

    for(let i = 0; i < matchesData.length; i++){

        const m = matchesData[i];

        if(uniqueServers.indexOf(m.server) === -1) uniqueServers.push(m.server);
        if(uniqueMaps.indexOf(m.map) === -1) uniqueMaps.push(m.map);
        if(uniqueGametypes.indexOf(m.gametype) === -1) uniqueGametypes.push(m.gametype);
        
    }

    const serverNames = await serverManager.getNames(uniqueServers);
    const mapNames = await mapManager.getNames(uniqueMaps);
    const gametypeNames = await gametypeManager.getNames(uniqueGametypes);

    return {"serverNames": serverNames, "mapNames": mapNames, "gametypeNames": gametypeNames};

}


function setNames(matchesData, teams, servers, maps, gametypes){

    for(let i = 0; i < matchesData.length; i++){

        const m = matchesData[i];

        m.serverName = (servers[m.server] !== undefined) ? servers[m.server] : "Not Found";
        m.gametypeName = (gametypes[m.gametype] !== undefined) ? gametypes[m.gametype] : "Not Found";
        m.mapName = (maps[m.map] !== undefined) ? maps[m.map] : "Not Found";
        m.dm_winner = "";
        m.dm_score = "";
        m.playersTeam = (teams[m.id] !== undefined) ? teams[m.id] : -1;
    }
}

function setPlayedCount(playedMatchIds){

    const playedCount = {};
   
    for(const [key, value] of Object.entries(playedMatchIds)){

        for(let i = 0; i < value.length; i++){

            const v = value[i];

            if(playedCount[v] === undefined){
                playedCount[v] = 0;
            }

            playedCount[v]++;
            
        }   
    }

    return playedCount;

}

function removeNotPlayedTogether(playedMatches, minPlayersNeeded){

    const allPlayed = [];

    for(const [key, value] of Object.entries(playedMatches)){

        if(value >= minPlayersNeeded){
            allPlayed.push(parseInt(key));
        }
    }

    return allPlayed;
}

export default async (req, res) =>{

    try{

        const playerList = (req.body.players !== undefined) ? req.body.players : [];
        const playerAliases = (req.body.aliases !== undefined) ? req.body.aliases : {};

        const allPlayers = [...playerList];

        for(let i = 0; i < playerAliases.length; i++){

            allPlayers.push(...playerAliases[i]);
        }

        const matchManager = new Matches();
        const playerManager = new Players();

        const playedMatchIds = {};

        for(let i = 0; i < playerList.length; i++){

            const currentMatches = await playerManager.getMuliplePlayersPlayedMatches([playerList[i], ...playerAliases[i]]);

            playedMatchIds[playerList[i]] = await matchManager.returnOnlyTeamGames(currentMatches);

        }
        
        const playedCount = setPlayedCount(playedMatchIds);

        const allPlayed = removeNotPlayedTogether(playedCount, playerList.length);


        const validMatches = [];
        const validMatchesTeams = {};

        for(let i = 0; i < allPlayed.length; i++){

            const current = await matchManager.bAllPlayedOnSameTeam(allPlayed[i], allPlayers);

            if(current.sameTeam){

                validMatches.push(allPlayed[i]);

                validMatchesTeams[allPlayed[i]] = current.team;
            }
        }

        const matchesData = await matchManager.getTeamMateMatchesBasic(validMatches);

        const names = await getNames(matchesData);

        setNames(matchesData, validMatchesTeams, names.serverNames, names.mapNames, names.gametypeNames);


     
        const totals = await playerManager.getTeamsMatchesTotals(allPlayers, validMatches);

        res.status(200).json({
            "matches": matchesData,
            "totals": totals,
            "mapNames": names.mapNames,
            "gametypes": names.gametypeNames
        });

        return;

    }catch(err){

        console.trace(err);

        res.status(200).json({"error": err});
    }
}