import { headers, cookies } from "next/headers";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import Nav from "../../UI/Nav";
import RankingFilter from "../../UI/Rankings/RankingFilter";
import {getDetailedSettings} from "../../../../api/rankings";
import { getTopPlayersEveryGametype } from "../../../../api/rankings";
import RankingTable from "../../UI/Rankings/RankingTable";
import { getAllObjectNames } from "../../../../api/genericServerSide.mjs";

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Player Rankings - Node UTStats 2",
        "description": "View player rankings for various gametypes and time frames.",
        "keywords": ["ranking", "players", "utstats", "node"],
    }
}

function setQuery(query, params, pageSettings){

    let page = 1;
    let perPage = 25;

    let gametype = parseInt(params.id);

    if(gametype !== 0){

        if(query.page !== undefined){

            page = parseInt(query.page);

            if(page !== page){
                page = 1;
            }else{

                if(page < 1) page = 1;
            }
        }

        perPage = parseInt(pageSettings["Rankings Per Page (Individual)"]);
    }else{
        perPage = parseInt(pageSettings["Rankings Per Gametype (Main)"]);
    }

    const DEFAULT_ACTIVE = pageSettings["Default Last Active"];
    const DEFAULT_MIN_PLAYTIME = parseInt(pageSettings["Default Min Playtime"]);


    let lastActive = (query.lastActive !== undefined) ? parseInt(query.lastActive) : DEFAULT_ACTIVE;

    if(lastActive !== lastActive) lastActive = DEFAULT_ACTIVE;
    lastActive = lastActive.toString();


    let minPlaytime = (query.minPlaytime !== undefined) ? parseInt(query.minPlaytime) : DEFAULT_MIN_PLAYTIME;

    if(minPlaytime !== minPlaytime) minPlaytime = DEFAULT_MIN_PLAYTIME;
    minPlaytime = minPlaytime.toString();

    return {page, perPage, minPlaytime, lastActive, gametype};
}

export default async function Page({params, searchParams}){

    const header = await headers();

    const query = await searchParams;
    const p = await params;

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = session.settings;

    const rankingSettings = await getDetailedSettings();

    const pageSettings = await siteSettings.getCategorySettings("rankings");

    const gametypes = await getAllObjectNames("gametypes");

    const gametypeNames = [];

    for(const [id, name] of Object.entries(gametypes)){
        gametypeNames.push({id, name});
    }

    gametypeNames.sort((a, b) =>{
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });
    
    let {page, perPage, minPlaytime, lastActive, gametype} = setQuery(query, p, pageSettings);

    const elems = [];

    if(gametype === 0){

        //get all gametypes top 10 ect
        if(Object.keys(gametypes).length <= 1){
            perPage = parseInt(pageSettings["Rankings Per Page (Individual)"]);
        }

        const data = await getTopPlayersEveryGametype(perPage, lastActive, minPlaytime);

        for(let i = 0; i < gametypeNames.length; i++){

            const {id, name} = gametypeNames[i];

            if(data[id] === undefined) continue;
            elems.push(<RankingTable key={id} title={name} data={data[id]}/>);
        }

        
    }else{
       // data.push({"id": gametype, "data": await rankingManager.getData(gametype, page, perPage, lastActive, minPlaytime)});
    }

    //console.log(data);



    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Rankings</div>
                <RankingFilter settings={rankingSettings} lastActive={lastActive} minPlaytime={minPlaytime}/>
            </div>
            {elems}
            
        </div>   
    </main>; 
}