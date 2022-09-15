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
import Assault from '../../api/assault';
import MatchAssaultSummary from '../../components/MatchAssaultSummary/';
import Teams from '../../api/teams';
import TeamsSummary from '../../components/TeamsSummary/';
import Screenshot from '../../components/Screenshot/';
import Faces from '../../api/faces';
import MatchKillsMatchUpAlt from '../../components/MatchKillsMatchUpAlt/';
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
import MatchCTFCapsNew from '../../components/MatchCTFCapsNew';
import MatchPlayerScoreHistory from '../../components/MatchPlayerScoreHistory';
import MatchPlayerPingHistory from '../../components/MatchPlayerPingHistory';
import MatchDominationSummaryNew from '../../components/MatchDominationSummaryNew';
import MatchCTFCapTimes from '../../components/MatchCTFCapTimes';
import CombogibMatchStats from '../../components/CombogibMatchStats';


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


function createBasicPlayerData(players){

    const playerNames = [];
    const justPlayerNames = {};
    
    for(let i = 0; i < players.length; i++){

        const p = players[i];

        playerNames.push({
            "id": p.player_id, 
            "name": p.name, 
            "country": p.country,
            "team": p.team,
            "spectator": p.spectator,
            "played": p.played
        });

        justPlayerNames[players[i].player_id] = players[i].name;
    }


    return {"playerNames": playerNames, "justPlayerNames": justPlayerNames};
}


