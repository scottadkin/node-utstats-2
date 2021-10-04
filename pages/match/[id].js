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
//import MatchKillsMatchup from '../../components/MatchKillsMatchup/';
import MatchKillsMatchUpAlt from '../../components/MatchKillsMatchUpAlt/';
import Functions from '../../api/functions';
import Pings from '../../api/pings';
import Headshots from '../../api/headshots';
import MatchPowerUpControl from '../../components/MatchPowerUpControl/';
import MatchServerSettings from '../../components/MatchServerSettings/';
import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';
import Rankings from '../../api/rankings';
import MatchRankingChanges from '../../components/MatchRankingChanges/';
import AdminMatchControl from '../../components/AdminMatchControl/';
import Sprees from '../../api/sprees';
import MatchSprees from '../../components/MatchSprees/';
import MonsterHunt from '../../api/monsterhunt';
import MatchMonsterHuntFragSummary from '../../components/MatchMonsterHuntFragSummary/';
import MatchMonsterHuntMonsterKills from '../../components/MatchMonsterHuntMonsterKills/';
import Analytics from '../../api/analytics';
import MatchFragsGraph from '../../components/MatchFragsGraph';


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


class CTFEventData{

    constructor(events, totalTeams, playerNames, matchStart){

        this.events = events;
        this.totalTeams = totalTeams;
        this.playerNames = playerNames;
        this.data = [];
        this.text = [];
        this.timestamps = {};
        this.playerData = [];
        this.matchStart = matchStart;

        this.typeStrings = {
            "taken": "Took the flag.",
            "dropped": "Dropped the flag.",
            "returned": "Returned the flag.",
            "captured": "Captured the flag.",
            "kill": "Killed the flag carrier.",
            "cover": "Covered the flag carrier.",
            "pickedup": "Picked up the flag.",
            "save": "Saved the flag from being capped.",
            "seal": "Sealed off the base."
        }

        this.createDataObjects();
        this.setTeamData();
        this.setPlayerData();
    }

