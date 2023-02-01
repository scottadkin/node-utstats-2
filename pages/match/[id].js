import {React, useEffect, useReducer} from 'react';
import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/'
import Footer from '../../components/Footer/';
import MatchManager from '../../api/match';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import Gametypes from '../../api/gametypes';
import MatchSummary from '../../components/MatchSummary/'
import MatchFragSummary from '../../components/MatchFragSummary/';
import MatchSpecialEvents from '../../components/MatchSpecialEvents/';
import MatchWeaponSummaryCharts from '../../components/MatchWeaponSummaryCharts/';
import MatchCTFSummary from '../../components/MatchCTFSummary/';
import TeamsSummary from '../../components/TeamsSummary/';
import Screenshot from '../../components/Screenshot/';
import Functions from '../../api/functions';
import Headshots from '../../api/headshots';
import MatchPowerUpControl from '../../components/MatchPowerUpControl/';
import MatchServerSettings from '../../components/MatchServerSettings/';
import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';
import Rankings from '../../api/rankings';
import MatchRankingChanges from '../../components/MatchRankingChanges/';
import AdminMatchControl from '../../components/AdminMatchControl/';
import MatchSprees from '../../components/MatchSprees/';
import MonsterHunt from '../../api/monsterhunt';
import MatchMonsterHuntFragSummary from '../../components/MatchMonsterHuntFragSummary/';
import MatchMonsterHuntMonsterKills from '../../components/MatchMonsterHuntMonsterKills/';
import Analytics from '../../api/analytics';
import MatchFragsGraph from '../../components/MatchFragsGraph';
import MatchCTFGraphs from '../../components/MatchCTFGraphs';
import MatchCTFCaps from '../../components/MatchCTFCaps';
import MatchPlayerScoreHistory from '../../components/MatchPlayerScoreHistory';
import MatchPlayerPingHistory from '../../components/MatchPlayerPingHistory';
import MatchDominationSummaryNew from '../../components/MatchDominationSummaryNew';
import MatchCTFCapTimes from '../../components/MatchCTFCapTimes';
import CombogibMatchStats from '../../components/CombogibMatchStats';
import ErrorMessage from '../../components/ErrorMessage';
import ErrorPage from '../ErrorPage';
import MatchKillsMatchUp from '../../components/MatchKillsMatchUp';
import MatchCTFCarryTime from '../../components/MatchCTFCarryTime';
import MatchCTFReturns from '../../components/MatchCTFReturns';
import Loading from '../../components/Loading';

