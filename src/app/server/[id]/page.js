import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import { getNavSettings, getPageOrder, getSettings, PageComponentManager } from "../../../../api/sitesettings";
import { cookies, headers } from "next/headers";
import { getServer } from "../../../../api/servers";
import ErrorPage from "../../UI/ErrorPage";
import BasicInfo from "../../UI/Server/BasicInfo";
import Screenshot from "../../UI/Screenshot";
import { getMatch } from "../../../../api/matches";
import { getAllInMatch } from "../../../../api/players";
import { getFacesWithFileStatuses } from "../../../../api/faces";
import { getRecentPingInfo } from "../../../../api/servers";
import PingGraph from "../../UI/Server/PingGraph";
import { searchMatches } from "../../../../api/matches";
import RecentMatches from "../../UI/Server/RecentMatches";

export async function generateMetadata({ params, searchParams }, parent) {

    const query = await params;
    const serverId = (query.id !== undefined) ? parseInt(query.id) : NaN;

    let title = "Not Found";

    let basicInfo = null;

    if(serverId === serverId){

        basicInfo = await getServer(serverId);
    }

    if(basicInfo !== null){
        title = basicInfo.name;
    }

    return {
        "title": `${title} - Node UTStats 2`,
        "description": `View information about the Unreal Tournament Server called ${title}`
    }
}

export default async function Page({params, searchParams}){

    const query = await params;
    const cookieStore = await cookies();
    const header = await headers();
    const cookiesData = cookieStore.getAll();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings();
    const sessionSettings = session.settings;

    const pageSettings = await getSettings("Server Page");
    const pageOrder = await getPageOrder("Server Page");

    const serverId = (query.id !== undefined) ? parseInt(query.id) : NaN;

    if(serverId !== serverId){

        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Invalid ServerId">
            ServerId must be a valid integer.
        </ErrorPage>
    }

    const basicInfo = await getServer(serverId);

    if(basicInfo === null){
        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Server Not Found">
            There are no servers with that id.
        </ErrorPage>
    }

    const elems = [];


    const pageManager = new PageComponentManager(pageSettings, pageOrder, elems);

    if(pageManager.bEnabled("Display Latest Match Screenshot")){

        const lastMatchData = await getMatch(basicInfo.last_match_id);

        if(lastMatchData !== null){

            const playerData = await getAllInMatch(basicInfo.last_match_id);
            const faceIds = new Set(playerData.map((p) =>{
                return p.face;
            }));
        
            const faces = await getFacesWithFileStatuses([...faceIds]);

            pageManager.addComponent("Display Latest Match Screenshot", <Screenshot 
                key="latest-sshot"
                title="Latest Match Screenshot"
                map={lastMatchData.mapName} 
                totalTeams={lastMatchData.total_teams} 
                players={playerData} 
                image={`/images/maps/${lastMatchData.image}.jpg`} 
                matchData={lastMatchData} 
                serverName={lastMatchData.serverName} 
                gametypeName={lastMatchData.gametypeName} 
                faces={faces} 
            />);
        }
    }

    pageManager.addComponent("Display Basic Summary", <BasicInfo key="basic" data={basicInfo}/>);

    if(pageManager.bEnabled("Display Ping Graph")){

        const pingData = await getRecentPingInfo(serverId, 50);
        pageManager.addComponent("Display Ping Graph", <PingGraph key="pings" data={pingData}/>);
    }


    console.log(pageSettings);

    if(pageManager.bEnabled("Display Recent Matches")){

        pageManager.addComponent(
            "Display Recent Matches", 
            <RecentMatches key="recent-matches" serverId={serverId} displayMode={pageSettings["Default Display Type"]}/>
        );

    }
    

    
    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{basicInfo.name}</div>        
                
                {elems}
            </div>    
        </div>   
    </main>
}