    createDataObjects(){

        this.categories = ["taken", "kill", "cover", "captured", "returned", "dropped", "save", "pickedup", "assist", "seal"];

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

            currentString = "";

            if(this.typeStrings[type] !== undefined){
                if(currentName !== null){
                    currentString = `${currentTimestamp} ${currentName} ${this.typeStrings[type]}`;
                }else{
                    currentString = "Match Start";
                }
            }else{
                if(currentName !== null){
                    currentString = `${currentTimestamp} ${currentName} type the flag`;
                }else{
                    currentString = "Match Start";
                }
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
                if(currentName !== null){
                    currentString = `${currentTimestamp} ${currentName} ${this.typeStrings[type]}`;
                }else{
                    currentString = "Match Start";
                }
            }else{
                if(currentName !== null){
                    currentString = `${currentTimestamp} ${currentName} type the flag`;
                }else{
                    currentString = "Match Start";
                }
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


function createPlayerDomScoreData(events, totalPlayers, playerNames, matchStart){

    const data = new Map();
    const text = [];

    if(events.length === 0){
        return {"data": [], "text": []};
    }
    


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
            text.push(`${Functions.MMSS(e.timestamp - matchStart)}`);
        }else{
            timestampsData[currentIndex].push({"player": e.player, "score": e.score});
        }
    }

    text.push(`${Functions.MMSS(events[events.length - 1].timestamp - matchStart)}`);

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


class DominationGraphData{

    constructor(caps, totalTeams, matchStart, pointNames, playerNames){

        this.caps = JSON.parse(caps);
        this.totalTeams = totalTeams;
        this.matchStart = matchStart;
        this.pointNames = JSON.parse(pointNames);
        this.playerNames = JSON.parse(playerNames);

        this.teams = [];

        this.text = [];
        this.teamCapData = [];
        this.controlPointData = [];
        this.playerCapData = [];

        this.createData();
    }

    getPointName(id){

        for(let i = 0; i < this.pointNames.length; i++){

            if(this.pointNames[i].id === id) return this.pointNames[i].name;
        }
        return 'Not Found';

    }

    getPointIndex(id){


        for(let i = 0; i < this.pointNames.length; i++){

            if(this.pointNames[i].id === id) return i;
        }

        return -1;
    }

    getPlayerIndex(id){

        let p = 0;

        for(let i = 0; i < this.playerCapData.length; i++){

            p = this.playerCapData[i];

            if(p.id === id){
                return i;
            }
        }

        return -1;
    }


    updateOtherTeamData(ignore){

        let t = 0;

        for(let i = 0; i < this.teamCapData.length; i++){

            if(i !== ignore){

                t = this.teamCapData[i];
                t.data.push(t.data[t.data.length - 1]);
            }
        }
    }


    updateOtherPointData(ignore){

        let c = 0;

        for(let i = 0; i < this.controlPointData.length; i++){

            if(i !== ignore){

                c = this.controlPointData[i];
                c.data.push(
                    c.data[c.data.length - 1]
                );
            }
        }
    }

    updateOtherPlayerData(ignore){

        let p = 0;

        for(let i = 0; i < this.playerCapData.length; i++){

            if(i !== ignore){

                p = this.playerCapData[i];

                p.data.push(
                    p.data[p.data.length - 1]
                );
            }
        }
    }

    createData(){


        for(let i = 0; i < this.totalTeams; i++){
            this.teamCapData.push({"name": Functions.getTeamName(i), "data": [0]});
        }

        for(let i = 0; i < this.pointNames.length; i++){
            this.controlPointData.push({"name": this.pointNames[i].name, "data": [0]});
        }

        for(let i = 0; i < this.playerNames.length; i++){

            this.playerCapData.push({"name": this.playerNames[i].name, "data": [0], "id": this.playerNames[i].id});
        }

        let c = 0;
        let currentPlayer = 0;
        let currentPointIndex = 0;
        let currentPlayerIndex = 0;

        for(let i = 0; i < this.caps.length; i++){

            c = this.caps[i];

            currentPlayer = Functions.getPlayer(this.playerNames, c.player);

            this.text.push(`${Functions.MMSS(c.time - this.matchStart)}: ${currentPlayer.name} capped ${this.getPointName(c.point)} for ${Functions.getTeamName(c.team)}`);

            this.teamCapData[c.team].data.push(
                this.teamCapData[c.team].data[this.teamCapData[c.team].data.length - 1] + 1
            );

            currentPointIndex = this.getPointIndex(c.point);

            this.controlPointData[currentPointIndex].data.push(
                this.controlPointData[currentPointIndex].data[this.controlPointData[currentPointIndex].data.length - 1] + 1
            );

            currentPlayerIndex = this.getPlayerIndex(c.player);
            
            if(currentPlayerIndex !== -1){
                this.playerCapData[currentPlayerIndex].data.push(
                    this.playerCapData[currentPlayerIndex].data[this.playerCapData[currentPlayerIndex].data.length - 1] + 1
                );
            }

            this.updateOtherTeamData(c.team);
            this.updateOtherPointData(currentPointIndex);
            this.updateOtherPlayerData(currentPlayerIndex);
        }


        this.playerCapData.sort((a, b) =>{

            a = a.data[a.data.length - 1];
            b = b.data[b.data.length - 1];

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }
            return 0;
        });

    }
}


function createScoreHistoryGraph(score, playerNames, matchStart){

    const data = new Map();
    const text = [];

    for(const [key, value] of Object.entries(playerNames)){
       
        data.set(parseInt(key), {"name": value, "data": [0]});

    }


    //Fix for Assault duplicate PlayerReplicationInfo 
    const removeDuplicates = () =>{


        score.sort((a, b) =>{

            if(a.timestamp < b.timestamp){
                return -1;
            }else if(a.timestamp > b.timestamp){
                return 1;
            }else{

                if(a.score > b.score){
                    return -1;
                }else if(a.score < b.score){
                    return 1;
                }
            }

            return 0;
        });

        const fixedData = [];

        let currentPlayerIds = [];
        let currentTimestamp = 0;

        for(let i = 0; i < score.length; i++){

            if(i === 0 || score[i].timestamp !== currentTimestamp){

                currentTimestamp = score[i].timestamp;
                currentPlayerIds = [];
            }

            if(currentPlayerIds.indexOf(score[i].player) === -1){

                currentPlayerIds.push(score[i].player);
                fixedData.push(score[i]);
            }

        }
        

        return fixedData;

    }

    score = removeDuplicates();

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
            text.push(`${Functions.MMSS(s.timestamp - matchStart)}`);    
            
        }