const Match = ({matchId, error, host, image, info, metaData, session, pageSettings, pageOrder, 
    navSettings, map, server, gametype, bMonsterHunt}) =>{


    session = JSON.parse(session);

    const reducer = (state, action) =>{

        switch(action.type){

            case "playerData": return {
                "playerData": action.payload.playerData,
                "faces": action.payload.faces,
                "basicPlayers": action.payload.basicPlayers,
                "nonSpectators": action.payload.nonSpectators,
                "bLoadingPlayers": false
            }
        }

        throw new Error("Unknown Action");
    }

    const [state, dispatch] = useReducer(reducer, {
        "playerData": [],
        "faces": {},
        "basicPlayers": {},
        "nonSpectators": {},
        "bLoadingPlayers": true
    });

    useEffect(() =>{

        const controller = new AbortController();

        const createPlayerObjects = (data) =>{

            const basicPlayers = {};
            const justPlayerNames = {};
            const playedPlayers = {};

            for(let i = 0; i < data.playerData.length; i++){

                const p = data.playerData[i];

                basicPlayers[p.player_id] = {
                    "id": p.player_id,
                    "name": p.name, 
                    "country": p.country,
                    "team": p.team,
                    "spectator": p.spectator,
                    "played": p.played,
                    "playtime": p.playtime
                };

                justPlayerNames[data.playerData[i].player_id] = data.playerData[i].name;

                if(p.playtime > 0 || !p.spectator){
                    playedPlayers[data.playerData[i].player_id] = data.playerData[i].name;
                }
            }

            dispatch({
                "type": "playerData",
                "payload": {
                    "playerData": data.playerData,
                    "faces": data.playerFaces,
                    "basicPlayers": basicPlayers,
                    "nonSpectators": playedPlayers
                }
            });
        }

        const loadPlayerData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {
                    "Content-type": "application/json"
                },
                "method": "POST",
                "body": JSON.stringify({"mode": "players", "matchId": matchId})
            });

            const res = await req.json();
            
            createPlayerObjects(res);

            console.log(res);
        }

        loadPlayerData();

        return () =>{
            controller.abort();
        }
    }, [matchId]);



    if(error !== undefined){
        return <ErrorPage>{error}</ErrorPage>
    }


    const getOGImage = () =>{

        //for default head open graph image
        const imageReg = /^.+\/(.+)\.jpg$/i;
        const imageRegResult = imageReg.exec(image);

        if(imageRegResult !== null){
            return `maps/${imageRegResult[1]}`;
        }

        return "maps/default";
    }


    if(info === undefined){

        return <div>
            <DefaultHead host={host} 
                title={`Doesn't Exist! - Match Report`} 
                description={`Match does not exist.`} 
                keywords={`match,report`}
                image={getOGImage()}    
                />
            <main>
                <Nav settings={navSettings} session={session}/>
                <div id="content">

                    <div className="default">
                        
                        <div className="default-header">Match Does Not Exist!</div>
                        <ErrorMessage title="Match Report" text={`There is no match with the id of ${matchId}`}/>
                    </div>
                </div>
                <Footer session={session}/>
            </main>
        </div>
    }

    metaData = JSON.parse(metaData);
    //playerData = JSON.parse(playerData);
    info = JSON.parse(info);
    pageSettings = JSON.parse(pageSettings);
    pageOrder = JSON.parse(pageOrder);
    //faces = JSON.parse(faces);
    const imageHost = Functions.getImageHostAndPort(host);

    
    const bAnyCTFData = () =>{

        if(state.playerData.length > 0){
            if(state.playerData[0].ctfData !== undefined) return true;
        }

        return false;
    }

    const bAnyDominationData = () =>{

        for(let i = 0; i < state.playerData.length; i++){

            const p = state.playerData[i];
            if(p.dom_caps > 0) return true;
        }

        return false;
    }

    const renderMain = () =>{

        const elems = [];

        if(pageSettings["Display Summary"] === "true"){

            elems[pageOrder["Display Summary"]] = <MatchSummary 
                key={"m-s"} 
                info={info} 
                server={server} 
                gametype={gametype} 
                map={map} 
                image={image} 
                bMonsterHunt={bMonsterHunt} 
                settings={pageSettings}
            />
                   
        }
    
        if(pageSettings["Display Screenshot"] === "true"){
    
            elems[pageOrder["Display Screenshot"]] = <Screenshot 
                host={imageHost}
                key={"match-sshot"} map={map} 
                totalTeams={info.total_teams} 
                players={state.playerData} 
                image={image} 
                matchData={info}
                serverName={server} 
                gametype={gametype} 
                faces={state.faces}
            />
        }
    
    
        if(pageSettings["Display Frag Summary"] === "true"){
    
            if(!bMonsterHunt){
    
                elems[pageOrder["Display Frag Summary"]] = <MatchFragSummary key={`match_3`} 
                    host={imageHost} 
                    totalTeams={info.total_teams} 
                    playerData={state.playerData} 
                    matchStart={info.start}
                    matchId={info.id}
                />
              
    
            }else{
    
                elems[pageOrder["Display Frag Summary"]] = <MatchMonsterHuntFragSummary key={`mh-frags`} 
                    host={imageHost} 
                    playerData={state.playerData} 
                    matchStart={info.start} 
                    matchId={info.id
                }/>
               
            }
        }
    

        if(bAnyCTFData()){
       
            if(pageSettings["Display Capture The Flag Summary"] === "true"){
                elems[pageOrder["Display Capture The Flag Summary"]] = <MatchCTFSummary key="ctf-s" matchId={matchId} playerData={state.playerData} />
            }
        
            if(pageSettings["Display Capture The Flag Returns"] === "true"){
                
                elems[pageOrder["Display Capture The Flag Returns"]] = <MatchCTFReturns 
                    key="ctf-r"
                    matchId={matchId}
                    playerData={state.basicPlayers} 
                    totalTeams={info.total_teams}
                    matchStart={info.start}
                />
            }
        
            if(pageSettings["Display Capture The Flag Caps"] === "true"){
        

                elems[pageOrder["Display Capture The Flag Caps"]] = <MatchCTFCaps 
                    key="ctf-c"
                    matchId={matchId} 
                    playerData={state.basicPlayers} 
                    totalTeams={info.total_teams}
                    matchStart={info.start}
                />
                    
            }
        
            if(pageSettings["Display Capture The Flag Carry Times"] === "true"){
        
                elems[pageOrder["Display Capture The Flag Carry Times"]] = <MatchCTFCarryTime 
                    matchId={matchId} 
                    players={state.basicPlayers}
                    key="ctf-ct"
                />;
            }

            if(pageSettings["Display Capture The Flag Graphs"] === "true"){

                elems[pageOrder["Display Capture The Flag Graphs"]] = <MatchCTFGraphs 
                    key="ctf-graphs" 
                    matchId={matchId} 
                    totalTeams={info.total_teams} 
                    players={state.nonSpectators}
                />;
            
            }
        }

        if(pageSettings["Display Weapon Statistics"] === "true"){

            elems[pageOrder["Display Weapon Statistics"]] = <MatchWeaponSummaryCharts 
                key="weapon-stats"
                playerData={state.basicPlayers}
                totalTeams={info.total_teams} 
                matchId={matchId}
                host={imageHost}
            />;
        }


        if(pageSettings["Display Frags Graphs"] === "true"){
  
            if(info.mh === 0){
    
                elems[pageOrder["Display Frags Graphs"]] = <MatchFragsGraph 
                    key="frag-graphs" 
                    matchId={matchId} 
                    players={state.nonSpectators} 
                    teams={info.total_teams}
                />;
            }
        }

        if(pageSettings["Display Domination Summary"] === "true"){

            if(bAnyDominationData()){
                elems[pageOrder["Display Domination Summary"]] = <MatchDominationSummaryNew key="dom-sum" 
                    host={imageHost}
                    matchId={matchId} 
                    totalTeams={info.total_teams} 
                    playerData={state.basicPlayers} 
                    mapId={info.map}
                />;
            }
        }

        if(pageSettings["Display Special Events"] === "true"){

            elems[pageOrder["Display Special Events"]] = <MatchSpecialEvents 
                key={`mse`} 
                host={imageHost} 
                bTeamGame={info.team_game} 
                players={state.playerData} 
                matchId={matchId}
            />;
        }

        if(pageSettings["Display Extended Sprees"] === "true"){

            elems[pageOrder["Display Extended Sprees"]] = <MatchSprees 
                key={"sprees"} 
                host={imageHost} 
                players={state.basicPlayers} 
                matchStart={info.start} 
                matchId={matchId}
            />;
        }

        if(pageSettings["Display Kills Match Up"] === "true"){

            if(!info.mh){
    
                elems[pageOrder["Display Kills Match Up"]] = <MatchKillsMatchUp key="kmu" matchId={info.id} players={state.basicPlayers}/>
            }
        }

        if(pageSettings["Display Player Score Graph"] === "true"){

            elems[pageOrder["Display Player Score Graph"]] = <MatchPlayerScoreHistory 
                key="score history" 
                players={state.nonSpectators} 
                matchId={matchId}
            />;
        }


        if(pageSettings["Display Powerup Control"] === "true"){

            elems[pageOrder["Display Powerup Control"]] = <MatchPowerUpControl 
                host={imageHost} key={`match-power-control`}        
                totalTeams={info.total_teams}
                matchId={matchId}
                players={state.basicPlayers}
                settings={pageSettings}
                order={pageOrder}
            />
        }

        if(pageSettings["Display Rankings"] === "true"){

            elems[pageOrder["Display Rankings"]] = <MatchRankingChanges 
                key={"r-changes"} 
                players={state.basicPlayers} 
                matchId={matchId}
                host={imageHost}
                gametype={info.gametype}
            />
        }

        if(pageSettings["Display Player Ping Graph"] === "true"){
        
            elems[pageOrder["Display Player Ping Graph"]] = <MatchPlayerPingHistory 
                key="ping history" 
                playerIds={state.nonSpectators} 
                players={state.basicPlayers}
                matchId={matchId}
                playerData={state.playerData.map((player) =>{
                    return {"playerId": player.player_id, "min": player.ping_min, "average": player.ping_average, "max": player.ping_max}
                })}
            />;

        }

        if(pageSettings["Display Server Settings"] === "true"){

            elems[pageOrder["Display Server Settings"]] = <MatchServerSettings key={"server-settings"} info={info}/>;

        }

        if(session["bLoggedIn"]){
            elems[999999] = <AdminMatchControl key={"a-c"} host={imageHost} matchId={matchId} players={state.basicPlayers} mapId={info.map}
                gametypeId={info.gametype}
            />;
        }

        return elems;
    }



    
    


    const renderTitleElem = () =>{

        const setting = pageSettings["Display Match Report Title"];

        if(setting === "true"){
            return <div className="default-header">Match Report</div> 
        }
    }



    let elems = [];

    if(state.bLoadingPlayers){

        elems = <Loading />
    }

    if(!state.bLoadingPlayers){

        elems = renderMain();
    }

    console.log(state.playerData);


    return <div>
            <DefaultHead host={host} 
                title={metaData.title} 
                description={metaData.description} 
                keywords={metaData.keywords}
                image={getOGImage()}    
                />
            <main>
                <Nav settings={navSettings} session={session}/>
                <div id="content">
                    <div className="default">


                    
                    <TeamsSummary 
                        key={`teams-data`} 
                        host={imageHost} 
                        players={state.basicPlayers}
                        playerData={state.playerData} 
                        matchId={matchId}
                        matchStart={info.start}
                        totalTeams={info.total_teams}
                    />
                    

                    {renderTitleElem()}

                    {elems}
                    
        
                    </div>
                </div>
                <Footer session={session}/>
            </main>
        </div>;
}



