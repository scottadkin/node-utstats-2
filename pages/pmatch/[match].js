import {React, useEffect, useReducer} from "react";
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
import Loading from "../../components/Loading";
import useMatchPlayersLoader from '../../components/useMatchPlayersLoader';

import PlayerMatchProfile from "../../components/PlayerMatch/PlayerMatchProfile";


const reducer = (state, action) =>{

    switch(action.type){

        default: return state;
    }
}

const renderError = (host, navSettings, session, pageError) =>{    

    return <div>
        <DefaultHead 
            host={host} 
            title={`Error! Match Report`} 
            description={`Error`} 
            keywords={`error`}
        />
        <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">
                    <div className="default-header">Match Report</div>
                    <ErrorMessage title="Match Report" text={pageError}/>
                </div>
            </div>
            <Footer session={session}/>
        </main>
    </div>
}

const cleanImageURL = (input) =>{

    const reg = /^\/images\/(.+)$/i;

    const result = reg.exec(input);

    if(result !== null){
        return result[1];
    }

    return input;
}

const PlayerMatch = ({host, session, pageError, navSettings, pageSettings, pageOrder, 
    info, server, gametype, map, cleanMapImage, playerInfo, playerId,
      mapImage}) =>{

    info = JSON.parse(info);
    const matchId = info.id;

    playerInfo = JSON.parse(playerInfo);

    const players = useMatchPlayersLoader(matchId, playerId);



    if(pageError !== undefined) return renderError(host, navSettings, session, pageError);

    const titleName = `${playerInfo.name}${Functions.apostrophe(playerInfo.name)}`;
    const compactDate = Functions.DDMMYY(info.date, true);
    const dateString = Functions.convertTimestamp(info.date, true);
    const imageHost = Functions.getImageHostAndPort(host);

    const elems = [];

    if(pageSettings["Display Screenshot"] ==="true"){

        elems[pageOrder["Display Screenshot"]] = <Screenshot 
            key="sshot"
            host={imageHost}
            map={map} 
            totalTeams={info.total_teams} 
            players={players.playerData} 
            image={mapImage} 
            matchData={info} 
            serverName={server} 
            gametype={gametype} 
            faces={players.faces}
            highlight={playerInfo.name}
        />;

    }

    if(pageSettings["Display Frag Summary"] === "true"){
 
        elems[pageOrder["Display Frag Summary"]] = <MatchFragSummary key={`match_3`} 
            host={imageHost} 
            totalTeams={info.total_teams} 
            playerData={players.targetPlayer} 
            matchStart={info.start}
            matchId={info.id}
            single={true}
        />
        
    }


    

    return <div>
        <DefaultHead 
            host={host} 
            title={`${titleName} Match Report ${compactDate} ${map}`} 
            description={`${titleName} match report for ${map} (${gametype}${(info.insta) ? " Instagib" : ""}) ${dateString}.`} 
            keywords={`match,report,player,${playerInfo.name},${map},${gametype}`}
            image={cleanImageURL(cleanMapImage)}    
        />
        <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">
                    <div className="default-header">{titleName} Match Report</div>

                
                    
                    
                    <PlayerMatchProfile host={imageHost} data={playerInfo} matchId={info.id}/>
                   
                    
                    {elems}

                </div>
            </div>
            <Footer session={session}/>
        </main>
    </div>
}

/**
 * 
  {<MatchPlayerViewProfile host={imageHost} data={playerData} matchId={parsedInfo.id}/>

                    <MatchSummary 
                        info={JSON.parse(this.props.info)} 
                        server={this.props.server} 
                        gametype={this.props.gametype}
                        map={this.props.map} 
                        image={this.props.mapImage}
                        bMonsterHunt={parsedInfo.mh}
                        settings={this.props.pageSettings}
                    />} param0 
 * @returns 
 */

/*class PlayerMatch extends React.Component{

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
                            info={JSON.parse(this.props.info)} 
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
}*/

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
                    "pageError": `There is no match with the id of ${matchId}.`
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
        const mapImage = await mapManager.getImage(mapName);
        const cleanMapImage = Functions.removeExtension(mapImage);

        const playerManager = new Player();

        const bPlayerInMatch = await playerManager.bPlayerInMatch(playerId, matchId);
        

        if(!bPlayerInMatch){
            return {
                "props": {
                    "host": req.headers.host,
                    "session": JSON.stringify(session.settings),
                    "navSettings": JSON.stringify(navSettings),
                    "pageSettings": JSON.stringify(pageSettings),
                    "pageError": "Player wasn't in the match."
                }
            };
        }


        const playerInfo = await playerManager.getBasicInfo(playerId);

        await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

        return {
            "props": {
                "host": req.headers.host,
                "session": JSON.stringify(session.settings),
                "navSettings": JSON.stringify(navSettings),
                "pageSettings": pageSettings,
                "pageOrder": pageOrder,
                "playerInfo": JSON.stringify(playerInfo),
                "info": JSON.stringify(info),
                "server": serverName,
                "gametype": gametypeName,
                "map": mapName,
                "mapImage": mapImage, 
                "cleanMapImage": cleanMapImage,
                "playerId": playerId

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