        updated.push(s.player);
        current = data.get(s.player);
        if(current !== undefined){
            current.data.push(s.score);
            data.set(s.player, {"name": current.name, "data": current.data});
        }
        
        //console.log(current);

    }

    updateOthers(updated);

    if(score.length > 0){
        text.push(`${Functions.MMSS(score[score.length - 1].timestamp)}`);
    }


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


class PlayerGraphPingData{

    constructor(pingEvents, playerNames, matchStart){

        this.pingEvents = JSON.parse(pingEvents);
        this.playerNames = JSON.parse(playerNames);
        this.matchStart = matchStart;

        this.maxPing = 999;

        this.createTimestamps();
        this.createData();

    }


    createTimestamps(){

        this.timestamps = [];
        this.text = [];

        let previous = null;

        let p = 0;

        for(let i = 0; i < this.pingEvents.length; i++){

            p = this.pingEvents[i];

            if(i === 0 || p.timestamp !== previous){
                this.timestamps.push(p.timestamp);
                previous = p.timestamp;
                this.text.push(Functions.MMSS(p.timestamp - this.matchStart));
            }
        }
    }


    getTimestampData(timestamp){

        const found = [];

        let p = 0;

        for(let i = 0; i < this.pingEvents.length; i++){

            p = this.pingEvents[i];

            if(p.timestamp > timestamp) break;

            if(p.timestamp === timestamp){
                found.push({"player": p.player, "ping": (p.ping < this.maxPing) ? p.ping : this.maxPing});
            }
        }

        return found;
    }

    updateOthers(ignored){

        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(ignored.indexOf(i) === -1){

                if(d.data.length > 0){

                    d.data.push(
                        d.data[d.data.length - 1]
                    );

                }else{
                    d.data.push(0);
                }
            }
        }
    }

    getPlayerIndex(id){

        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(d.id === id) return i;
        }

        return -1;
    }

    createData(){

        this.data = [];
        let p = 0;

        for(let i = 0; i < this.playerNames.length; i++){

            p = this.playerNames[i];   

            this.data.push({"name": p.name, "data": [], "id": p.id, "max": 0});
        }

        let t = 0;
        let currentData = [];
        let currentPlayerIndex = 0;
        let ignored = [];

        for(let i = 0; i < this.timestamps.length; i++){

            t = this.timestamps[i];
            ignored = [];

            currentData = this.getTimestampData(t);

            for(let x = 0; x < currentData.length; x++){

                currentPlayerIndex = this.getPlayerIndex(currentData[x].player);

                if(currentPlayerIndex !== -1){

                    this.data[currentPlayerIndex].data.push(currentData[x].ping);

                    if(this.data[currentPlayerIndex].max < currentData[x].ping){
                        this.data[currentPlayerIndex].max = currentData[x].ping;
                    } 

                    ignored.push(currentPlayerIndex);
                }       
            }    
            this.updateOthers(ignored); 
        }

        this.data.sort((a, b) =>{

            a = a.max;
            b = b.max;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }
            return 0;
        });
    }

}

