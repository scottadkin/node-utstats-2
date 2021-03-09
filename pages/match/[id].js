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
import MatchItemPickups from '../../components/MatchItemPickups';
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


class PlayerFragsGraphData{

    constructor(kills, playerNames, totalTeams){

        this.kills = kills;
        this.playerNames = playerNames;
        this.totalTeams = totalTeams;

        this.createData();
        this.setData();
        this.setNames();
    }

    createData(){

        this.data = new Map();

        let current = 0;

        for(const [key, value] of Object.entries(this.playerNames)){

            current = this.data.get(parseInt(key));

            if(current === undefined){
                this.data.set(parseInt(key), {"kills": [0], "deaths": [0], "suicides": [0], "teamKills": [0]})
            }
        }


        this.teamData = [];

        if(this.totalTeams > 0){
            

            for(let i = 0; i < this.totalTeams; i++){

                this.teamData.push({
                    "name": teamNames[i],
                    "kills": [0], 
                    "deaths": [0], 
                    "suicides": [0], 
                    "teamKills": [0]
                });
            }
        }

    }

    updateOthers(ignore, type){


        for(const [key, value] of this.data){

            if(key !== ignore){

                value[type].push(value[type][value[type].length - 1]);
                this.data.set(key, {"kills": value.kills, "deaths": value.deaths, "suicides": value.suicides, "teamKills": value.teamKills});
            }
        }
    }

    teamUpdateOthers(ignore, type){

        for(let i = 0; i < this.teamData.length; i++){

            if(i !== ignore){
                this.teamData[i][type].push(this.teamData[i][type][this.teamData[i][type].length - 1]);
            }
        }
    }

    setData(){

        let k = 0;

        let currentKiller = 0;
        let currentVictim = 0;

        for(let i = 0; i < this.kills.length; i++){

            k = this.kills[i];

            if(k.victim_team === -1){

               // console.log("suicide");

                currentKiller = this.data.get(k.killer);
                currentKiller.suicides.push(currentKiller.suicides[currentKiller.suicides.length - 1] + 1);
                currentKiller.deaths.push(currentKiller.deaths[currentKiller.deaths.length - 1] + 1);


                if(this.totalTeams > 0){
                    this.teamData[k.killer_team].suicides.push(
                        this.teamData[k.killer_team].suicides[this.teamData[k.killer_team].suicides.length - 1] + 1
                    );

                    this.teamData[k.killer_team].deaths.push(
                        this.teamData[k.killer_team].deaths[this.teamData[k.killer_team].deaths.length - 1] + 1
                    );
                }

                this.data.set(k.killer,{
                    "kills": currentKiller.kills,
                    "deaths": currentKiller.deaths,
                    "suicides": currentKiller.suicides,
                    "teamKills": currentKiller.teamKills
                });

                this.updateOthers(k.killer, 'suicides');
                this.updateOthers(k.killer, 'deaths');

                if(this.totalTeams > 0){
                    this.teamUpdateOthers(k.killer_team, 'suicides');
                    this.teamUpdateOthers(k.killer_team, 'deaths');
                }

            }else if(k.killer_team === k.victim_team){

                //console.log("team kill");

                currentKiller = this.data.get(k.killer);
                currentVictim = this.data.get(k.victim);

                currentKiller.teamKills.push(currentKiller.teamKills[currentKiller.teamKills.length - 1] + 1);
                currentVictim.deaths.push(currentVictim.deaths[currentVictim.deaths.length - 1] + 1);

                if(this.totalTeams > 0){
                    
                    this.teamData[k.killer_team].teamKills.push(
                        this.teamData[k.killer_team].teamKills[this.teamData[k.killer_team].teamKills.length - 1] + 1
                    );

                    this.teamData[k.killer_team].deaths.push(
                        this.teamData[k.killer_team].deaths[this.teamData[k.killer_team].deaths.length - 1] + 1
                    );
                }

                this.updateOthers(k.killer, 'teamKills');
                this.updateOthers(k.victim, 'deaths');

                if(this.totalTeams > 0){
                    this.teamUpdateOthers(k.killer_team, 'teamKills');
                    this.teamUpdateOthers(k.killer_team, 'deaths');
                }

            }else{

                currentKiller = this.data.get(k.killer);
                currentVictim = this.data.get(k.victim);


                currentKiller.kills.push(
                    currentKiller.kills[currentKiller.kills.length - 1] + 1
                );

                if(this.totalTeams > 0){

                    this.teamData[k.killer_team].kills.push(
                        this.teamData[k.killer_team].kills[this.teamData[k.killer_team].kills.length - 1] + 1
                    );

                    this.teamData[k.victim_team].deaths.push(
                        this.teamData[k.victim_team].deaths[this.teamData[k.victim_team].deaths.length - 1] + 1
                    );

                }
                currentVictim.deaths.push(
                    currentVictim.deaths[currentVictim.deaths.length - 1] + 1 
                );

                this.data.set(k.killer,{
                    "kills": currentKiller.kills,
                    "deaths": currentKiller.deaths,
                    "suicides": currentKiller.suicides,
                    "teamKills": currentKiller.teamKills
                });

                this.data.set(k.victim,{
                    "kills": currentVictim.kills,
                    "deaths": currentVictim.deaths,
                    "suicides": currentVictim.suicides,
                    "teamKills": currentVictim.teamKills
                });

                this.updateOthers(k.killer, 'kills');
                this.updateOthers(k.victim, 'deaths');

                if(this.totalTeams > 0){

                    this.teamUpdateOthers(k.killer_team, 'kills');
                    this.teamUpdateOthers(k.victim_team, 'deaths');
                }

            }    
        }
    }

