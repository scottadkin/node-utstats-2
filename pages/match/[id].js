import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/'
import Footer from '../../components/Footer/';
import MatchManager from '../../api/match';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import Gametypes from '../../api/gametypes';
import MatchSummary from '../../components/MatchSummary/'
import Player from '../../api/player';
import MatchFragSummary from '../../components/MatchFragSummary/';
import MatchSpecialEvents from '../../components/MatchSpecialEvents/';
import Weapons from '../../api/weapons';
import MatchWeaponSummary from '../../components/MatchWeaponSummary/';
import MatchCTFSummary from '../../components/MatchCTFSummary/';
import Domination from '../../api/domination';
import MatchDominationSummary from '../../components/MatchDominationSummary/';
import CTF from '../../api/ctf';
import MatchCTFCaps from '../../components/MatchCTFCaps/';
import Items from '../../api/items';
import ItemsPickups from '../../components/ItemsPickups/';
import Assault from '../../api/assault';
import MatchAssaultSummary from '../../components/MatchAssaultSummary/';
import Connections from '../../api/connections';
import ConnectionSummary from '../../components/ConnectionSummary/';
import Teams from '../../api/teams';
import TeamsSummary from '../../components/TeamsSummary/';
import Screenshot from '../../components/Screenshot/';
import Faces from '../../api/faces';
import Graph from '../../components/Graph/';
import Kills from '../../api/kills';
import MatchKillsMatchup from '../../components/MatchKillsMatchup/';
import Functions from '../../api/functions';


const teamNames = ["Red Team", "Blue Team", "Green Team", "Yellow Team"];

function bCTF(players){
  
    let p = 0;

    const vars = ['assist', 'return', 'taken', 'dropped', 'capture', 'pickup', 'cover', 'kill', 'save'];

    for(let i = 0; i < players.length; i++){

        p = players[i];

        for(let v = 0; v < vars.length; v++){

            if(p[`flag_${vars[v]}`] > 0){
                return true;
            }
        }  
    }

    return false;
}


function bDomination(players){

    for(let i = 0; i < players.length; i++){

        if(players[i].dom_caps > 0){
            return true;
        }
    }
    return false;
}

function bAssault(gametype){

    const reg = /assault/i;

    if(reg.test(gametype)){
        return true;
    }

}

function getItemsIds(items){

    const ids = [];

    for(let i = 0; i < items.length; i++){

        if(ids.indexOf(items[i].item) === -1){
            ids.push(items[i].item);
        }
    }

    return ids;
}


function createKillGraphData(kills, playerNames){

    const data = [];

    const uniquePlayers = Functions.getUniqueValues(kills,'killer');

    //console.log(uniquePlayers);

    for(let i = 0; i < uniquePlayers.length; i++){

        data.push({"name": uniquePlayers[i], "data": [0], "maxValue": 0});
    }

    const updateOthers = (ignore) =>{

        for(let i = 0; i < data.length; i++){

            if(data[i].name !== ignore){
                data[i].data.push(data[i].data[data[i].data.length - 1]);
            }
        }
    }

    //console.log(data);

    let currentIndex = 0;
    let k = 0;
    let currentValue = 0;

    for(let i = 0; i < kills.length; i++){

        k = kills[i];
        
        //victim_team === -1 means a suicide
        if(k.killer_team !== k.victim_team && k.victim_team !== -1){
            currentIndex = uniquePlayers.indexOf(k.killer);

            if(currentIndex !== -1){

                currentValue = data[currentIndex].data[data[currentIndex].data.length - 1];

                data[currentIndex].data.push(currentValue + 1);
                data[currentIndex].maxValue = currentValue + 1;

                updateOthers(k.killer);
            }
        }
    }

    data.sort((a, b) =>{

        a = a.maxValue;
        b = b.maxValue;

        if(a > b){
            return -1;
        }else if(a < b){
            return 1;
        }
        return 0;
    });

    for(let i = 0; i < data.length; i++){

        data[i].name = (playerNames[data[i].name] !== undefined) ? playerNames[data[i].name] : 'Not Found';
    }

    return data;
}


