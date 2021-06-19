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
import Functions from '../../api/functions';
import Screenshot from '../../components/Screenshot/';
import Faces from '../../api/faces';
import MatchFragSummary from "../../components/MatchFragSummary";

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

    render(){

        const info = JSON.parse(this.props.info);
        const playerData = JSON.parse(this.props.playerData);

        let titleName = playerData.name;
        titleName+=(titleName[titleName.length - 1] == "s") ? "'" : "'s";

        const dateString = Functions.convertTimestamp(info.date, true);

        const parsedInfo = JSON.parse(this.props.info);

        const playerMatchData = JSON.parse(this.props.playerMatchData);


        return <div>
            <DefaultHead 
                host={this.props.host} 
                title={`${titleName} Match Report`} 
                description={`${titleName} match report for ${this.props.map} (${this.props.gametype}${(info.insta) ? " Instagib" : ""}) ${dateString}.`} 
                keywords={`match,report,player,${playerData.name},${this.props.map},${this.props.gametype}`}
                image={this.cleanImageURL(this.props.cleanMapImage)}    
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">{titleName} Match Report</div>
                        <MatchSummary 
                            info={this.props.info} 
                            server={this.props.server} 
                            gametype={this.props.gametype}
                            map={this.props.map} 
                            image={this.props.mapImage}
                        />

                        <Screenshot 
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

                        <MatchFragSummary 
                            playerData={[JSON.parse(this.props.playerMatchData)]} 
                            totalTeams={parsedInfo.total_teams}
                            matchStart={parsedInfo.start}
                            single={true}
                        />

                      
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}

export async function getServerSideProps({req, query}){


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

    const matchManager = new Match();

    const info = await matchManager.get(matchId);

    const gametypeManager = new Gametypes();
    const gametypeName = await gametypeManager.getName(info.gametype);
    const serverManager = new Servers();
    const serverName = await serverManager.getName(info.server);
    const mapManager = new Maps();
    const mapName = await mapManager.getName(info.map);

    const playerManager = new Player();

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


    const playerNames = await playerManager.getNames(playerIds);


    let currentName = "";

    for(let i = 0; i < players.length; i++){

        p = players[i];

        currentName = playerNames.get(p.player_id);

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




    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "info": JSON.stringify(info),
            "server": serverName,
            "gametype": gametypeName,
            "map": mapName,
            "playerData": JSON.stringify(playerData),
            "playerMatchData": JSON.stringify(playerMatchData),
            "playerGametypeData": JSON.stringify(playerGametypeData),
            "mapImage": mapImage,
            "cleanMapImage": cleanMapImage,
            "players": JSON.stringify(players),
            "faces": JSON.stringify(playerFaces)
        }
    }
}

export default PlayerMatch;