function Match({navSettings, pageSettings, pageOrder, session, host, matchId, info, server, gametype,
    map, image, playerData, weaponData, domControlPointNames, 
    assaultData,  teams, faces, rankingChanges, currentRankings,
    rankingPositions, bMonsterHunt}){

    const imageHost = Functions.getImageHostAndPort(host);

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
    pageOrder = JSON.parse(pageOrder);

    let {playerNames, justPlayerNames} = createBasicPlayerData(parsedPlayerData);

    playerNames = JSON.stringify(playerNames);

    const elems = [];


    if(pageSettings["Display Summary"] === "true"){

        elems[pageOrder["Display Summary"]] = <MatchSummary key={pageOrder["Display Summary"]} 
            info={info} server={server} 
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
            totalTeams={parsedInfo.total_teams} 
            players={playerData} 
            image={image} 
            matchData={info}
            serverName={server} 
            gametype={gametype} 
            faces={faces}
        />
    }

    if(pageSettings["Display Frag Summary"] === "true"){

        if(!parsedInfo.mh){

            elems[pageOrder["Display Frag Summary"]] = <MatchFragSummary key={`match_3`} 
                host={imageHost} 
                totalTeams={parsedInfo.total_teams} 
                playerData={JSON.parse(playerData)} 
                matchStart={parsedInfo.start}
                matchId={parsedInfo.id}
            />
          

        }else{

            elems[pageOrder["Display Frag Summary"]] = <MatchMonsterHuntFragSummary key={`mh-frags`} 
                host={imageHost} 
                playerData={JSON.parse(playerData)} 
                matchStart={parsedInfo.start} 
                matchId={parsedInfo.id
            }/>
           
        }
    }

    if(pageSettings["Display Frags Graphs"] === "true"){

        if(!parsedInfo.mh){

            elems[pageOrder["Display Frag Graph"]] = <MatchFragsGraph 
                key="frag-graphs" 
                matchId={parsedInfo.id} 
                players={justPlayerNames} 
                teams={parsedInfo.total_teams}
            />;
        }
    }

 
        
    if(pageSettings["Display Capture The Flag Summary"] === "true"){

        elems[pageOrder["Display Capture The Flag Summary"]] = <MatchCTFSummary 
            key={`match_1`} 
            host={imageHost} 
            session={session} 
            players={JSON.parse(playerData)} 
            totalTeams={parsedInfo.total_teams} 
            matchId={parsedInfo.id}
        />;
        
    }

    if(pageSettings["Display Capture The Flag Times"] === "true"){

        elems[pageOrder["Display Capture The Flag Times"]] = <MatchCTFCapTimes 
            key={`match-ctf-caps`} 
            players={JSON.parse(playerNames)} 
            matchId={parsedInfo.id} 
            mapId={parsedInfo.map} 
            host={imageHost} 
            matchStart={parsedInfo.start}
        />;
        
    }

    if(pageSettings["Display Capture The Flag Graphs"] === "true"){

        elems[pageOrder["Display Capture The Flag Graphs"]] = <MatchCTFGraphs 
            key="ctf-graphs" 
            matchId={parsedInfo.id} 
            totalTeams={parsedInfo.total_teams} 
            players={justPlayerNames}
        />;
    
    }

    const bDom = bDomination(parsedPlayerData);
    const bAssaultGame = bAssault(gametype);

    if(!bDom && !bAssaultGame && pageSettings["Display Capture The Flag Caps"] === "true"){

        elems[pageOrder["Display Capture The Flag Caps"]] = <MatchCTFCapsNew 
            host={imageHost} 
            key="ctf-caps" 
            players={JSON.parse(playerNames)} 
            totalTeams={parsedInfo.total_teams} 
            matchId={parsedInfo.id} 
            start={parsedInfo.start}
        />;
    }


    if(bDom){

        if(pageSettings["Display Domination Summary"] === "true"){

            elems[pageOrder["Display Domination Summary"]] = <MatchDominationSummaryNew key="dom-sum" 
                host={imageHost}
                matchId={parsedInfo.id} 
                totalTeams={parsedInfo.total_teams} 
                players={JSON.parse(playerNames)} 
                playerNames={justPlayerNames}
                pointNames={JSON.parse(domControlPointNames)}
            />;
            
        }
    }

    if(bAssaultGame){

        if(pageSettings["Display Assault Summary"] === "true"){
            elems[pageOrder["Display Assault Summary"]] = <MatchAssaultSummary 
                host={imageHost} 
                key={`assault_data`} 
                players={playerData} 
                data={assaultData} 
                matchStart={parsedInfo.start} 
                attackingTeam={parsedInfo.attacking_team}
                redScore={parsedInfo.team_score_0} 
                blueScore={parsedInfo.team_score_1} 
                playerNames={playerNames}
            />;
        }
        

    }

    if(parsedInfo.mh){

        elems[pageOrder["Display MonsterHunt Kills"]] = <MatchMonsterHuntMonsterKills 
            key={"mh-monsters"} 
            playerData={JSON.parse(playerData)} 
            matchId={parsedInfo.id}
        />;
    }

    if(pageSettings["Display Special Events"] === "true"){

        elems[pageOrder["Display Special Events"]] = <MatchSpecialEvents 
            key={`match_4`} 
            host={imageHost} 
            bTeamGame={parsedInfo.team_game} 
            players={JSON.parse(playerData)} 
            matchId={parsedInfo.id}
        />
 
    }

    if(pageSettings["Display Extended Sprees"] === "true"){

        elems[pageOrder["Display Extended Sprees"]] = <MatchSprees 
            key={"sprees"} 
            host={imageHost} 
            players={JSON.parse(playerNames)} 
            matchStart={parsedInfo.start} 
            matchId={parsedInfo.id}
        />;
    }


    if(pageSettings["Display Kills Match Up"] === "true"){

        if(!parsedInfo.mh){
            elems[pageOrder["Display Kills Match Up"]] = <MatchKillsMatchUpAlt 
                key={`kills-matchup`} 
                matchId={matchId} 
                totalTeams={parsedInfo.total_teams}
                 players={JSON.parse(playerNames)}
            />;
        }
    }


    //if(pageSettings["Display Powerup Control"] === "true"){

        if(!parsedInfo.mh){

            elems[pageOrder["Display Powerup Control"]] = <MatchPowerUpControl 
                host={imageHost} key={`match-power-control`}        
                totalTeams={parsedInfo.total_teams}
                matchId={parsedInfo.id}
                players={JSON.parse(playerNames)}
                settings={pageSettings}
                order={pageOrder}
            />
        }
    //}


    if(pageSettings["Display Weapon Statistics"] === "true"){

        if(!parsedInfo.mh){

            elems[pageOrder["Display Weapon Statistics"]] = <MatchWeaponSummary 
                key={`match_5`} 
                data={JSON.parse(weaponData)} 
                players={JSON.parse(playerNames)} 
                totalTeams={parsedInfo.total_teams} 
                matchId={parsedInfo.id}
                host={imageHost}
            />
            
        }
    }
    
    if(pageSettings["Display Rankings"] === "true"){

        elems[pageOrder["Display Rankings"]] = <MatchRankingChanges 
            key={"r-changes"} 
            positions={rankingPositions} 
            changes={rankingChanges} 
            playerNames={playerNames} 
            currentRankings={currentRankings}
            matchId={parsedInfo.id}
            host={imageHost}
        />;
    }

    if(pageSettings["Display Player Score Graph"] === "true"){

        elems[pageOrder["Display Player Score Graph"]] = <MatchPlayerScoreHistory 
            key="score history" 
            players={justPlayerNames} 
            matchId={parsedInfo.id}
        />;
    }

    if(pageSettings["Display Player Ping Graph"] === "true"){
        
        elems[pageOrder["Display Player Ping Graph"]] = <MatchPlayerPingHistory 
            key="ping history" 
            players={justPlayerNames} 
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

    if(pageSettings["Display Server Settings"] === "true"){

        elems[pageOrder["Display Server Settings"]] = <MatchServerSettings key={"server-settings"} info={JSON.parse(info)}/>;
    }
    

    const dateString = Functions.convertTimestamp(parsedInfo.date, true);


    const titleElem = (pageSettings["Display Match Report Title"] === "true") ? 
    <div className="default-header">Match Report</div> 
    : null;


    if(parsedSession["bLoggedIn"]){
        elems[999999] = <AdminMatchControl key={"a-c"} host={imageHost} matchId={parsedInfo.id} players={playerNames} mapId={parsedInfo.map}/>;
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

                        <CombogibMatchStats matchId={parsedInfo.id}/>
                        
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
    const pageOrder = await settings.getCategoryOrder("Match Pages");
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

    if(bDomination(playerData)){

        const dom = new Domination();

        domControlPointNames = await dom.getControlPointNames(matchInfo.map);

    }
    

    let assaultData = [];

    const assaultManager = new Assault();


    if(pageSettings["Display Assault Summary"] === "true"){
        assaultData = await assaultManager.getMatchData(matchId, matchInfo.map);
    }

    domControlPointNames = JSON.stringify(domControlPointNames);


    playerData = JSON.stringify(playerData);


    const weaponManager = new Weapons();

    let weaponData = await weaponManager.getMatchData(matchId);

    if(weaponData === undefined) weaponData = [];

    weaponData = JSON.stringify(weaponData);

    const teamsManager = new Teams();

    let teamsData = await teamsManager.getMatchData(matchId);


    const faceManager = new Faces();

    let pFaces = await faceManager.getFacesWithFileStatuses(playerFaces);

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

    let monsterHuntPlayerKillTotals = [];

    if(matchInfo.mh){

        const monsterHuntManager = new MonsterHunt();

        monsterHuntPlayerKillTotals = await monsterHuntManager.getPlayerMatchKillTotals(matchId);

    }

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

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
            "playerData": playerData,
            "weaponData": weaponData,
            "domControlPointNames": domControlPointNames,
            "assaultData": JSON.stringify(assaultData),
            "teams": JSON.stringify(teamsData),
            "faces": JSON.stringify(pFaces),
            "headshotData": JSON.stringify(headshotData),
            "rankingChanges": JSON.stringify(rankingChanges),
            "currentRankings": JSON.stringify(currentRankings),
            "rankingPositions": JSON.stringify(rankingPositions),
            "bMonsterHunt": matchInfo.mh,
        }
    };

}

export default Match;