function createTeamKillData(kills, totalTeams){

    const data = [];


    for(let i = 0; i < totalTeams; i++){
        
        data.push({"name": teamNames[i], "data": [0]});
    }

    const updateOthers = (ignore) =>{

        for(let i = 0; i < data.length; i++){

            if(i !== ignore){
                data[i].data.push(data[i].data[data[i].data.length - 1]);
            }
        }
    }

    let k = 0;

    for(let i = 0; i < kills.length; i++){

        k = kills[i];

        //we dont want to count team kills
        if(k.killer_team !== k.victim_team && k.victim_team !== -1){

            data[k.killer_team].data.push(
                data[k.killer_team].data[data[k.killer_team].data.length - 1] + 1
            );

            updateOthers(k.killer_team);
        }
    }


    for(let i = 0; i < data.length; i++){

        data[i].maxValue = data[i].data[data[i].data.length - 1];
    }

    return data;

}


class CTFEventData{

    constructor(events, totalTeams){

        this.events = events;
        this.totalTeams = totalTeams;
        this.data = [];

        this.createDataObjects();
        this.setTeamData();
    }

    createDataObjects(){

        this.categories = ["taken", "kill", "cover", "captured", "returned", "dropped", "save", "pickedup", "assist"];

        for(let i = 0; i < this.totalTeams; i++){

            this.data.push({"team": teamNames[i]});

            for(let x = 0; x < this.categories.length; x++){

                this.data[i][this.categories[x]] = [0];
            }
        }
    }


    updateOthers(ignore, type){

        for(let i = 0; i < this.data.length; i++){

            if(i !== ignore){

                this.data[i][type].push(this.data[i][type][this.data[i][type].length - 1]);
            }
        }
    }

    setTeamData(){

        let e = 0;

        let currentValue = 0;

        for(let i = 0; i < this.events.length; i++){

            e = this.events[i];
            currentValue = this.data[e.team][e.event][this.data[e.team][e.event].length - 1];
            this.data[e.team][e.event].push(++currentValue);

            this.updateOthers(e.team, e.event);
           
        }
    }


    get(type){

        const data = [];

        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(d[type] !== undefined){
                data.push({
                    "name": d.team,
                    "data": d[type]
                });
            }
        }

        return data;
    }

}


function createPlayerDomScoreData(events, totalPlayers, playerNames){

    const data = new Map();


    for(const [key, value] of Object.entries(playerNames)){

        data.set(key, [0]);
    }

    const timestamps = [];
    const timestampsData = [];

    let e = 0;
    let currentIndex = 0;

    for(let i = 0; i < events.length; i++){

        e = events[i];

        currentIndex = timestamps.indexOf(e.timestamp);

        if(currentIndex === -1){

            timestamps.push(e.timestamp);

            timestampsData.push([{"player": e.player, "score": e.score}]);
        }else{
            timestampsData[currentIndex].push({"player": e.player, "score": e.score});
        }
    }

    const updateOthers = (ignore) =>{

        let currentData = [];

        for(const [key, value] of data){

            if(ignore.indexOf(parseInt(key)) === -1){

                currentData = data.get(`${key}`);
                currentData.push(currentData.length - 1);
                data.set(`${key}`, currentData);
            }
        }
    }

    let ignore = [];
    let current = 0;

    for(let i = 0; i < timestamps.length; i++){

        ignore = [];

        for(let x = 0; x < timestampsData[i].length; x++){

            ignore.push(timestampsData[i][x].player);

            current = data.get(`${timestampsData[i][x].player}`);

            if(current !== undefined){
                current.push(timestampsData[i][x].score);
                data.set(`${timestampsData[i][x].player}`, current);
            }
        }

        updateOthers(ignore);
        //update others
    }

    let arrayData = [];

    for(const [key, value] of data){

        arrayData.push({"name": (playerNames[key] !== undefined) ? playerNames[key] :'Not Found', "data": value});
    }

    return arrayData;
    
}