function Match({navSettings, pageSettings, session, host, matchId, info, server, gametype, map, image, playerData, weaponData, domControlPointNames, domCapData, 
    domPlayerScoreData, ctfCaps, ctfEvents,
    assaultData, itemData, itemNames, connections, teams, faces, scoreHistory, pingData, headshotData, rankingChanges, currentRankings,
    rankingPositions, spreesData, bMonsterHunt, monsterHuntPlayerKillTotals, monsterImages, monsterNames}){

    //for default head open graph image
    const imageReg = /^.+\/(.+)\.jpg$/i;
    const imageRegResult = imageReg.exec(image);
    let ogImage = "maps/default";

    if(imageRegResult !== null){
        ogImage = `maps/${imageRegResult[1]}`;
    }
    //

    if(info === undefined){

        return <div>
        <DefaultHead host={host} 
            title={`Doesn't Exist! - Match Report`} 
            description={`Match does not exist.`} 
            keywords={`match,report`}
            image={ogImage}    
            />
        <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">

                <div className="default">
                    
                    <div className="default-header">Match Does Not Exist!</div>
    
                </div>
            </div>
            <Footer session={session}/>
        </main>
    </div>
    }


    const parsedInfo = JSON.parse(info);

    const parsedPlayerData = JSON.parse(playerData);

    const parsedSession = JSON.parse(session);

    pageSettings = JSON.parse(pageSettings);

    scoreHistory = JSON.parse(scoreHistory);

    let playerNames = [];
    const justPlayerNames = {};
    
    for(let i = 0; i < parsedPlayerData.length; i++){

        const p = parsedPlayerData[i];

        playerNames.push({
            "id": p.player_id, 
            "name": p.name, 
            "country": p.country,
            "team": p.team,
            "spectator": p.spectator,
            "played": p.played
        });

        justPlayerNames[parsedPlayerData[i].player_id] = parsedPlayerData[i].name;
    }

    playerNames = JSON.stringify(playerNames);

    const elems = [];


    if(pageSettings["Display Summary"] === "true"){
        elems.push(
            <MatchSummary key={`match_0`} info={info} server={server} gametype={gametype} map={map} image={image} bMonsterHunt={bMonsterHunt} 
                settings={pageSettings}
            />
        );
    }

    if(pageSettings["Display Screenshot"] === "true"){
        elems.push(<Screenshot 
            key={"match-sshot"} map={map} totalTeams={parsedInfo.total_teams} players={playerData} image={image} matchData={info}
            serverName={server} gametype={gametype} faces={faces}
        />);
    }

    if(pageSettings["Display Frag Summary"] === "true"){

        if(!parsedInfo.mh){

            elems.push(
                <MatchFragSummary key={`match_3`} totalTeams={parsedInfo.total_teams} playerData={JSON.parse(playerData)} matchStart={parsedInfo.start}
                matchId={parsedInfo.id}/>
            );

        }else{

            elems.push(
                <MatchMonsterHuntFragSummary key={`mh-frags`} playerData={JSON.parse(playerData)} matchStart={parsedInfo.start} matchId={parsedInfo.id}/>
            );
        }
    }

    if(pageSettings["Display Frags Graphs"] === "true"){

        if(!parsedInfo.mh){

            elems.push(<MatchFragsGraph key="frag-graphs" matchId={parsedInfo.id} players={justPlayerNames}/>);

            /*const playerKillData = new PlayerFragsGraphData(JSON.parse(killsData), JSON.parse(headshotData), justPlayerNames, parsedInfo.total_teams);

            const killGraphData = [playerKillData.get('kills'), playerKillData.get('deaths'), playerKillData.get('suicides'), playerKillData.get('teamKills'), playerKillData.get('headshots')];

            elems.push(<Graph title={["Kills", "Deaths", "Suicides", "Team Kills", "Headshots"]} key="g-2" data={JSON.stringify(killGraphData)}/>);

            if(parsedInfo.total_teams > 0){

                const teamKillGraphData = [playerKillData.getTeamData('kills'), playerKillData.getTeamData('deaths'), playerKillData.getTeamData('suicides'),
                playerKillData.getTeamData('teamKills'), playerKillData.getTeamData('headshots')];
            
                elems.push(<Graph title={["Kills", "Deaths", "Suicides", "Team Kills", "Headshots"]} key="g-2-t" data={JSON.stringify(teamKillGraphData)}/>);
            }*/
        }
    }

    if(bCTF(parsedPlayerData)){


        const ctfEventData = new CTFEventData(JSON.parse(ctfEvents), parsedInfo.total_teams, justPlayerNames, parsedInfo.start);

        const teamFlagGrabs = ctfEventData.get('taken');
        const teamFlagCaps = ctfEventData.get('captured');
        const teamFlagKills = ctfEventData.get('kill')
        const teamFlagReturns = ctfEventData.get('returned')
        const teamFlagCovers = ctfEventData.get('cover');
        const teamFlagDrops = ctfEventData.get('dropped');
        const teamFlagSaves = ctfEventData.get('save');
        const teamFlagPickups = ctfEventData.get('pickedup');
        const teamFlagSeals = ctfEventData.get('seal');

        
        const ctfGraphData = [teamFlagGrabs.data, teamFlagCaps.data, teamFlagKills.data, 
            teamFlagReturns.data, teamFlagCovers.data, teamFlagDrops.data, teamFlagSaves.data,
            teamFlagPickups.data, teamFlagSeals.data];

        const ctfGraphText = [teamFlagGrabs.text, teamFlagCaps.text, teamFlagKills.text, 
            teamFlagReturns.text, teamFlagCovers.text, teamFlagDrops.text, teamFlagSaves.text,
            teamFlagPickups.text, teamFlagSeals.text];

        

        const flagGrabs = ctfEventData.getPlayerData('taken');
        const flagCaps = ctfEventData.getPlayerData('captured');
        const flagKills = ctfEventData.getPlayerData('kill')
        const flagReturns = ctfEventData.getPlayerData('returned')
        const flagCovers = ctfEventData.getPlayerData('cover');
        const flagDrops = ctfEventData.getPlayerData('dropped');
        const flagSaves = ctfEventData.getPlayerData('save');
        const flagPickups = ctfEventData.getPlayerData('pickedup');
        const flagSeals = ctfEventData.getPlayerData('seal');

        const ctfPlayerGraphData = [
            flagGrabs.data, flagCaps.data,  flagKills.data,
            flagReturns.data,  flagCovers.data,  flagDrops.data,
            flagSaves.data, flagPickups.data, flagSeals.data
        ];

        const ctfPlayerGraphText = [
            flagGrabs.text, flagCaps.text,  flagKills.text,
            flagReturns.text,  flagCovers.text,  flagDrops.text,
            flagSaves.text, flagPickups.text, flagSeals.text
        ]
            
        if(pageSettings["Display Capture The Flag Summary"] === "true"){

            elems.push(
                <MatchCTFSummary key={`match_1`} session={session} players={JSON.parse(playerData)} totalTeams={parsedInfo.total_teams} matchId={parsedInfo.id}/>
            );
        }

        if(pageSettings["Display Capture The Flag Graphs"] === "true"){
        
            elems.push(<Graph title={["Flag Grabs", "Flag Captures", "Flag Kills", "Flag Returns", "Flag Covers", "Flag Drops", "Flag Saves", "Flag Pickups", "Flag Seals"]} key="g-1-6"
            data={JSON.stringify(ctfGraphData)} text={JSON.stringify(ctfGraphText)}/>);

            elems.push(<Graph title={["Flag Grabs", "Flag Captures", "Flag Kills", "Flag Returns", "Flag Covers", "Flag Drops", "Flag Saves", "Flag Pickups", "Flag Seals"]} key="g-1-7" 
            data={JSON.stringify(ctfPlayerGraphData)} text={JSON.stringify(ctfPlayerGraphText)}/>);
        }

        elems.push(
            <MatchCTFCaps key={`match_1234`} players={playerData} caps={ctfCaps} matchStart={parsedInfo.start} matchId={parsedInfo.id}/>
        );

    }


    if(bDomination(parsedPlayerData)){

        if(pageSettings["Display Domination Summary"] === "true"){
            elems.push(
                <MatchDominationSummary key={`match_2`} players={playerData} totalTeams={parsedInfo.total_teams} controlPointNames={domControlPointNames} 
                capData={domCapData}
                matchId={parsedInfo.id}
                />
            );
        }

        let domPlayerScores = [];
        let domData = [];
        let domGraphData = [];


        domPlayerScores = createPlayerDomScoreData(JSON.parse(domPlayerScoreData), parsedInfo.players, justPlayerNames, parsedInfo.start);


        domData = new DominationGraphData(domCapData, parsedInfo.total_teams, parsedInfo.start, domControlPointNames, playerNames);
        domGraphData = [domPlayerScores.data, domData.playerCapData, domData.teamCapData, domData.controlPointData];

        if(pageSettings["Display Domination Graphs"] === "true"){
            elems.push(<Graph title={["Domination Player Scores", "Domination Player Caps", "Domination Team Caps", "Domination Control Caps"]} 
            text={JSON.stringify([domPlayerScores.text, domData.text, domData.text, domData.text])} data={JSON.stringify(domGraphData)}/>);
        }
    }

    if(bAssault(gametype)){

        elems.push(
            <MatchAssaultSummary key={`assault_data`} players={playerData} data={assaultData} matchStart={parsedInfo.start} attackingTeam={parsedInfo.attacking_team}
                redScore={parsedInfo.team_score_0} blueScore={parsedInfo.team_score_1} playerNames={playerNames}
            />
        );

    }

    if(parsedInfo.mh){

        elems.push(<MatchMonsterHuntMonsterKills key={"mh-monsters"} images={JSON.parse(monsterImages)} monsterNames={JSON.parse(monsterNames)}
        playerData={JSON.parse(playerData)} monsterKills={JSON.parse(monsterHuntPlayerKillTotals)} matchId={parsedInfo.id}/>);
    }

    if(pageSettings["Display Special Events"] === "true"){
        elems.push(
            <MatchSpecialEvents key={`match_4`} bTeamGame={parsedInfo.team_game} players={JSON.parse(playerData)} matchId={parsedInfo.id}/>
        );
    }

    if(pageSettings["Display Extended Sprees"] === "true"){
        spreesData = JSON.parse(spreesData);
    
        elems.push(<MatchSprees key={"sprees"} data={spreesData} players={JSON.parse(playerNames)} matchStart={parsedInfo.start} matchId={parsedInfo.id}/>);
    }


    if(pageSettings["Display Kills Match Up"] === "true"){

        if(!parsedInfo.mh){

            elems.push(<MatchKillsMatchUpAlt key={`kills-matchup`} matchId={matchId} totalTeams={parsedInfo.total_teams} players={JSON.parse(playerNames)}/>);
            /*elems.push(
                <MatchKillsMatchup key={`match_kills_matchup`} data={killsData} playerNames={playerNames}/>
            );*/
        }
    }

    if(pageSettings["Display Powerup Control"] === "true"){
        if(!parsedInfo.mh){
            elems.push(<MatchPowerUpControl key={`match-power-control`} players={JSON.parse(playerData)} totalTeams={parsedInfo.total_teams}/>);
        }
    }


    if(pageSettings["Display Weapon Statistics"] === "true"){

        if(!parsedInfo.mh){
            elems.push(
                <MatchWeaponSummary key={`match_5`} data={JSON.parse(weaponData)} players={JSON.parse(playerNames)} totalTeams={parsedInfo.total_teams} matchId={parsedInfo.id}/>
            );
        }
    }

    if(pageSettings["Display Pickup Summary"] === "true"){
        elems.push(
            <MatchItemPickups key={`item-data`} data={JSON.parse(itemData)} names={JSON.parse(itemNames)} players={JSON.parse(playerNames)} totalTeams={parsedInfo.total_teams}
            matchId={parsedInfo.id} />
        );
    }
    
    if(pageSettings["Display Rankings"] === "true"){
        elems.push(<MatchRankingChanges key={"r-changes"} positions={rankingPositions} changes={rankingChanges} playerNames={playerNames} currentRankings={currentRankings}
        matchId={parsedInfo.id}
        />);
    }

    if(pageSettings["Display Player Ping Graph"] === "true"){
        const playerPingHistory = new PlayerGraphPingData(pingData, playerNames, parsedInfo.start);

        const playerScoreHistoryGraph = createScoreHistoryGraph(scoreHistory, justPlayerNames, parsedInfo.start);

        //if(playerScoreHistoryGraph.data[0].data.length > 2){
            const playerHistoryData = [];
            const playerHistoryDataText = [];
            const playerhistoryDataTitles = [];

            if(playerScoreHistoryGraph.data[0] !== undefined){

                if(playerScoreHistoryGraph.data[0].data.length > 2){
                    playerHistoryData.push(playerScoreHistoryGraph.data);
                    playerHistoryDataText.push(playerScoreHistoryGraph.text);
                    playerhistoryDataTitles.push("Player Score History");
                }
            }

            if(playerPingHistory.data[0] !== undefined){
                if(playerPingHistory.data[0].data.length > 0){
                    playerHistoryData.push(playerPingHistory.data);
                    playerHistoryDataText.push(playerPingHistory.text);
                    playerhistoryDataTitles.push("Player Ping History");
                }
            }

            elems.push(<Graph title={playerhistoryDataTitles} key={"scosococsocos-hihishis"} data={JSON.stringify(playerHistoryData)} 
            text={JSON.stringify(playerHistoryDataText)} />);
    }

    if(pageSettings["Display Players Connected to Server Graph"] === "true"){
        elems.push(
            <ConnectionSummary key={`connection-data`} data={JSON.parse(connections)} playerNames={JSON.parse(playerNames)} bTeamGame={parsedInfo.team_game} 
            totalTeams={parsedInfo.total_teams} matchStart={parsedInfo.start}
                teamsData={JSON.parse(teams)}
            />
        );
    }

    if(pageSettings["Display Team Changes"] === "true"){

        if(!parsedInfo.mh){
            if(parsedInfo.team_game){
                elems.push(
                    <TeamsSummary key={`teams-data`} data={teams} playerNames={playerNames} matchId={parsedInfo.id}/>
                );
            }
        }
    }

    if(pageSettings["Display Server Settings"] === "true"){
        elems.push(<MatchServerSettings key={"server-settings"} info={JSON.parse(info)}/>);
    }
    

    const dateString = Functions.convertTimestamp(parsedInfo.date, true);


    const titleElem = (pageSettings["Display Match Report Title"] === "true") ? 
    <div className="default-header">Match Report</div> 
    : null;


    if(parsedSession["bLoggedIn"]){
        elems.push(<AdminMatchControl key={"a-c"} matchId={parsedInfo.id} players={playerNames} mapId={parsedInfo.map}/>);
    }

    return <div>
        <DefaultHead host={host} 
            title={`${map} (${dateString}) Match Report`} 
            description={`Match report for ${map} (${gametype}${(parsedInfo.insta) ? " Instagib" : ""}) 
            played on ${server} at ${dateString}, total players ${parsedInfo.players}, match length ${Functions.MMSS(parsedInfo.playtime)}.`} 
            keywords={`match,report,${map},${gametype},${server}`}
            image={ogImage}    
            />
        <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">

                <div className="default">

                        {titleElem}
                        
                        {elems}
    
                </div>
            </div>
            <Footer session={session}/>
        </main>
    </div>
}




