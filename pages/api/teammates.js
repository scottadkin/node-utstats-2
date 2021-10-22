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


function setNames(matchesData, servers, maps, gametypes){

    for(let i = 0; i < matchesData.length; i++){

        const m = matchesData[i];

        m.serverName = (servers[m.server] !== undefined) ? servers[m.server] : "Not Found";
        m.gametypeName = (gametypes[m.gametype] !== undefined) ? gametypes[m.gametype] : "Not Found";
        m.mapName = (maps[m.map] !== undefined) ? maps[m.map] : "Not Found";
    }
}

export default async (req, res) =>{

    try{

        const playerList = (req.body.players !== undefined) ? req.body.players : [];

        const matchManager = new Matches();
        const playerManager = new Players();
        
        const bothPlayed = await playerManager.getTeamMatePlayedMatchIds(playerList);
        const matchesData = await matchManager.getTeamMateMatches(bothPlayed);

        const names = await getNames(matchesData);

        setNames(matchesData, names.serverNames, names.mapNames, names.gametypeNames);

        console.log(matchesData);

        res.status(200).json({
            "matches": matchesData
        });

    }catch(err){

        res.status(200).json({"error": err});
    }
}