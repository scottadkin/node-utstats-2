import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import {getSettings, getNavSettings, getPageOrder} from "../../../../api/sitesettings";
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

function setQueryValues(params, searchParams){

    let id = (params.id !== undefined) ? params.id : 0;

    return {
        "matchId": id
    };

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
    const sessionSettings = session.settings;

    const info = await getMatch(matchId);

    const players = await getAllInMatch(matchId);

    const faceIds = new Set(players.map((p) =>{
        return p.face;
    }));

    const faces = await getFacesWithFileStatuses([...faceIds]);


    const matchCTFFlagKills = await getMatchFlagKillDetails(matchId, info.map, -1);
    const ctfReturns = await getMatchDetailedReturns(matchId);

    const ctfCaps = await getMatchDetailedCaps(matchId);
    const ctfCarryTimes = await getCarryTimes(matchId);

    const ctfGraphData = await getEventGraphData(matchId, players, info.total_teams);

    const detailedSprees = await getDetailedMatchSprees(matchId);

    const weaponData = await getWeaponsMatchData(matchId);

    const fragGraphData = await getGraphData(matchId, players, info.total_teams);

    const scoreHistory = await getScoreHistory(matchId, players);
    const domSummaryData = await getMatchDomSummary(matchId, info.map);

    const teamChanges = await getMatchTeamChanges(matchId);

    const playerIds = [...new Set(players.map((p) =>{
        return p.player_id;
    }))]

    const rankingsData = await getMatchRankings(matchId, info.gametype, playerIds);

    const teleFrags = await getMatchTelefrags(matchId);

    if(info === null){
        return <main>
            <Nav settings={navSettings} session={sessionSettings}/>		
            <div id="content">
                <div className="default">
                    <div className="default-header">Match Not Found</div>
                </div>    
            </div>   
        </main>; 
    }


    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Match Report</div>
                <CombogibMatchStats matchId={matchId} 
                players={players} totalTeams={info.total_teams}/>
                <MatchPowerupSummary matchId={matchId} players={players} totalTeams={info.total_teams}/>
                <MatchSummary 
                    key={"m-s"} 
                    info={info}
                    settings={pageSettings}
                />
                <Screenshot 
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
                />
                <MatchFragSummary key={`match_3`} 
                    totalTeams={info.total_teams} 
                    playerData={players} 
                    matchStart={info.start}
                    matchId={info.id}
                />

                <MatchMonsterHuntFragSummary key={`match_mh_frags`} 
                    totalTeams={info.total_teams} 
                    playerData={players} 
                    matchStart={info.start}
                    matchId={info.id}
                    single={false}
                    bMH={info.mh}
                />
                <MatchCTFSummary matchId={info.id} mapId={info.map} playerData={players} single={false} flagKills={matchCTFFlagKills}/>
                <MatchCTFReturns playerData={players} returnData={ctfReturns} totalTeams={info.total_teams} matchStart={info.start} single={false} bHardcore={info.hardcore}/>
                <MatchCTFCaps matchId={info.id} playerData={players} totalTeams={info.total_teams} matchStart={info.start} bHardcore={info.hardcore} capData={ctfCaps}/>
                <MatchCTFCarryTime matchId={info.id} data={ctfCarryTimes} players={players} />
                <MatchCTFGraphs 
                    matchId={info.id} 
                    totalTeams={info.total_teams} 
                    players={players} 
                    matchStart={info.start} 
                    matchEnd={info.end} 
                    bHardcore={info.hardcore}
                    graphData={ctfGraphData}
                />
                <MatchSpecialEvents matchId={info.id} bTeamGame={info.total_teams > 1} players={players} bSingle={false} targetPlayerId={-1}/>
                <MatchDetailedSprees matchId={info.id} players={players} matchStart={info.start} sprees={detailedSprees} bHardcore={info.hardcore}/>
                <MatchServerSettings info={info}/>
                <MatchWeaponSummaryCharts matchId={info.id} totalTeams={info.total_teams} playerData={players} weaponStats={weaponData}/>
                <MatchFragsGraph key="frag-graphs" 
                    matchId={matchId} 
                    players={players} 
                    teams={info.total_teams}
                    bHardcore={info.hardcore}
                    startTimestamp={info.start}
                    data={fragGraphData}
                />
                <MatchDominationSummary 
                    matchId={info.id} totalTeams={info.total_teams} mapId={info.map} playerData={players} 
                    matchStart={info.start} matchEnd={info.end} bHardcore={info.hardcore}
                    data={domSummaryData}
                />
                <MatchPlayerScoreHistory graphData={scoreHistory} matchStart={info.start} matchEnd={info.end} bHardcore={info.hardcore}/>
                <MatchRankingChanges data={rankingsData} players={players} matchId={matchId}/>
                <MatchTeamsSummary teamChanges={teamChanges} matchId={matchId} matchStart={info.start} players={players} totalTeams={info.total_teams}/>
                <MatchTeleFrags data={teleFrags} players={players} matchId={matchId} matchStart={info.start}/>
                <MatchKillsMatchUp matchId={matchId} players={players}/>
                <MatchItemsSummary matchId={matchId} players={players} totalTeams={info.total_teams}/>
                <MatchPlayerPingHistory matchId={matchId} players={players} playerIds={playerIds} matchStart={info.start} matchEnd={info.end} bHardcore={info.hardcore}/>
            </div>    
        </div>   
    </main>; 
}