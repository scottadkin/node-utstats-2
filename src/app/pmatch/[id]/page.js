

import Nav from "../../UI/Nav";
import { getNavSettings, getSettings } from "../../../../api/sitesettings";
import Session from "../../../../api/session";
import { headers, cookies } from "next/headers";
import { getAllInMatch, getBasicPlayersByIds } from "../../../../api/players";
import PlayerMatchProfile from "../../UI/PMatch/PlayerMatchProfile";
import { getMatch, getMatchIdFromHash } from "../../../../api/matches";
import MatchSummary from "../../UI/Match/MatchSummary";
import Screenshot from "../../UI/Screenshot";
import { getFacesWithFileStatuses } from "../../../../api/faces";

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

    const pageSettings = await getSettings("Matches Page");

    const playersInfo = await getBasicPlayersByIds([playerId]);

    const basicInfo = playersInfo[playerId];

    const matchInfo = await getMatch(matchId);
    const players = await getAllInMatch(matchId);
    console.log(matchInfo);

    const faceIds = new Set(players.map((p) =>{
        return p.face;
    }));

    const faces = await getFacesWithFileStatuses([...faceIds]);

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
            </div>
            
        </div>  
    </main>; 
}