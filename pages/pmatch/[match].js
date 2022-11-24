import React from "react";
import DefaultHead from "../../components/defaulthead";
import Nav from '../../components/Nav/';
import Footer from "../../components/Footer/";
import Session from '../../api/session';
import Sitesettings from '../../api/sitesettings';
import Match from '../../api/match';
import Gametypes from '../../api/gametypes';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import MatchSummary from "../../components/MatchSummary";
import Player from "../../api/player";
import Players from "../../api/players";
import Functions from '../../api/functions';
import Screenshot from '../../components/Screenshot/';
import Faces from '../../api/faces';
import MatchFragSummary from "../../components/MatchFragSummary";
import MatchSpecialEvents from "../../components/MatchSpecialEvents";
import MatchSprees from '../../components/MatchSprees';
import PlayerMatchPowerUps from "../../components/PlayerMatchPowerUps";
import Weapons from '../../api/weapons';
import PlayerMatchWeapons from "../../components/PlayerMatchWeapons";
import PlayerMatchPickups from "../../components/PlayerMatchPickups";
import Items from '../../api/items';
import Rankings from '../../api/rankings';
import PlayerMatchRankings from '../../components/PlayerMatchRankings/';
import Pings from '../../api/pings';
import PlayerMatchPing from "../../components/PlayerMatchPing";
import Connections from "../../api/connections";
import PlayerMatchConnections from "../../components/PlayerMatchConnections";
import Teams from "../../api/teams";
import PlayerMatchTeamChanges from "../../components/PlayerMatchTeamChanges";
import MatchPlayerViewProfile from "../../components/MatchPlayerViewProfile";
import CTF from '../../api/ctf';
import PlayerMatchCTF from '../../components/PlayerMatchCTF';
import Domination from '../../api/domination';
import PlayerMatchDomination from '../../components/PlayerMatchDomination';
import Assault from '../../api/assault';
import PlayerMatchAssault from '../../components/PlayerMatchAssault';
import MatchMonsterHuntFragSummary from "../../components/MatchMonsterHuntFragSummary";
import Analytics from "../../api/analytics";
import MatchMonsterHuntMonsterKills from "../../components/MatchMonsterHuntMonsterKills";
import CombogibPlayerMatch from "../../components/CombogibPlayerMatch";
import ErrorMessage from "../../components/ErrorMessage";
import ErrorPage from "../ErrorPage";



class PlayerMatch extends React.Component{

    constructor(props){

        super(props);

    }

    cleanImageURL(input){

        const reg = /^\/images\/(.+)$/i;

        const result = reg.exec(input);

        if(result !== null){

            return result[1];
        }
        return input;
    }


    renderError(){
        
        return <div>
            <DefaultHead 
                host={this.props.host} 
                title={`Error! Match Report`} 
                description={`Error`} 
                keywords={`error`}
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">Match Report</div>
                        <ErrorMessage title="Match Report" text={this.props.error}/>
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }

    render(){

        if(this.props.pageLoadError !== undefined){
            return <ErrorPage>{this.props.pageLoadError}</ErrorPage>
        }

        if(this.props.error !== undefined){
            return this.renderError();     
        }

        const info = JSON.parse(this.props.info);
        const playerData = JSON.parse(this.props.playerData);


        let titleName = playerData.name;
        titleName+=(titleName[titleName.length - 1] == "s") ? "'" : "'s";

        const dateString = Functions.convertTimestamp(info.date, true);

        const parsedInfo = JSON.parse(this.props.info);

        const playerMatchData = JSON.parse(this.props.playerMatchData);

        const compactDate = Functions.DDMMYY(info.date, true);

        const domPointNames = JSON.parse(this.props.domPointNames);
        const playerDomCaps = JSON.parse(this.props.playerDomCaps);

        const imageHost = Functions.getImageHostAndPort(this.props.host);

        const elems = [];

        const pageSettings = this.props.pageSettings;
        const pageOrder = this.props.pageOrder;

        if(pageSettings["Display Combogib Stats"] === "true"){
            elems[pageOrder["Display Combogib Stats"]] = <CombogibPlayerMatch key="combo" matchId={parsedInfo.id} playerId={playerData.player_id}/>;
        }

        if(pageSettings["Display Screenshot"] ==="true"){

            elems[pageOrder["Display Screenshot"]] = <Screenshot 
                key="sshot"
                host={imageHost}
                map={this.props.map} 
                totalTeams={parsedInfo.total_teams} 
                players={this.props.players} 
                image={this.props.mapImage} 
                matchData={this.props.info} 
                serverName={this.props.server} 
                gametype={this.props.gametype} 
                faces={this.props.faces}
                highlight={playerData.name}
            />
        }


        if(pageSettings["Display Frag Summary"] === "true"){

            if(parsedInfo.mh){

                elems[pageOrder["Display Frag Summary"]] = <MatchMonsterHuntFragSummary key="frag-summary" single={true} matchStart={parsedInfo.start} playerData={[playerMatchData]}/>;
            
            }else{

                elems[pageOrder["Display Frag Summary"]] = <MatchFragSummary key="frag-summary"
                    playerData={[playerMatchData]} 
                    totalTeams={parsedInfo.total_teams}
                    matchStart={parsedInfo.start}
                    single={true}
                    
                />
            }
        }



        if(parsedInfo.mh && pageSettings["Display MonsterHunt Kills"] === "true"){


            elems[pageOrder["Display MonsterHunt Kills"]] = <MatchMonsterHuntMonsterKills 
                key={"mh-monsters"} 
                playerData={playerData} 
                matchId={parsedInfo.id}
                playerId={playerData.player_id}
            />;
        }

        if(this.props.bCTF){

            if(pageSettings["Display Capture The Flag Summary"] === "true"){
                elems[pageOrder["Display Capture The Flag Summary"]] = <PlayerMatchCTF 
                    key="ctf-sum"
                    player={playerMatchData} 
                    playerData={this.props.players} 
                    caps={this.props.ctfCaps} 
                    matchId={parsedInfo.id} 
                    matchStart={parsedInfo.start}
                />
            }
        } 
            
        

        if(pageSettings["Display Domination Summary"] === "true"){

            elems[pageOrder["Display Domination Summary"]] = <PlayerMatchDomination key="dom-sum" pointNames={domPointNames} data={playerDomCaps}/>
        }

        if(pageSettings["Display Assault Summary"] === "true"){

            elems[pageOrder["Display Assault Summary"]] = <PlayerMatchAssault key={"ass-sum"} 
                pointNames={this.props.assaultObjNames} caps={this.props.playerAssaultCaps}
            />;
        }
        

        if(pageSettings["Display Special Events"] === "true"){

            elems[pageOrder["Display Special Events"]] = <MatchSpecialEvents key="s-e" bTeamGame={parsedInfo.team_game} players={[playerMatchData]} single={true}/>;
        }

        if(pageSettings["Display Extended Sprees"] === "true"){

            elems[pageOrder["Display Extended Sprees"]] = <MatchSprees host={imageHost} key="m-e-s" 
                playerId={playerMatchData.player_id} matchId={parsedInfo.id} players={JSON.parse(this.props.playerNames)} matchStart={parsedInfo.start}
            />

        }

        if(pageSettings["Display Powerup Control"] === "true"){

            elems[pageOrder["Display Powerup Control"]] = <PlayerMatchPowerUps 
                key="p-m-pu"
                belt={playerMatchData.shield_belt} 
                amp={playerMatchData.amp}
                ampTime={playerMatchData.amp_time}
                invisibility={playerMatchData.invisibility}
                invisibilityTime={playerMatchData.invisibility_time}
                pads={playerMatchData.pads}
                armor={playerMatchData.armor}
                boots={playerMatchData.boots}
                superHealth={playerMatchData.super_health}
            />
        }


        if(!parsedInfo.mh && pageSettings["Display Weapon Statistics"] === "true"){

            elems[pageOrder["Display Weapon Statistics"]] = <PlayerMatchWeapons 
                key="pmw"
                data={JSON.parse(this.props.playerWeaponData)}
                names={JSON.parse(this.props.weaponNames)}
            />
        }


        if(pageSettings["Display Pickup Summary"] === "true"){

            elems[pageOrder["Display Pickup Summary"]] = <PlayerMatchPickups 
                data={JSON.parse(this.props.pickupData)}
                names={JSON.parse(this.props.pickupNames)}
            />
        }

        if(pageSettings["Display Rankings"] === "true"){

            elems[pageOrder["Display Rankings"]] = <PlayerMatchRankings key="pmr" data={JSON.parse(this.props.rankingData)}
                current={JSON.parse(this.props.rankingData)} 
                currentPosition={this.props.currentRankingPosition}
            />
        }

        if(pageSettings["Display Player Ping Graph"] === "true"){

            elems[pageOrder["Display Player Ping Graph"]] = <PlayerMatchPing key="pmp-g" data={JSON.parse(this.props.pingData)}/>
        }


        if(pageSettings["Display Team Changes"] === "true"){

            elems[pageOrder["Display Team Chagnes"]] = <PlayerMatchTeamChanges key="ptc" data={JSON.parse(this.props.teamData)} matchStart={parsedInfo.start}/>
        }

        if(pageSettings["Display Players Connected to Server Graph"] === "true"){

            elems[pageOrder["Display Players Connected to Server Graph"]] = <PlayerMatchConnections key="pmcc" data={JSON.parse(this.props.connectionsData)} matchStart={parsedInfo.start}/>
        }

        return <div>
            <DefaultHead 
                host={this.props.host} 
                title={`${titleName} Match Report ${compactDate} ${this.props.map}`} 
                description={`${titleName} match report for ${this.props.map} (${this.props.gametype}${(info.insta) ? " Instagib" : ""}) ${dateString}.`} 
                keywords={`match,report,player,${playerData.name},${this.props.map},${this.props.gametype}`}
                image={this.cleanImageURL(this.props.cleanMapImage)}    
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">{titleName} Match Report</div>

                        <MatchPlayerViewProfile host={imageHost} data={playerData} matchId={parsedInfo.id}/>

                        <MatchSummary 
                            info={this.props.info} 
                            server={this.props.server} 
                            gametype={this.props.gametype}
                            map={this.props.map} 
                            image={this.props.mapImage}
                            bMonsterHunt={parsedInfo.mh}
                            settings={this.props.pageSettings}
                        />

                        {elems}

                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}

export async function getServerSideProps({req, query}){


    try{

        let matchId = -1;
        let playerId = -1;

        if(query.match !== undefined){

            matchId = parseInt(query.match);

            if(matchId !== matchId) matchId = -1;
        }

        if(query.player !== undefined){

            playerId = parseInt(query.player);

            if(playerId !== playerId) playerId = -1;
        }
        

        const session = new Session(req);

        await session.load();

        const settings = new Sitesettings();

        const navSettings = await settings.getCategorySettings("Navigation");
        const pageSettings = await settings.getCategorySettings("Match Pages");
        const pageOrder = await settings.getCategoryOrder("Match Pages");

        const matchManager = new Match();

        const bMatchExist = await matchManager.exists(matchId);

        if(!bMatchExist){
            return {
                "props": {
                    "host": req.headers.host,
                    "session": JSON.stringify(session.settings),
                    "navSettings": JSON.stringify(navSettings),
                    "pageSettings": JSON.stringify(pageSettings),
                    "error": `There is no match with the id of ${matchId}.`
                }
            };
        }


        const info = await matchManager.get(matchId);

        const gametypeManager = new Gametypes();
        const gametypeName = await gametypeManager.getName(info.gametype);
        const serverManager = new Servers();
        const serverName = await serverManager.getName(info.server);
        const mapManager = new Maps();
        const mapName = await mapManager.getName(info.map);

        const playerManager = new Player();

        const bPlayerInMatch = await playerManager.bPlayerInMatch(playerId, matchId);
        

        if(!bPlayerInMatch){
            return {
                "props": {
                    "host": req.headers.host,
                    "session": JSON.stringify(session.settings),
                    "navSettings": JSON.stringify(navSettings),
                    "pageSettings": JSON.stringify(pageSettings),
                    "error": "Player wasn't in the match."
                }
            };
        }

        const playersManager = new Players();

        const players = await playerManager.getAllInMatch(matchId);
        

        const playerFaceIds = [];
        const playerIds = [];
        
        let p = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            

            if(playerFaceIds.indexOf(p.face) === -1){
                playerFaceIds.push(p.face);
            }

            if(playerIds.indexOf(p.player_id) === -1){
                playerIds.push(p.player_id);
            }
        }


        const playerNames = await playersManager.getNamesByIds(playerIds);

        let currentName = "";

        const getPlayerName = (id) =>{

            let p = 0;

            for(let i = 0; i < playerNames.length; i++){

                p = playerNames[i];

                if(p.id === id){
                    return p.name;
                }
            }

            return "Not Found";
        }

        for(let i = 0; i < players.length; i++){

            p = players[i];

            currentName = getPlayerName(p.player_id);

            if(currentName === undefined){
                currentName = "Not Found";
            }

            p.name = currentName;
        }
        

        const playerData = await playerManager.getPlayerById(playerId);
        const playerMatchData = await playerManager.getMatchData(playerId, matchId);

        playerMatchData.name = playerData.name;

        const playerGametypeData = await playerManager.getGametypeTotals(playerId, info.gametype);

        const mapImage = await mapManager.getImage(mapName);
        const cleanMapImage = Functions.removeExtension(mapImage);
        
        const faceManager = new Faces();
        const playerFaces = await faceManager.getFacesWithFileStatuses(playerFaceIds);

        const weaponManager = new Weapons();

        const playerWeaponData = await weaponManager.getPlayerMatchData(playerId, matchId);

        const weaponIds = [];

        for(let i = 0; i < playerWeaponData.length; i++){

            if(weaponIds.indexOf(playerWeaponData[i].weapon_id) === -1){
                weaponIds.push(playerWeaponData[i].weapon_id);
            }
        }

        const weaponNames = await weaponManager.getNamesByIds(weaponIds);

        const itemsManager = new Items();

        const pickupData = await itemsManager.getPlayerMatchData(matchId, playerId);

        const itemIds = [];

        for(let i = 0; i < pickupData.length; i++){

            if(itemIds.indexOf(pickupData[i].item) === -1){

                itemIds.push(pickupData[i].item);
            }
        }

        const pickupNames = await itemsManager.getNamesByIds(itemIds);

        
        const rankingManager = new Rankings();

        const matchRankingData = await rankingManager.getPlayerMatchHistory(playerId, matchId);

        const currentRankingData = await rankingManager.getCurrentPlayerRanking(playerId, info.gametype);

        let currentGametypePosition = 0;

        if(currentRankingData.length > 0){
            currentGametypePosition = await rankingManager.getGametypePosition(currentRankingData[0].ranking, info.gametype);
        }

        const pingManager = new Pings();

        const pingData = await pingManager.getPlayerMatchData(matchId, playerId);

        const connectionManager = new Connections();

        const connectionsData = await connectionManager.getPlayerMatchData(matchId, playerId);

        const teamsManager = new Teams();

        const teamData = await teamsManager.getPlayerMatchData(matchId, playerId);

        const ctfManager = new CTF();



        const bCTF = ctfManager.bAnyCtfDataInMatch(playerMatchData);

        const dominationManager = new Domination();

        const domPointNames = await dominationManager.getControlPointNames(info.map);
        const playerDomCaps = await dominationManager.getPlayerMatchCaps(matchId, playerId);

        const assaultManager = new Assault();

        const playerAssaultCaps = await assaultManager.getPlayerMatchCaps(matchId, playerId);

        let assaultObjNames = [];

        if(playerAssaultCaps.length !== 0){

            assaultObjNames = await assaultManager.getMapObjectives(info.map);
        }

        await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

        return {
            "props": {
                "host": req.headers.host,
                "session": JSON.stringify(session.settings),
                "navSettings": JSON.stringify(navSettings),
                "pageSettings": pageSettings,
                "pageOrder": pageOrder,
                "info": JSON.stringify(info),
                "server": serverName,
                "gametype": gametypeName,
                "map": mapName,
                "playerNames": JSON.stringify(playerNames),
                "playerData": JSON.stringify(playerData),
                "playerMatchData": JSON.stringify(playerMatchData),
                "playerGametypeData": JSON.stringify(playerGametypeData),
                "mapImage": mapImage,
                "cleanMapImage": cleanMapImage,
                "players": JSON.stringify(players),
                "faces": JSON.stringify(playerFaces),
                "playerWeaponData": JSON.stringify(playerWeaponData),
                "weaponNames": JSON.stringify(weaponNames),
                "pickupData": JSON.stringify(pickupData),
                "pickupNames": JSON.stringify(pickupNames),
                "rankingData": JSON.stringify(matchRankingData),
                "currentRankingData": JSON.stringify(currentRankingData),
                "currentRankingPosition": currentGametypePosition,
                "pingData": JSON.stringify(pingData),
                "connectionsData": JSON.stringify(connectionsData),
                "teamData": JSON.stringify(teamData),
                "domPointNames": JSON.stringify(domPointNames),
                "playerDomCaps": JSON.stringify(playerDomCaps),
                "bCTF": bCTF,
                "assaultObjNames": assaultObjNames,
                "playerAssaultCaps": playerAssaultCaps

            }
        }

    }catch(err){

        return {
            "props":{
                "pageLoadError": err.toString()
            }
        }
    }
}

export default PlayerMatch;