/*
function Match({navSettings, pageSettings, pageOrder, session, host, matchId, info, server, gametype,
    map, image, playerData, weaponData, domControlPointNames, 
    assaultData,  teams, faces, rankingChanges, currentRankings,
    rankingPositions, bMonsterHunt, error}){


    const parsedInfo = JSON.parse(info);
    const parsedPlayerData = JSON.parse(playerData);
    const parsedSession = JSON.parse(session);

    pageSettings = JSON.parse(pageSettings);
    pageOrder = JSON.parse(pageOrder);

    let {playerNames, justPlayerNames, nonSpectators} = createBasicPlayerData(parsedPlayerData);

    const basicPlayersObject = createBasicPlayersObject(playerNames);

    playerNames = JSON.stringify(playerNames);

    const elems = [];

    if(parsedInfo.mh){

        elems[pageOrder["Display MonsterHunt Kills"]] = <MatchMonsterHuntMonsterKills 
            key={"mh-monsters"} 
            playerData={JSON.parse(playerData)} 
            matchId={parsedInfo.id}
        />;
    }


    if(pageSettings["Display Team Changes"] === "true"){

        if(!parsedInfo.mh){

            if(parsedInfo.team_game){

                elems[pageOrder["Display Team Changes"]] = <TeamsSummary 
                    key={`teams-data`} 
                    host={imageHost} 
                    data={teams} 
                    playerNames={playerNames} 
                    matchId={parsedInfo.id}
                />
                
            }
        }
    }

    if(pageSettings["Display Combogib Stats"] === "true"){

        elems[pageOrder["Display Combogib Stats"]] = <CombogibMatchStats key={"combo-stats"} matchId={parsedInfo.id} 
            players={basicPlayersObject} totalTeams={parsedInfo.total_teams}
        />;

    }

*/


