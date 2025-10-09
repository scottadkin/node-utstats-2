

import Nav from "../../UI/Nav";
import { getNavSettings, getPageOrder, getSettings, PageComponentManager } from "../../../../api/sitesettings";
import Session from "../../../../api/session";
import { headers, cookies } from "next/headers";
import { getAllInMatch, getBasicPlayersByIds } from "../../../../api/players";
import PlayerMatchProfile from "../../UI/PMatch/PlayerMatchProfile";
import { getMatch, getMatchIdFromHash } from "../../../../api/matches";
import MatchSummary from "../../UI/Match/MatchSummary";
import Screenshot from "../../UI/Screenshot";
import { getFacesWithFileStatuses } from "../../../../api/faces";
import { getPlayerFromMatchData } from "../../../../api/generic.mjs";
import MatchFragSummary from "../../UI/Match/MatchFragSummary";
import MatchSpecialEvents from "../../UI/Match/MatchSpecialEvents";
import MatchCTFSummary from "../../UI/Match/MatchCTFSummary";
import { getMatchFlagKillDetails, getPlayerMatchReturns } from "../../../../api/ctf";
import { getPlayerMatchData as getPlayerWeaponData } from "../../../../api/weapons";
import PlayerMatchWeapons from "../../UI/PMatch/PlayerMatchWeapons";
import { getPlayerMatchKills as getPlayerMatchTeleFragKills } from "../../../../api/telefrags";
import PlayerMatchTeleFrags from "../../UI/PMatch/PlayerMatchTeleFrags";
import { getPlayerMatchRankingInfo } from "../../../../api/rankings";
import PlayerMatchRanking from "../../UI/PMatch/PlayerMatchRanking";
import { getPlayerMatchData as getPlayerTeamChanges } from "../../../../api/teams";
import PlayerMatchTeamChanges from "../../UI/PMatch/PlayerMatchTeamChanges";
import { getMatchSinglePlayerTotalCaps } from "../../../../api/domination";
import PlayerMatchDomination from "../../UI/PMatch/PlayerMatchDomination";
import { getPlayerMatchData as getPlayerPingData } from "../../../../api/pings";
import PlayerMatchPing from "../../UI/PMatch/PlayerMatchPing";
import { getPlayerMatchData as getPlayerItemsData } from "../../../../api/items";
import PlayerMatchPickups from "../../UI/PMatch/PlayerMatchPickups";
import PlayerMatchCTFReturns from "../../UI/PMatch/PlayerMatchCTFReturns";
import { getPlayerMatchCaps } from "../../../../api/ctf";
import PlayerMatchCTFCaps from "../../UI/PMatch/PlayerMatchCTFCaps";

function setQueryVars(params, searchParams){

    let matchId = (params.id !== undefined) ? parseInt(params.id) : 0;
    if(matchId !== matchId) matchId = 0;
    let playerId = (searchParams.player !== undefined) ? parseInt(searchParams.player) : 0;
    if(playerId !== playerId) playerId = 0;
    


    return {matchId, playerId};
}