    setNames(){

        const newData = new Map();

        for(const [key, value] of this.data){

            newData.set(this.playerNames[key], value);
        }

        this.data.clear();

        this.data = newData;
    }


    get(type){

        const data = [];

        for(const [key, value] of this.data){

            data.push({
                "name": key,
                "data": value[type]
            });
        }

        data.sort((a, b) =>{

            a = a.data[a.data.length - 1];
            b = b.data[b.data.length - 1];

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        return data;
    }


    getTeamData(type){


        const data = [];

        for(let i = 0; i < this.teamData.length; i++){

            data.push({
                "name": this.teamData[i].name,
                "data": this.teamData[i][type]
            });
        }

        data.sort((a, b) =>{

            a = a.data[a.data.length - 1];
            b = b.data[b.data.length - 1];

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        return data;
    }
}



class CTFEventData{

    constructor(events, totalTeams, playerNames){

        this.events = events;
        this.totalTeams = totalTeams;
        this.playerNames = playerNames;
        this.data = [];
        this.text = [];
        this.timestamps = {};
        this.playerData = [];

        this.typeStrings = {
            "taken": "Took the flag.",
            "dropped": "Dropped the flag.",
            "returned": "Returned the flag.",
            "captured": "Captured the flag.",
            "kill": "Killed the flag carrier.",
            "cover": "Covered the flag carrier.",
            "pickedup": "Picked up the flag.",
            "save": "Saved the flag from being capped."
        }

        this.createDataObjects();
        this.setTeamData();
        this.setPlayerData();
    }

    createDataObjects(){

        this.categories = ["taken", "kill", "cover", "captured", "returned", "dropped", "save", "pickedup", "assist"];

        for(let i = 0; i < this.categories.length; i++){
            this.timestamps[this.categories[i]] = [];
        }

        let e = 0;

        for(let i = 0; i < this.events.length; i++){

            e = this.events[i];

            this.timestamps[e.event].push(e.timestamp);
        }

        for(let i = 0; i < this.totalTeams; i++){

            this.data.push({"team": teamNames[i]});

            for(let x = 0; x < this.categories.length; x++){

                this.data[i][this.categories[x]] = [0];
            }
        }

        this.playerPositions = [];

        for(const [key, value] of Object.entries(this.playerNames)){

            this.playerData.push({
                "name": value,
                "id": key
            });

            this.playerPositions.push(parseInt(key));

            for(let i = 0; i < this.categories.length; i++){

                this.playerData[this.playerData.length - 1][this.categories[i]] = [0];
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
        const text = [];

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

        let currentName = "";
        let currentString = "";
        let currentTimestamp = 0;

        for(let i = 0; i < this.data[0][type].length; i++){

            currentName = this.getPlayerChangedValue(i, type);
            currentTimestamp = Functions.MMSS(this.timestamps[type][i - 1]);

            if(this.typeStrings[type] !== undefined){
                currentString = `${currentTimestamp} ${currentName} ${this.typeStrings[type]}`;
            }else{
                currentString = `${currentTimestamp} ${currentName} type the flag`;
            }

            text.push(currentString);
        }

        return {"data": data, "text": text};
    }


    updateOthersPlayer(ignore, type){

        let currentValue = 0;

        for(let i = 0; i < this.playerData.length; i++){

            if(i !== ignore){

                currentValue = this.playerData[i][type][this.playerData[i][type].length - 1];
                this.playerData[i][type].push(currentValue);
            }
        }
    }

    setPlayerData(){

        let e = 0;

        let playerIndex = 0;

        for(let i = 0; i < this.events.length; i++){

            e = this.events[i];

            playerIndex = this.playerPositions.indexOf(e.player);

            if(playerIndex !== -1){

                this.playerData[playerIndex][e.event].push(
                    this.playerData[playerIndex][e.event][this.playerData[playerIndex][e.event].length - 1] + 1
                );

                this.updateOthersPlayer(playerIndex, e.event);
            }      
        }

    }

    getPlayerChangedValue(index, type){

        const previous = [];
        const current = [];

        let p = 0;


        for(let i = 0; i < this.playerData.length; i++){

            p = this.playerData[i];

            if(index > 0){
                previous.push(p[type][index - 1]);
                current.push(p[type][index]);
            }else{

                if(p[type][0] !== 0){
                    return p.name;
                }
            }

        }

        for(let i = 0; i < previous.length; i++){

            if(previous[i] !== current[i]){
                return this.playerData[i].name;
            }
        }

        return null;
    }

    getPlayerData(type){

        const data = [];
        const text = [];

        let p = 0;

        for(let i = 0; i < this.playerData.length; i++){

            p = this.playerData[i];
           
            data.push({"name": p.name, "data": p[type]});
        }


        let currentString = 0;
        let currentName = 0;
        let currentTimestamp = 0;

        for(let i = 0; i < this.playerData[0][type].length; i++){

            currentName = this.getPlayerChangedValue(i, type)

            currentTimestamp = Functions.MMSS(this.timestamps[type][i - 1]);

            if(this.typeStrings[type] !== undefined){
                currentString = `${currentTimestamp} ${currentName} ${this.typeStrings[type]}`;
            }else{
                currentString = `${currentTimestamp} ${currentName} type the flag`;
            }

            text.push(currentString);
        }

        data.sort((a, b) =>{

            a = a.data[a.data.length - 1];
            b = b.data[b.data.length - 1];

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }
            return 0;
        });

        return {"data": data, "text": text};
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


function createScoreHistoryGraph(score, playerNames){

    const data = new Map();
    const text = [];

    for(const [key, value] of Object.entries(playerNames)){
       
        data.set(parseInt(key), {"name": value, "data": [0]});

    }

    const updateOthers = (ignore) =>{
        
        let current = 0;

        for(const [key, value] of data){
        
            if(ignore.indexOf(key) === -1){

                current = value.data;
                current.push(value.data[value.data.length - 1]);

                data.set(key, {"name": value.name, "data": current})
            }
        }
    }


    let previousTimestamp = null;

    let current = 0;
    let updated = [];
    let s = 0;

    for(let i = 0; i < score.length; i++){

        s = score[i];

        if(i === 0) previousTimestamp = s.timestamp;

        if(s.timestamp !== previousTimestamp){
            previousTimestamp = s.timestamp;
            //update others
            updateOthers(updated);
            updated = [];
            text.push(`${Functions.MMSS(s.timestamp)}`);
        }

        updated.push(s.player);
        current = data.get(s.player);
        current.data.push(s.score);
        data.set(s.player, {"name": current.name, "data": current.data});
        
        //console.log(current);

    }

    updateOthers(updated);
    text.push(`${Functions.MMSS(score[score.length - 1].timestamp)}`);


    const arrayData = [];

    for(const [key, value] of data){

        arrayData.push({
            "name": value.name,
            "data": value.data
        });
    }


    arrayData.sort((a, b) =>{

        a = a.data[a.data.length - 1];
        b = b.data[b.data.length - 1];

        if(a > b){
            return -1;
        }else if(a < b){
            return 1;
        }

        return 0;
    });

    return {"data": arrayData, "text": text};
}

function Match({info, server, gametype, map, image, playerData, weaponData, domControlPointNames, domCapData, domPlayerScoreData, ctfCaps, ctfEvents,
    assaultData, itemData, itemNames, connections, teams, faces, killsData, scoreHistory}){

    const parsedInfo = JSON.parse(info);

    const parsedPlayerData = JSON.parse(playerData);

    scoreHistory = JSON.parse(scoreHistory);

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


    const playerScoreHistoryGraph = createScoreHistoryGraph(scoreHistory, justPlayerNames);
    elems.push(<Graph title={"Player Score History"} key={"scosococsocos-hihishis"} data={JSON.stringify(playerScoreHistoryGraph.data)} 
    text={JSON.stringify(playerScoreHistoryGraph.text)} />);

    if(bCTF(parsedPlayerData)){


        const ctfEventData = new CTFEventData(JSON.parse(ctfEvents), parsedInfo.total_teams, justPlayerNames);

        const teamFlagGrabs = ctfEventData.get('taken');
        const teamFlagCaps = ctfEventData.get('captured');
        const teamFlagKills = ctfEventData.get('kill')
        const teamFlagReturns = ctfEventData.get('returned')
        const teamFlagCovers = ctfEventData.get('cover');
        const teamFlagDrops = ctfEventData.get('dropped');
        const teamFlagSaves = ctfEventData.get('save');
        const teamFlagPickups = ctfEventData.get('pickedup');

        
        const ctfGraphData = [teamFlagGrabs.data, teamFlagCaps.data, teamFlagKills.data, 
            teamFlagReturns.data, teamFlagCovers.data, teamFlagDrops.data, teamFlagSaves.data,
            teamFlagPickups.data];

        const ctfGraphText = [teamFlagGrabs.text, teamFlagCaps.text, teamFlagKills.text, 
            teamFlagReturns.text, teamFlagCovers.text, teamFlagDrops.text, teamFlagSaves.text,
            teamFlagPickups.text];

        

        const flagGrabs = ctfEventData.getPlayerData('taken');
        const flagCaps = ctfEventData.getPlayerData('captured');
        const flagKills = ctfEventData.getPlayerData('kill')
        const flagReturns = ctfEventData.getPlayerData('returned')
        const flagCovers = ctfEventData.getPlayerData('cover');
        const flagDrops = ctfEventData.getPlayerData('dropped');
        const flagSaves = ctfEventData.getPlayerData('save');
        const flagPickups = ctfEventData.getPlayerData('pickedup');

        const ctfPlayerGraphData = [
            flagGrabs.data, flagCaps.data,  flagKills.data,
            flagReturns.data,  flagCovers.data,  flagDrops.data,
            flagSaves.data, flagPickups.data,
        ];

        const ctfPlayerGraphText = [
            flagGrabs.text, flagCaps.text,  flagKills.text,
            flagReturns.text,  flagCovers.text,  flagDrops.text,
            flagSaves.text, flagPickups.text,
        ]
            

        elems.push(
            <MatchCTFSummary key={`match_1`} players={playerData} totalTeams={parsedInfo.total_teams}/>
        );

        
        elems.push(<Graph title={["Flag Grabs", "Flag Captures", "Flag Kills", "Flag Returns", "Flag Covers", "Flag Drops", "Flag Saves", "Flag Pickups"]} key="g-1-6"
         data={JSON.stringify(ctfGraphData)} text={JSON.stringify(ctfGraphText)}/>);

        elems.push(<Graph title={["Flag Grabs", "Flag Captures", "Flag Kills", "Flag Returns", "Flag Covers", "Flag Drops", "Flag Saves", "Flag Pickups"]} key="g-1-7" 
        data={JSON.stringify(ctfPlayerGraphData)} text={JSON.stringify(ctfPlayerGraphText)}/>);

        elems.push(
            <MatchCTFCaps key={`match_1234`} players={playerData} caps={ctfCaps} matchStart={parsedInfo.start} />
        );

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

    const playerKillData = new PlayerFragsGraphData(JSON.parse(killsData), justPlayerNames, parsedInfo.total_teams);

    const killGraphData = [playerKillData.get('kills'), playerKillData.get('deaths'), playerKillData.get('suicides'), playerKillData.get('teamKills')];

    elems.push(<Graph title={["Player Kills", "Player Deaths", "Player Suicides", "Player Team Kills"]} key="g-2" data={JSON.stringify(killGraphData)}/>);

    if(parsedInfo.total_teams > 0){

        const teamKillGraphData = [playerKillData.getTeamData('kills'), playerKillData.getTeamData('deaths'), playerKillData.getTeamData('suicides'),
        playerKillData.getTeamData('teamKills')];
       
        elems.push(<Graph title={["Player Kills", "Player Deaths", "Player Suicides", "Player Team Kills"]} key="g-2-t" data={JSON.stringify(teamKillGraphData)}/>);
    }

    //elems.push(<Graph title={"Team Total Kills"} key="g-3" data={JSON.stringify(teamTotalKillsData)}/>);


    elems.push(
        <MatchSpecialEvents key={`match_4`} bTeamGame={parsedInfo.team_game} players={JSON.parse(playerData)}/>
    );

    elems.push(
        <MatchKillsMatchup key={`match_kills_matchup`} data={killsData} playerNames={playerNames}/>
    );


    elems.push(
        <MatchWeaponSummary key={`match_5`} data={JSON.parse(weaponData)} players={JSON.parse(playerNames)} bTeamGame={parsedInfo.team_game}/>
    );


    elems.push(
        <MatchItemPickups key={`item-data`} data={JSON.parse(itemData)} names={JSON.parse(itemNames)} players={JSON.parse(playerNames)} bTeamGame={parsedInfo.team_game}/>
    );

    elems.push(
        <ConnectionSummary key={`connection-data`} data={JSON.parse(connections)} playerNames={JSON.parse(playerNames)} bTeamGame={parsedInfo.team_game} 
        totalTeams={parsedInfo.total_teams}
            teamsData={JSON.parse(teams)}
        />
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

    const scoreHistory = await playerManager.getScoreHistory(matchId);



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
            "killsData": JSON.stringify(killsData),
            "scoreHistory": JSON.stringify(scoreHistory)
        }
    };

}

export default Match;