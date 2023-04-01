import {React} from "react";
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
import MatchFragSummary from "../../components/MatchFragSummary";
import MatchSpecialEvents from "../../components/MatchSpecialEvents";
import PlayerMatchPickups from "../../components/PlayerMatchPickups";
import PlayerMatchPing from "../../components/PlayerMatch/PlayerMatchPing";
import Analytics from "../../api/analytics";
import CombogibPlayerMatch from "../../components/CombogibPlayerMatch";
import ErrorMessage from "../../components/ErrorMessage";
import useMatchPlayersLoader from '../../components/useMatchPlayersLoader';
import PlayerMatchProfile from "../../components/PlayerMatch/PlayerMatchProfile";
import MatchCTFSummary from "../../components/MatchCTFSummary";
import PlayerMatchCTFReturns from "../../components/PlayerMatch/PlayerMatchCTFReturns";
import PlayerMatchCTFCaps from "../../components/PlayerMatch/PlayerMatchCTFCaps";
import PlayerMatchWeapons from "../../components/PlayerMatch/PlayerMatchWeapons";
import PlayerMatchDomination from "../../components/PlayerMatch/PlayerMatchDomination";
import PlayerMatchTeamChanges from "../../components/PlayerMatch/PlayerMatchTeamChanges";
import PlayerMatchRankings from "../../components/PlayerMatch/PlayerMatchRankings";
import PlayerMatchTeleFrags from "../../components/PlayerMatchTeleFrags";

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

    console.log(players.targetPlayer);


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
            players={players.playedPlayersData} 
            image={mapImage} 
            matchData={info} 
            serverName={server} 
            gametype={gametype} 
            faces={players.faces}
            highlight={playerInfo.name}
        />;
    }

    if(pageSettings["Display Summary"] === "true"){

        elems[pageOrder["Display Summary"]] = <MatchSummary 
            key={"m-s"} 
            info={info} 
            server={server} 
            gametype={gametype} 
            map={map} 
            image={mapImage} 
            bMonsterHunt={info.mh} 
            settings={pageSettings}
        />
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
    }

    if(pageSettings["Display Combogib Stats"] === "true"){
        elems[pageOrder["Display Combogib Stats"]] = <CombogibPlayerMatch key="combo" matchId={matchId} playerId={playerId}/>;
    }

    if(pageSettings["Display Weapon Statistics"] === "true"){

        elems[pageOrder["Display Weapon Statistics"]] = <PlayerMatchWeapons key="wstats" matchId={matchId} playerId={playerId}/>;
    }

    if(pageSettings["Display Special Events"] === "true"){

        elems[pageOrder["Display Special Events"]] = <MatchSpecialEvents 
            key={`mse`} 
            host={imageHost} 
            bTeamGame={info.team_game} 
            players={players.playedPlayersData} 
            matchId={matchId}
            bSingle={true}
            targetPlayerId={playerId}
        />
    }

    if(Functions.bAnyDomData(players.playedPlayersData)){

        if(pageSettings["Display Domination Summary"] === "true"){

            elems[pageOrder["Display Domination Summary"]] = <PlayerMatchDomination key="dom-sum" 
                matchId={matchId} 
                playerData={players.basicPlayers} 
                playerId={playerId}
                mapId={info.map}
            />;
        }
    }

    if(pageSettings["Display Pickup Summary"] === "true"){

        elems[pageOrder["Display Pickup Summary"]] = <PlayerMatchPickups key="pmp" playerId={playerId} matchId={matchId}/>;
    }


    if(pageSettings["Display Player Ping Graph"] === "true"){

        elems[pageOrder["Display Player Ping Graph"]] = <PlayerMatchPing key="pmp-g" playerId={playerId} matchId={matchId}/>;
    }

    if(pageSettings["Display Team Changes"] === "true"){

        elems[pageOrder["Display Team Changes"]] = <PlayerMatchTeamChanges key="ptc" matchStart={info.start} 
            matchId={matchId} playerId={playerId} totalTeams={info.total_teams}
        />
    }

    if(pageSettings["Display Rankings"] === "true"){

        elems[pageOrder["Display Rankings"]] = <PlayerMatchRankings 
            key="pmr" 
            matchId={matchId} 
            playerId={playerId} 
            gametypeId={info.gametype}
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
                    
                    <PlayerMatchTeleFrags data={players.targetPlayer}/>
                    
                    <PlayerMatchProfile 
                        host={imageHost} 
                        data={playerInfo} 
                        matchId={matchId}
                        playerId={playerId}
                    />
                   
                    
                    {elems}

                </div>
            </div>
            <Footer session={session}/>
        </main>
    </div>
}

/**
 * 


/*class PlayerMatch extends React.Component{



        if(parsedInfo.mh && pageSettings["Display MonsterHunt Kills"] === "true"){


            elems[pageOrder["Display MonsterHunt Kills"]] = <MatchMonsterHuntMonsterKills 
                key={"mh-monsters"} 
                playerData={playerData} 
                matchId={parsedInfo.id}
                playerId={playerData.player_id}
            />;
        }
         
        if(pageSettings["Display Assault Summary"] === "true"){

            elems[pageOrder["Display Assault Summary"]] = <PlayerMatchAssault key={"ass-sum"} 
                pointNames={this.props.assaultObjNames} caps={this.props.playerAssaultCaps}
            />;
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