export async function getServerSideProps({req, query}){

    let matchId = (query.id !== undefined) ? parseInt(query.id) : parseInt(null);

    const session = new Session(req);

	await session.load();

    const settings = new SiteSettings();
    const pageSettings = await settings.getCategorySettings("Match Pages");
    const navSettings = await settings.getCategorySettings("Navigation");

   // console.log(pageSettings);

    const m = new MatchManager();

    if(matchId !== matchId){

        return {

            props: {
                "session": JSON.stringify(session.settings),
                "navSettings": JSON.stringify(navSettings),
                "pageSettings": JSON.stringify(pageSettings),
            }
        };
    }

    if(!await m.exists(matchId)){

        return {
            props: {
                "session": JSON.stringify(session.settings),         
                "navSettings": JSON.stringify(navSettings),
                "pageSettings": JSON.stringify(pageSettings),
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
        
        if(pageSettings["Display Domination Summary"] === "true" || pageSettings["Display Domination Graphs"]){
            domCapData = await dom.getMatchCaps(matchId); 
        }

        if(pageSettings["Display Domination Graphs"] === "true"){
            domPlayerScoreData = await dom.getMatchPlayerScoreData(matchId);
        }
    }
    

    let ctfCaps = [];
    let ctfEvents = [];

    if(bCTF(playerData)){

        const CTFManager = new CTF();
        
        if(pageSettings["Display Capture The Flag Caps"] === "true"){
            ctfCaps = await CTFManager.getMatchCaps(matchId);
        }

        if(pageSettings["Display Capture The Flag Graphs"] === "true"){
            ctfEvents = await CTFManager.getMatchEvents(matchId);
        }
        
    }

    let assaultData = [];

    const assaultManager = new Assault();


    if(pageSettings["Display Assault Summary"] === "true"){
        assaultData = await assaultManager.getMatchData(matchId, matchInfo.map);
    }

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

   // const killsData = await killManager.getMatchData(matchId);

    const scoreHistory = await playerManager.getScoreHistory(matchId);


    const pingManager = new Pings();

    const pingData = await pingManager.getMatchData(matchId);


    const headshotsManager = new Headshots();

    const headshotData = await headshotsManager.getMatchData(matchId);

    

    const rankingsManager = new Rankings();

    let rankingChanges = [];
    let currentRankings = [];
    let rankingPositions = {};
    

    if(pageSettings["Display Rankings"] === "true"){

        rankingChanges = await rankingsManager.getMatchRankingChanges(matchId);
        currentRankings = await rankingsManager.getCurrentPlayersRanking(playerIds, matchInfo.gametype);

        for(let i = 0; i < currentRankings.length; i++){

            rankingPositions[currentRankings[i].player_id] = await rankingsManager.getGametypePosition(currentRankings[i].ranking, matchInfo.gametype);
        }
    }


    let spreesData = [];

    if(pageSettings["Display Extended Sprees"] === "true"){
        const spreesManager = new Sprees();
        spreesData = await spreesManager.getMatchData(matchId);
    }


    let monsterHuntKills = [];
    let monsterHuntPlayerKillTotals = [];
    let monsterImages = [];
    let monsterNames = [];

    if(matchInfo.mh){

        const monsterHuntManager = new MonsterHunt();

        monsterHuntPlayerKillTotals = await monsterHuntManager.getPlayerMatchKillTotals(matchId);

        const monsterIds = [];

        for(let i = 0; i < monsterHuntPlayerKillTotals.length; i++){

            if(monsterIds.indexOf(monsterHuntPlayerKillTotals[i].monster) === -1){

                monsterIds.push(monsterHuntPlayerKillTotals[i].monster);
            }
        }

        monsterNames = await monsterHuntManager.getMonsterNames(monsterIds);

        const monsterClasses = [];

        for(let i = 0; i < monsterNames.length; i++){

            if(monsterClasses.indexOf(monsterNames[i].class_name) === -1){

                monsterClasses.push(monsterNames[i].class_name);
            }
        }

        monsterImages = monsterHuntManager.getImages(monsterClasses);

        //console.log(monsterNames);

    }

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

    return {
        props: {
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings),
            "session": JSON.stringify(session.settings),
            "host": req.headers.host,
            "matchId": matchId,
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
            //"killsData": JSON.stringify(killsData),
            "scoreHistory": JSON.stringify(scoreHistory),
            "pingData": JSON.stringify(pingData),
            "headshotData": JSON.stringify(headshotData),
            "rankingChanges": JSON.stringify(rankingChanges),
            "currentRankings": JSON.stringify(currentRankings),
            "rankingPositions": JSON.stringify(rankingPositions),
            "spreesData": JSON.stringify(spreesData),
            "bMonsterHunt": matchInfo.mh,
            "monsterHuntPlayerKillTotals": JSON.stringify(monsterHuntPlayerKillTotals),
            "monsterImages": JSON.stringify(monsterImages),
            "monsterNames": JSON.stringify(monsterNames)
        }
    };

}

export default Match;