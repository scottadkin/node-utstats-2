import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import { getNavSettings, getPageOrder, getSettings, PageComponentManager } from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { getPlayerById } from "../../../../api/player";
import PlayerGeneral from "../../UI/Player/PlayerGeneral";
import { getCountryName } from "../../../../api/countries";
import { getFacesWithFileStatuses } from "../../../../api/faces";
import ErrorPage from "../../UI/ErrorPage";
import { getProfileGametypeStats, getProfileFragStats } from "../../../../api/player";
import PlayerGametypeStats from "../../UI/Player/PlayerGametypeStats";
import PlayerFragSummary from "../../UI/Player/PlayerFragSummary";
import { getAllRankings, getSpecialEvents } from "../../../../api/player";
import PlayerRankings from "../../UI/Player/PlayerRankings";
import PlayerSpecialEvents from "../../UI/Player/PlayerSpecialEvents";

function setQueryVars(params, searchParams){

    let playerId = (params.id !== undefined) ? parseInt(params.id) : 0;
    if(playerId !== playerId) playerId = 0;


    return {playerId}
}

export default async function Page({params, searchParams}){

    const header = await headers();

    params = await params;
    searchParams = await searchParams;

    console.log(params);
    const {playerId} = setQueryVars(params, searchParams);

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings();
    const pageSettings = await getSettings("Player Pages");
    const pageOrder = await getPageOrder("Player Pages");
    const sessionSettings = session.settings;

    const elems = [];
    const pageManager = new PageComponentManager(pageSettings, pageOrder, elems);


    const basic = await getPlayerById(playerId);

    if(basic === null){
        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Failed to get player">
            There are no players with that id.
        </ErrorPage>
    }

    const faces = await getFacesWithFileStatuses([basic.face]);
 
    console.log(pageSettings);

    if(pageManager.bEnabled("Display Gametype Stats")){

        const gametypeStats = await getProfileGametypeStats(playerId);

        pageManager.addComponent("Display Gametype Stats", <PlayerGametypeStats key="gametype-stats" data={gametypeStats} />);
    }

    if(pageManager.bEnabled("Display Frag Summary")){

        const fragStats = await getProfileFragStats(playerId);
        pageManager.addComponent("Display Frag Summary", <PlayerFragSummary key="frags" data={fragStats} />);
    }

    if(pageManager.bEnabled("Display Rankings")){

        const rankingData = await getAllRankings(playerId);
        pageManager.addComponent("Display Rankings", <PlayerRankings key="rankings" data={rankingData}/>);
    }
    
    if(pageManager.bEnabled("Display Special Events")){

        const specalEvents = await getSpecialEvents(playerId);
        pageManager.addComponent("Display Special Events", <PlayerSpecialEvents key="special-events" data={specalEvents}/>);
    }

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Player Profile</div>
                <PlayerGeneral data={basic} country={getCountryName(basic.country)} face={faces[basic.face].name}/>
                {elems}
            </div>    
        </div>   
    </main>
}