function createDomTeamCaps(caps, totalTeams){

    const data = [];

    for(let i = 0; i < totalTeams; i++){

        data.push({
            "name": teamNames[i],
            "data": [0]
        });
    }

    const updateOthers = (ignore) =>{

        for(let i = 0; i < data.length; i++){

            if(i !== ignore){
                data[i].data.push(
                    data[i].data[data[i].data.length - 1]
                );
            }
        }
    }


    let c = 0;

    for(let i = 0; i < caps.length; i++){

        c = caps[i];

        data[c.team].data.push(
            data[c.team].data[data[c.team].data.length - 1] + 1
        );

        updateOthers(c.team);
    }

    return data;
}


function domControlPointCaptures(names, caps){

    const data = [];
    const ids = [];

    for(let i = 0; i < names.length; i++){

        ids.push(names[i].id);

        data.push({
            "name": names[i].name,
            "data": [0]
        });
    }

    const updateOthers = (ignore) =>{
     
        for(let i = 0; i < data.length; i++){

            if(i !== ignore){

                data[i].data.push(
                    data[i].data[data[i].data.length - 1]
                );
            }
        }
    }


    let c = 0;
    let currentPointIndex = 0;

    for(let i = 0; i < caps.length; i++){

        c = caps[i];
        currentPointIndex = ids.indexOf(c.point);

        if(currentPointIndex !== -1){

            data[currentPointIndex].data.push(
                data[currentPointIndex].data[data[currentPointIndex].data.length - 1] + 1
            );

            updateOthers(currentPointIndex);
        }
    }

    return data;
}


