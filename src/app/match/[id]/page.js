import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import {getSettings, getNavSettings, getPageOrder, PageComponentManager} from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import MatchSummary from "../../UI/Match/MatchSummary";
import { getMatch, getMatchIdFromHash } from "../../../../api/matches";
import Screenshot from "../../UI/Screenshot";
import { getAllInMatch, getScoreHistory } from "../../../../api/players";
import { getFacesWithFileStatuses } from "../../../../api/faces";
import MatchFragSummary from "../../UI/Match/MatchFragSummary";
import MatchMonsterHuntFragSummary from "../../UI/Match/MatchMonsterHuntFragSummary";
import MatchCTFSummary from "../../UI/Match/MatchCTFSummary";
import { getMatchFlagKillDetails, getMatchDetailedReturns, getMatchDetailedCaps, getCarryTimes, getEventGraphData } from "../../../../api/ctf";
import MatchCTFReturns from "../../UI/Match/MatchCTFReturns";
import MatchSpecialEvents from "../../UI/Match/MatchSpecialEvents";
import MatchCTFCaps from "../../UI/Match/MatchCTFCaps";
import MatchCTFCarryTime from "../../UI/Match/MatchCTFCarryTime";
import MatchCTFGraphs from "../../UI/Match/MatchCTFGraphs";
import MatchDetailedSprees from "../../UI/Match/MatchDetailedSprees";
import { getDetailedMatchSprees } from "../../../../api/sprees";
import MatchServerSettings from "../../UI/Match/MatchServerSettings";
import MatchWeaponSummaryCharts from "../../UI/Match/MatchWeaponSummaryCharts";
import { getMatchData as getWeaponsMatchData } from "../../../../api/weapons";
import { getGraphData } from "../../../../api/kills";
import MatchFragsGraph from "../../UI/Match/MatchFragsGraph";
import MatchDominationSummary from "../../UI/Match/MatchDominationSummary";
import { getMatchDomSummary } from "../../../../api/domination";
import MatchPlayerScoreHistory from "../../UI/Match/MatchPlayerScoreHistory";
import { getMatchRankings } from "../../../../api/rankings";
import MatchRankingChanges from "../../UI/Match/MatchRankingChanges";
import { getMatchTeamChanges } from "../../../../api/teams";
import MatchTeamsSummary from "../../UI/Match/MatchTeamsSummary";
import { getMatchData as getMatchTelefrags } from "../../../../api/telefrags";
import MatchTeleFrags from "../../UI/Match/MatchTeleFrags";
import MatchKillsMatchUp from "../../UI/Match/MatchKillsMatchUp";
import MatchItemsSummary from "../../UI/Match/MatchItemsSummary";
import MatchPlayerPingHistory from "../../UI/Match/MatchPlayerPingHistory";
import CombogibMatchStats from "../../UI/Match/CombogibMatchStats";
import MatchPowerupSummary from "../../UI/Match/MatchPowerupSummary";
import { convertTimestamp, plural, toPlaytime } from "../../../../api/generic.mjs";
import ErrorMessage from "../../UI/ErrorMessage";
import ErrorPage from "../../UI/ErrorPage";

function setQueryValues(params, searchParams){

    let id = (params.id !== undefined) ? params.id : 0;

    return {
        "matchId": id
    };

}

export async function generateMetadata({ params, searchParams }, parent) {

    params = await params;
    searchParams = await searchParams;

    let {matchId} = setQueryValues(params, searchParams);

    if(matchId.length === 32){
        matchId = await getMatchIdFromHash(matchId);
    }

    const info = await getMatch(matchId);

    if(info === null){
        return {
            "title": "Match Not Found - Node UTStats 2",
            "description": "Could not find the match you were looking for,",
            "keywords": ["match", "report", "utstats", "node"],
        }
    }

    const date = convertTimestamp(info.date, true);

    let desc = `Match report for ${info.mapName} (${info.gametypeName}) played on the ${info.serverName} server,`;
    desc+= ` there were a total of ${info.players} ${plural(info.players, "player")} in the match and it lasted ${toPlaytime(info.playtime)},`;
    desc+= ` date of match was ${date} `;

    return {
        "title": `${info.mapName} (${date}) - Node UTStats 2`,
        "description": desc,
        "keywords": ["match","report", "utstats", "node", info.mapName, info.gametypeName],
        "openGraph": {
            "images": [`/images/maps/${info.image}.jpg`]
        }
    }
}