export default async function Page({params, searchParams}){

    params = await params;
    searchParams = await searchParams;

    console.log(params);
    console.log(searchParams);

    let {playerId, matchId} = setQueryVars(params, searchParams);

    if(matchId.length === 32){
        matchId = await getMatchIdFromHash(matchId);
    }

    console.log(playerId, matchId);
    const cookieStore = await cookies();
    const header = await headers();
    const cookiesData = cookieStore.getAll();


    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    
    const session = new Session(ip, JSON.stringify(cookiesData));

    await session.load();
    const navSettings = await getNavSettings("Navigation");
    const sessionSettings = JSON.stringify(session.settings);

    const pageSettings = await getSettings("Match Pages");
    const pageOrder = await getPageOrder("Match Pages");

    const elems = [];

    const pageManager = new PageComponentManager(pageSettings, pageOrder, elems);

    const playersInfo = await getBasicPlayersByIds([playerId]);

    const basicInfo = playersInfo[playerId];

    const matchInfo = await getMatch(matchId);
    const players = await getAllInMatch(matchId);
    console.log(matchInfo);



    const targetPlayer = getPlayerFromMatchData(players, playerId, true);


    const faceIds = new Set(players.map((p) =>{
        return p.face;
    }));

    const faces = await getFacesWithFileStatuses([...faceIds]);

    let matchCTFFlagKills  = null;
    
    if(pageManager.bEnabled("Display Capture The Flag Summary")){
        matchCTFFlagKills = await getMatchFlagKillDetails(matchId, matchInfo.map, playerId);
    }

    let weaponStats = null;

    if(pageManager.bEnabled("Display Weapon Statistics")){
        weaponStats = await getPlayerWeaponData(playerId, matchId);
    }


    let teleFrags = null;

    teleFrags = await getPlayerMatchTeleFragKills(matchId, playerId);


    let rankingData = null;
    rankingData = await getPlayerMatchRankingInfo(matchId, matchInfo.gametype, playerId);

    let teamChanges = null;

    teamChanges = await getPlayerTeamChanges(matchId, playerId);
    

    let domCaps = null;

    domCaps = await getMatchSinglePlayerTotalCaps(matchId, playerId);
    

    let pingData = null;

    pingData = await getPlayerPingData(matchId, playerId);
   
    let itemsData = null;

    itemsData = await getPlayerItemsData(matchId, playerId);


    let ctfReturnData = null;

    ctfReturnData = await getPlayerMatchReturns(matchId, playerId);

    let ctfCaps = null;

    ctfCaps = await getPlayerMatchCaps(matchId, playerId);
    console.log("ctfCaps");
    console.log(ctfCaps);



    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content"> 
            <div className="default m-bottom-25">
                <div className="default-header">Match Report For {basicInfo.name}</div>	
                <PlayerMatchProfile data={basicInfo} matchId={matchId} playerId={playerId}/>
                <MatchSummary 
                    key={"m-s"} 
                    info={matchInfo}
                    settings={pageSettings}
                />
                <Screenshot 
                    faces={faces} 
                    players={players} 
                    map={matchInfo.mapName}
                    totalTeams={matchInfo.total_teams} 
                    image={`/images/maps/${matchInfo.image}.jpg`}
                    matchData={matchInfo}
                    serverName={matchInfo.serverName} 
                    gametypeName={matchInfo.gametypeName}
                    bHome={false} 
                    bClassic={false}
                    key="shot"
                    highlight={basicInfo.name}
                />
                <MatchFragSummary matchId={matchId} playerData={[targetPlayer]} totalTeams={matchInfo.total_teams} single={true}/>
                <MatchCTFSummary
                    key="ctf-s" 
                    matchId={matchId} 
                    playerData={[targetPlayer]} 
                    single={true}
                    flagKills={matchCTFFlagKills}
                />
                <MatchSpecialEvents matchId={matchId} bTeamGame={matchInfo.total_teams > 1} players={[targetPlayer]} bSingle={true} targetPlayerId={playerId}/>
                <PlayerMatchWeapons matchId={matchId} playerId={playerId} data={weaponStats}/>
                <PlayerMatchTeleFrags data={players} matchId={matchId} kills={teleFrags} matchStart={matchInfo.start} bHardcore={matchInfo.hardcore}/>
                <PlayerMatchRanking data={rankingData}/>
                <PlayerMatchTeamChanges matchStart={matchInfo.start} totalTeams={matchInfo.total_teams} teamChanges={teamChanges}/>
                <PlayerMatchDomination data={domCaps}/>
                <PlayerMatchPing data={pingData} matchStart={matchInfo.start} bHardcode={matchInfo.hardcore}/>
                <PlayerMatchPickups data={itemsData}/>
                <PlayerMatchCTFReturns players={[targetPlayer]} data={ctfReturnData} matchStart={matchInfo.start} bHardcode={matchInfo.hardcore}/>
                <PlayerMatchCTFCaps player={targetPlayer} data={ctfCaps} matchStart={matchInfo.start} bHardcore={matchInfo.hardcore}/>
            </div>
            
        </div>  
    </main>; 
}