function Match({info, server, gametype, map, image, playerData, weaponData, domControlPointNames, domCapData, domPlayerScoreData, ctfCaps, ctfEvents,
    assaultData, itemData, itemNames, connections, teams, faces, killsData}){

    const parsedInfo = JSON.parse(info);

    const parsedPlayerData = JSON.parse(playerData);

    let playerNames = [];
    const justPlayerNames = {};

    for(let i = 0; i < parsedPlayerData.length; i++){

        playerNames.push({
            "id": parsedPlayerData[i].player_id, 
            "name": parsedPlayerData[i].name, 
            "country": parsedPlayerData[i].country,
            "team": parsedPlayerData[i].team
        });

        justPlayerNames[parsedPlayerData[i].player_id] = parsedPlayerData[i].name;
    }

    playerNames = JSON.stringify(playerNames);

    const elems = [];

    elems.push(
        <MatchSummary key={`match_0`} info={info} server={server} gametype={gametype} map={map} image={image}/>
    );

    elems.push(<Screenshot 
        key={"match-sshot"} map={map} totalTeams={parsedInfo.total_teams} players={playerData} image={image} matchData={info}
        serverName={server} gametype={gametype} faces={faces}
    />);


    if(bCTF(parsedPlayerData)){

        //const ctfEventData = createCTFEventData(JSON.parse(ctfEvents), parsedInfo.total_teams);
        

        const ctfEventData = new CTFEventData(JSON.parse(ctfEvents), parsedInfo.total_teams);
        //console.log(test.getData('taken'));

        const ctfGraphData = [ctfEventData.get('taken'), ctfEventData.get('captured'), ctfEventData.get('kill'), 
            ctfEventData.get('returned'), ctfEventData.get('cover'), ctfEventData.get('dropped'), ctfEventData.get('save'),
            ctfEventData.get('pickedup')];

        

        elems.push(
            <MatchCTFSummary key={`match_1`} players={playerData} totalTeams={parsedInfo.total_teams}/>
        );


        elems.push(<Graph title={["Flag Grabs", "Flag Captures", "Flag Kills", "Flag Returns", "Flag Covers", "Flag Drops", "Flag Saves", "Flag Pickups"]} key="g-1-6" data={JSON.stringify(ctfGraphData)}/>);

        elems.push(
            <MatchCTFCaps key={`match_1234`} players={playerData} caps={ctfCaps} matchStart={parsedInfo.start} />
        );

        //console.log(ctfEventData);

        
    }

    if(bDomination(parsedPlayerData)){

        elems.push(
            <MatchDominationSummary key={`match_2`} players={playerData} totalTeams={parsedInfo.total_teams} controlPointNames={domControlPointNames} capData={domCapData}/>
        );

        const domPlayerScores = createPlayerDomScoreData(JSON.parse(domPlayerScoreData), parsedInfo.players, justPlayerNames);

        const domTeamCaps = createDomTeamCaps(JSON.parse(domCapData), parsedInfo.total_teams);


        const domControlCaps = domControlPointCaptures(JSON.parse(domControlPointNames), JSON.parse(domCapData));

        const domGraphData = [domPlayerScores, domTeamCaps, domControlCaps];

        elems.push(<Graph title={["Domination Player Scores", "Domination Team Caps", "Domination Control Caps"]} data={JSON.stringify(domGraphData)}/>);
    }

    if(bAssault(gametype)){

        elems.push(
            <MatchAssaultSummary key={`assault_data`} players={playerData} data={assaultData} matchStart={parsedInfo.start} attackingTeam={parsedInfo.attacking_team}
                redScore={parsedInfo.team_score_0} blueScore={parsedInfo.team_score_1} playerNames={playerNames}
            />
        );

    }

    elems.push(
        <MatchFragSummary key={`match_3`} bTeamGame={parsedInfo.team_game} totalTeams={parsedInfo.total_teams} playerData={playerData} matchStart={0}/>
    );

    const playerKillData = createKillGraphData(JSON.parse(killsData), justPlayerNames);
    const teamTotalKillData = createTeamKillData(JSON.parse(killsData), parsedInfo.total_teams);

    const killGraphData = [playerKillData, teamTotalKillData];

    elems.push(<Graph title={["Player Kills", "Team Total Kills"]} key="g-2" data={JSON.stringify(killGraphData)}/>);

    //elems.push(<Graph title={"Team Total Kills"} key="g-3" data={JSON.stringify(teamTotalKillsData)}/>);


    elems.push(
        <MatchSpecialEvents key={`match_4`} bTeamGame={parsedInfo.team_game} players={playerData}/>
    );

    elems.push(
        <MatchKillsMatchup key={`match_kills_matchup`} data={killsData} playerNames={playerNames}/>
    );

    

    elems.push(
        <MatchWeaponSummary key={`match_5`} data={weaponData} players={playerData} bTeamGame={parsedInfo.team_game}/>
    );

    elems.push(
        <ItemsPickups key={`item-data`} data={itemData} names={itemNames} playerNames={playerNames} bTeamGame={parsedInfo.team_game}/>
    );

    elems.push(
        <ConnectionSummary key={`connection-data`} data={connections} playerNames={playerNames} bTeamGame={parsedInfo.team_game}/>
    );

    if(parsedInfo.team_game){
        elems.push(
            <TeamsSummary key={`teams-data`} data={teams} playerNames={playerNames}/>
        );
    }

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        Match Report
                    </div>
   
                        {elems}
    
                </div>
            </div>
            <Footer />
        </main>
    </div>
}




