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
import MatchCTFSummary from "../../components/MatchCTFSummary";
import PlayerMatchCTFReturns from "../../components/PlayerMatch/PlayerMatchCTFReturns";
import PlayerMatchCTFCaps from "../../components/PlayerMatch/PlayerMatchCTFCaps";
import MatchCTFCarryTime from "../../components/MatchCTFCarryTime";
import MatchWeaponSummaryCharts from "../../components/MatchWeaponSummaryCharts";
import PlayerMatchWeapons from "../../components/PlayerMatch/PlayerMatchWeapons";


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

    if(Functions.bAnyCTFData(players.playerData)){
       
        if(pageSettings["Display Capture The Flag Summary"] === "true"){

            elems[pageOrder["Display Capture The Flag Summary"]] = <MatchCTFSummary 
                key="ctf-s" 
                matchId={matchId} 
                playerData={players.targetPlayer} 
                single={true}
            />
        }


        if(pageSettings["Display Capture The Flag Returns"] === "true"){
            
            elems[pageOrder["Display Capture The Flag Returns"]] = <PlayerMatchCTFReturns 
                key="ctf-r"
                matchId={matchId}
                playerData={players.basicPlayers} 
                matchStart={info.start}
                playerId={playerId}
            />
        }
    
        if(pageSettings["Display Capture The Flag Caps"] === "true"){
    
            elems[pageOrder["Display Capture The Flag Caps"]] = <PlayerMatchCTFCaps 
                key="ctf-c"
                matchId={matchId} 
                playerData={players.basicPlayers} 
                matchStart={info.start}
                playerId={playerId}
            />             
        }

        if(pageSettings["Display Combogib Stats"] === "true"){
            elems[pageOrder["Display Combogib Stats"]] = <CombogibPlayerMatch key="combo" matchId={matchId} playerId={playerId}/>;
        }

        if(pageSettings["Display Weapon Statistics"] === "true"){

            elems[pageOrder["Display Weapon Statistics"]] = <PlayerMatchWeapons key="wstats" matchId={matchId} playerId={playerId}/>;

        }
    

        /*if(pageSettings["Display Weapon Statistics"] === "true"){

            elems[pageOrder["Display Weapon Statistics"]] = <MatchWeaponSummaryCharts 
                key="weapon-stats"
                playerData={players.targetPlayer}
                totalTeams={info.total_teams} 
                matchId={matchId}
                host={imageHost}
            />;
        }*/

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

  

        if(pageSettings["Display Combogib Stats"] === "true"){
            elems[pageOrder["Display Combogib Stats"]] = <CombogibPlayerMatch key="combo" matchId={parsedInfo.id} playerId={playerData.player_id}/>;
        }


        if(parsedInfo.mh && pageSettings["Display MonsterHunt Kills"] === "true"){


            elems[pageOrder["Display MonsterHunt Kills"]] = <MatchMonsterHuntMonsterKills 
                key={"mh-monsters"} 
                playerData={playerData} 
                matchId={parsedInfo.id}
                playerId={playerData.player_id}
            />;
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