export async function getServerSideProps({req, query}){

    try{

        let matchId = (query.id !== undefined) ? parseInt(query.id) : parseInt(null);

        const session = new Session(req);
        await session.load();

        const settings = new SiteSettings();
        const pageSettings = await settings.getCategorySettings("Match Pages");
        const pageOrder = await settings.getCategoryOrder("Match Pages");
        const navSettings = await settings.getCategorySettings("Navigation");

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
                    "matchId": matchId
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

        await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

        const dateString = Functions.convertTimestamp(matchInfo.date, true);

        let descriptionString = `Match report for ${mapName} (${gametypeName}) ${(matchInfo.insta) ? " Instagib" : ""}`;
        descriptionString += `played on ${serverName} at ${dateString}, total players ${matchInfo.players}, match length ${Functions.MMSS(matchInfo.playtime)}.`

        const keywords = `match,report,${mapName},${gametypeName},${serverName}`;

        const metaData = {
            "title": `${mapName} (${dateString}) Match Report`,
            "description:": descriptionString,
            "keywords": keywords
        };


        return {
            props: {
                "navSettings": JSON.stringify(navSettings),
                "pageSettings": JSON.stringify(pageSettings),
                "pageOrder": JSON.stringify(pageOrder),
                "session": JSON.stringify(session.settings),
                "host": req.headers.host,
                "matchId": matchId,
                "info": JSON.stringify(matchInfo),
                "server": serverName,
                "gametype": gametypeName,
                "map": mapName,
                "image": image,
                "metaData": JSON.stringify(metaData)
            }
        };

    }catch(err){
        console.trace(err);

        return {
            "props": {
                "error": err.toString()
            }
        }
    }

}

export default Match;