

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
import { getPlayerMatchData as getCombogibData } from "../../../../api/combogib";
import CombogibPlayerMatch from "../../UI/PMatch/CombogibPlayerMatch";

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

    const targetPlayer = getPlayerFromMatchData(players, playerId, true);


    const faceIds = new Set(players.map((p) =>{
        return p.face;
    }));

    const faces = await getFacesWithFileStatuses([...faceIds]);

    let matchCTFFlagKills  = null;
    
    if(pageManager.bEnabled("Display Capture The Flag Summary")){

        matchCTFFlagKills = await getMatchFlagKillDetails(matchId, matchInfo.map, playerId);

        pageManager.addComponent("Display Capture The Flag Summary", <MatchCTFSummary
            key="ctf-s" 
            matchId={matchId} 
            playerData={[targetPlayer]} 
            single={true}
            flagKills={matchCTFFlagKills}
        />);
    }

    let weaponStats = null;

    if(pageManager.bEnabled("Display Weapon Statistics")){

        weaponStats = await getPlayerWeaponData(playerId, matchId);

        pageManager.addComponent("Display Weapon Statistics", <PlayerMatchWeapons 
            key="weapons" matchId={matchId} playerId={playerId} 
            data={weaponStats}
        />);
    }


    let teleFrags = null;

    if(pageManager.bEnabled("Display Telefrags Stats")){
        teleFrags = await getPlayerMatchTeleFragKills(matchId, playerId);
            pageManager.addComponent("Display Telefrags Stats", <PlayerMatchTeleFrags 
            key="tele" data={players} matchId={matchId} kills={teleFrags} 
            matchStart={matchInfo.start} bHardcore={matchInfo.hardcore}
        />);
    }


    let rankingData = null;

    if(pageManager.bEnabled("Display Rankings")){
        rankingData = await getPlayerMatchRankingInfo(matchId, matchInfo.gametype, playerId);
        pageManager.addComponent("Display Rankings", <PlayerMatchRanking key="rankings" data={rankingData}/>);
    }

    let teamChanges = null;

    if(pageManager.bEnabled("Display Team Changes")){

        teamChanges = await getPlayerTeamChanges(matchId, playerId);

        pageManager.addComponent("Display Team Changes",<PlayerMatchTeamChanges 
            key="teams" matchStart={matchInfo.start} totalTeams={matchInfo.total_teams} teamChanges={teamChanges}
        />);
    }
    

    let domCaps = null;

    if(pageManager.bEnabled("Display Domination Summary")){

        domCaps = await getMatchSinglePlayerTotalCaps(matchId, playerId);

        pageManager.addComponent("Display Domination Summary",<PlayerMatchDomination key="dom" data={domCaps}/>);
    }
    

    let pingData = null;

    if(pageManager.bEnabled("Display Player Ping Graph")){

        pingData = await getPlayerPingData(matchId, playerId);

        pageManager.addComponent("Display Player Ping Graph", <PlayerMatchPing key="ping" data={pingData} 
            matchStart={matchInfo.start} bHardcode={matchInfo.hardcore}
        />);
    }
   
    let itemsData = null;

    if(pageManager.bEnabled("Display Items Summary")){
        itemsData = await getPlayerItemsData(matchId, playerId);
        pageManager.addComponent("Display Items Summary",<PlayerMatchPickups key="items" data={itemsData}/>);
    }


    let ctfReturnData = null;

    if(pageManager.bEnabled("Display Capture The Flag Returns")){

        ctfReturnData = await getPlayerMatchReturns(matchId, playerId);

        pageManager.addComponent("Display Capture The Flag Returns",
            <PlayerMatchCTFReturns players={[targetPlayer]} key="ctf-returns" data={ctfReturnData}
             matchStart={matchInfo.start} bHardcode={matchInfo.hardcore}/>
        );
    }

    let ctfCaps = null;

    if(pageManager.bEnabled("Display Capture The Flag Caps")){

        ctfCaps = await getPlayerMatchCaps(matchId, playerId);
        
        pageManager.addComponent("Display Capture The Flag Caps",
            <PlayerMatchCTFCaps key="ctf-caps" player={targetPlayer} data={ctfCaps} 
            matchStart={matchInfo.start} bHardcore={matchInfo.hardcore}/>
        );
    }


    let comboData = null;

    if(pageManager.bEnabled("Display Combogib Stats")){
        comboData = await getCombogibData(playerId, matchId);
        pageManager.addComponent("Display Combogib Stats", <CombogibPlayerMatch key="combo" data={comboData}/>);
    }

    pageManager.addComponent("Display Special Events", <MatchSpecialEvents 
        matchId={matchId} bTeamGame={matchInfo.total_teams > 1} key="special-events"
        players={[targetPlayer]} bSingle={true} targetPlayerId={playerId}
    />);

    pageManager.addComponent("Display Frag Summary", <MatchFragSummary 
        key="frags" matchId={matchId} playerData={[targetPlayer]} totalTeams={matchInfo.total_teams} 
        single={true}
    />);
 

    pageManager.addComponent("Display Summary", <MatchSummary 
        key={"m-s"} 
        info={matchInfo}
        settings={pageSettings}
    />);

    pageManager.addComponent("Display Screenshot", <Screenshot 
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
    />);
    
    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content"> 
            <div className="default m-bottom-25">
                <div className="default-header">Match Report For {basicInfo.name}</div>	
                
                <PlayerMatchProfile data={basicInfo} matchId={matchId} playerId={playerId}/>
                {elems}
            </div>        
        </div>  
    </main>; 
}