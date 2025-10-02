import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import {getSettings, getNavSettings, getPageOrder} from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import MatchSummary from "../../UI/Match/MatchSummary";
import { getMatch, getMatchIdFromHash } from "../../../../api/matches";
import Screenshot from "../../UI/Screenshot";
import { getAllInMatch } from "../../../../api/players";
import { getFacesWithFileStatuses } from "../../../../api/faces";
import MatchFragSummary from "../../UI/Match/MatchFragSummary";

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
    console.log(faceIds);
    console.log(faces);

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

    console.log(info);

    //map, totalTeams, players, image, matchData, serverName, gametypeName, faces, highlight, bHome, bClassic
    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Match Report</div>
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
            </div>    
        </div>   
    </main>; 
}