export default async function Page({params, searchParams}){
    
    params = await params;
    searchParams = await searchParams;

    let {matchId} = setQueryValues(params, searchParams);

    if(matchId.length === 32){
        matchId = await getMatchIdFromHash(matchId);
    }

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings();
    const pageSettings = await getSettings("Match Pages");
    const pageOrder = await getPageOrder("Match Pages");
    const sessionSettings = session.settings;

    const elems = [];

    const pageManager = new PageComponentManager(pageSettings, pageOrder, elems);

   
    const info = await getMatch(matchId);

    if(info === null){

        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Match Doesn't Exist">
            There are no matches with that id.
        </ErrorPage>;
    }
 

    const players = await getAllInMatch(matchId);

    const faceIds = new Set(players.map((p) =>{
        return p.face;
    }));

    const faces = await getFacesWithFileStatuses([...faceIds]);

    let matchCTFFlagKills  = null;

    if(pageManager.bEnabled("Display Capture The Flag Summary")){
        matchCTFFlagKills = await getMatchFlagKillDetails(matchId, info.map, -1);
    }

    let ctfReturns = null;

    if(pageManager.bEnabled("Display Capture The Flag Returns")){
        ctfReturns = await getMatchDetailedReturns(matchId);
    }

    let ctfCaps = null;
    
    if(pageManager.bEnabled("Display Capture The Flag Caps")){
        ctfCaps = await getMatchDetailedCaps(matchId);
    }

    let ctfCarryTimes = null;

    if(pageManager.bEnabled("Display Capture The Flag Carry Times")){
        ctfCarryTimes = await getCarryTimes(matchId);
    }

    let ctfGraphData = null;

    if(pageManager.bEnabled("Display Capture The Flag Graphs")){
        ctfGraphData = await getEventGraphData(matchId, players, info.total_teams);
    }

    let detailedSprees = null;

    if(pageManager.bEnabled("Display Extended Sprees")){
        detailedSprees = await getDetailedMatchSprees(matchId);
    }

    let weaponData = null;

    if(pageManager.bEnabled("Display Weapon Statistics")){
        weaponData = await getWeaponsMatchData(matchId);
    }

    let fragGraphData = null;

    if(pageManager.bEnabled("Display Frags Graphs")){
        fragGraphData = await getGraphData(matchId, players, info.total_teams);
    }

    let scoreHistory = null;

    if(pageManager.bEnabled("Display Player Score Graph")){
        scoreHistory = await getScoreHistory(matchId, players);
    }

    let domSummaryData = null;

    if(pageManager.bEnabled("Display Domination Summary")){
        domSummaryData = await getMatchDomSummary(matchId, info.map);
    }

    let teamChanges = null;

    if(pageManager.bEnabled("Display Team Changes")){
        teamChanges = await getMatchTeamChanges(matchId);
    }

    const playerIds = [...new Set(players.map((p) =>{
        return p.player_id;
    }))]

    let rankingsData = null;

    if(pageManager.bEnabled("Display Rankings")){
        rankingsData = await getMatchRankings(matchId, info.gametype, playerIds);
    }

    let teleFrags = null;

    if(pageManager.bEnabled("Display Telefrag Stats")){
        teleFrags = await getMatchTelefrags(matchId);
    }


    pageManager.addComponent("Display Powerup Control", <MatchPowerupSummary 
        matchId={matchId} players={players} totalTeams={info.total_teams} key="powerups"
    />);

    pageManager.addComponent("Display Summary", <MatchSummary 
        key={"m-s"} 
        info={info}
        settings={pageSettings}
    />);

    pageManager.addComponent("Display Screenshot", <Screenshot 
        faces={faces} 
        players={players} 
        map={info.mapName}
        totalTeams={info.total_teams} 
        image={`/images/maps/${info.image}.jpg`}
        matchData={info}
        serverName={info.serverName} 
        gametypeName={info.gametypeName}
        bHome={false} 
        bClassic={false}
        key="shot"
    />);


    pageManager.addComponent("Display Frag Summary", <MatchFragSummary key={`match_frags`} 
        totalTeams={info.total_teams} 
        playerData={players} 
        matchStart={info.start}
        matchId={info.id}
    />);

    pageManager.addComponent("Display Frag Summary", <MatchMonsterHuntFragSummary key={`match_mh_frags`} 
        totalTeams={info.total_teams} 
        playerData={players} 
        matchStart={info.start}
        matchId={info.id}
        single={false}
        bMH={info.mh}
    />);

    pageManager.addComponent("Display Capture The Flag Summary", <MatchCTFSummary 
        key="match-ctf-sum"
        matchId={info.id} mapId={info.map} playerData={players} single={false} 
        flagKills={matchCTFFlagKills}
    />);

    pageManager.addComponent("Display Capture The Flag Returns", <MatchCTFReturns key="ctf-returns"
        playerData={players} returnData={ctfReturns} totalTeams={info.total_teams} 
        matchStart={info.start} single={false} bHardcore={info.hardcore}
    />);

    pageManager.addComponent("Display Capture The Flag Caps", <MatchCTFCaps key="ctf-caps"
        matchId={info.id} playerData={players} totalTeams={info.total_teams}
         matchStart={info.start} bHardcore={info.hardcore} capData={ctfCaps}
    />);

    pageManager.addComponent("Display Capture The Flag Carry Times", <MatchCTFCarryTime key="ctf-carry-times"
        matchId={info.id} data={ctfCarryTimes} players={players} 
    />);

    pageManager.addComponent("Display Capture The Flag Graphs", <MatchCTFGraphs key="ctf-graphs"
        matchId={info.id} 
        totalTeams={info.total_teams} 
        players={players} 
        matchStart={info.start} 
        matchEnd={info.end} 
        bHardcore={info.hardcore}
        graphData={ctfGraphData}
    />);

    pageManager.addComponent("Display Special Events", <MatchSpecialEvents key="special-events"
        matchId={info.id} bTeamGame={info.total_teams > 1} players={players} 
        bSingle={false} targetPlayerId={-1}
    />);

    pageManager.addComponent("Display Extended Sprees", <MatchDetailedSprees key="detailed-sprees"
        matchId={info.id} players={players} matchStart={info.start}
        sprees={detailedSprees} bHardcore={info.hardcore}
    />);

    pageManager.addComponent("Display Server Settings", <MatchServerSettings key="server-settings" info={info}/>);


    pageManager.addComponent("Display Weapon Statistics", <MatchWeaponSummaryCharts key="weapon-control"
        matchId={info.id} totalTeams={info.total_teams} playerData={players} 
        weaponStats={weaponData}
    />);

    pageManager.addComponent("Display Frags Graphs", <MatchFragsGraph key="frag-graphs" 
        matchId={matchId} 
        players={players} 
        teams={info.total_teams}
        bHardcore={info.hardcore}
        startTimestamp={info.start}
        data={fragGraphData}
    />);

    pageManager.addComponent("Display Domination Summary", <MatchDominationSummary key="match-dom-summary"
        matchId={info.id} totalTeams={info.total_teams} mapId={info.map} playerData={players} 
        matchStart={info.start} matchEnd={info.end} bHardcore={info.hardcore}
        data={domSummaryData}
    />);


    pageManager.addComponent("Display Player Score Graph", <MatchPlayerScoreHistory key="score-graph"
        graphData={scoreHistory} matchStart={info.start} matchEnd={info.end} 
        bHardcore={info.hardcore}
    />);

    pageManager.addComponent("Display Rankings", <MatchRankingChanges key="rankings"
        data={rankingsData} players={players} matchId={matchId}
    />);

    pageManager.addComponent("Display Team Changes", <MatchTeamsSummary key="teams" 
        teamChanges={teamChanges} matchId={matchId} matchStart={info.start} players={players} 
    totalTeams={info.total_teams}/>);

    pageManager.addComponent("Display Telefrag Stats", <MatchTeleFrags key="tele-frags"
        data={teleFrags} players={players} matchId={matchId} matchStart={info.start}
    />);

    pageManager.addComponent("Display Kills Match Up", <MatchKillsMatchUp key="kmu" matchId={matchId} players={players}/>);

    pageManager.addComponent("Display Items Summary", <MatchItemsSummary key="items-sum" matchId={matchId} 
        players={players} totalTeams={info.total_teams}
    />);

    pageManager.addComponent("Display Player Ping Graph", <MatchPlayerPingHistory key="ping-graph"
        matchId={matchId} players={players} playerIds={playerIds} matchStart={info.start} 
        matchEnd={info.end} bHardcore={info.hardcore}
    />);

    pageManager.addComponent("Display Combogib Stats", <CombogibMatchStats key="combo-stats" matchId={matchId} 
        players={players} totalTeams={info.total_teams}/>
    );

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Match Report</div>
                {elems}
            </div>    
        </div>   
    </main>; 
}