export async function getServerSideProps({query}){

    let matchId = (query.id !== undefined) ? parseInt(query.id) : parseInt(null);

    const m = new MatchManager();

    if(matchId !== matchId){
        return {
            props: {

            }
        };
    }

    if(!await m.exists(matchId)){

        return {
            props: {

            }
        };
    }

    let matchInfo = await m.get(matchId);

    const s = new Servers();
    const serverName = await s.getName(matchInfo.server);
    const g = new Gametypes();
    const gametypeName = await g.getName(matchInfo.gametype);
    const map = new Maps();
    const mapName = await map.getName(matchInfo.map);
    const image = await map.getImage(mapName);
    const playerManager = new Player();
    const killManager = new Kills();

    let playerData = await playerManager.getAllInMatch(matchId);

    const playerIds = [];

    for(let i = 0; i < playerData.length; i++){

        playerIds.push(playerData[i].player_id);
    }

    let playerNames = await playerManager.getNames(playerIds);

    let currentName = 0;

    let playerFaces = [];

    for(let i = 0; i < playerData.length; i++){

        //playerData[i].name = 'Not Found';
        currentName = playerNames.get(playerData[i].player_id);

        if(currentName === undefined){
            currentName = 'Not Found';
        }

        playerData[i].name = currentName;

        if(playerFaces.indexOf(playerData[i].face) === -1){
            playerFaces.push(playerData[i].face);
        }
    }

    //if it's a team game sort by teams here isntead of in the components

    if(matchInfo.team_game){

        playerData.sort((a, b) =>{


            if(a.team < b.team){
                return 1;
            }else if(a.team > b.team){
                return -1;
            }else{
                if(a.score > b.score){
                    return -1;
                }else if(a.score < b.score){
                    return 1;
                }
            }

            return 0;
        });
    }

    let domControlPointNames = [];
    let domCapData = [];
    let domPlayerScoreData = [];

    if(bDomination(playerData)){

        const dom = new Domination();

        domControlPointNames = await dom.getControlPointNames(matchInfo.map);
        domCapData = await dom.getMatchCaps(matchId); 
        domPlayerScoreData = await dom.getMatchPlayerScoreData(matchId);
    }
    

    let ctfCaps = [];
    let ctfEvents = [];

    if(bCTF(playerData)){

        const CTFManager = new CTF();
        ctfCaps = await CTFManager.getMatchCaps(matchId);
        ctfEvents = await CTFManager.getMatchEvents(matchId);
        
    }

    let assaultData = [];

    const assaultManager = new Assault();

    assaultData = await assaultManager.getMatchData(matchId, matchInfo.map);

    domControlPointNames = JSON.stringify(domControlPointNames);
    domCapData = JSON.stringify(domCapData);

    playerData = JSON.stringify(playerData);


    const weaponManager = new Weapons();

    let weaponData = await weaponManager.getMatchData(matchId);

    if(weaponData === undefined) weaponData = [];

    weaponData = JSON.stringify(weaponData);

    const itemsManager = new Items();

    let itemData = await itemsManager.getMatchData(matchId);
    //console.log(itemData);

    let itemNames = [];

    const itemIds = getItemsIds(itemData);

    if(itemIds.length > 0){

        itemNames = await itemsManager.getNamesByIds(itemIds);
    }

    const connectionsManager = new Connections();
    let connectionsData = await connectionsManager.getMatchData(matchId);
    

    const teamsManager = new Teams();

    let teamsData = await teamsManager.getMatchData(matchId);


    const faceManager = new Faces();

    let pFaces = await faceManager.getFacesWithFileStatuses(playerFaces);

    const killsData = await killManager.getMatchData(matchId);


    return {
        props: {
            "info": JSON.stringify(matchInfo),
            "server": serverName,
            "gametype": gametypeName,
            "map": mapName,
            "image": image,
            "playerData": playerData,
            "weaponData": weaponData,
            "domControlPointNames": domControlPointNames,
            "domCapData": domCapData,
            "domPlayerScoreData": JSON.stringify(domPlayerScoreData),
            "ctfCaps": JSON.stringify(ctfCaps),
            "ctfEvents": JSON.stringify(ctfEvents),
            "assaultData": JSON.stringify(assaultData),
            "itemData": JSON.stringify(itemData),
            "itemNames": JSON.stringify(itemNames),
            "connections": JSON.stringify(connectionsData),
            "teams": JSON.stringify(teamsData),
            "faces": JSON.stringify(pFaces),
            "killsData": JSON.stringify(killsData)
        }
    };

}

export default Match;