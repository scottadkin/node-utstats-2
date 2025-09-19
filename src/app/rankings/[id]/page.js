import { headers, cookies } from "next/headers";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import Nav from "../../UI/Nav";
import RankingFilter from "../../UI/Rankings/RankingFilter";
import {getDetailedSettings} from "../../../../api/rankings";
import { setIdNames } from "../../../../api/generic.mjs";
import Rankings from "../../../../api/rankings";
import Gametypes from "../../../../api/gametypes";
import Maps from "../../../../api/maps";
import Players from "../../../../api/players";

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Player Rankings - Node UTStats 2",
        "description": "View player rankings for various gametypes and time frames.",
        "keywords": ["ranking", "players", "utstats", "node"],
    }
}


function setQuery(query, pageSettings){

    let page = 1;
    let perPage = 25;

    let gametype = parseInt(query.id);

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
    console.log(DEFAULT_ACTIVE);
    const DEFAULT_MIN_PLAYTIME = pageSettings["Default Min Playtime"];

    let lastActive = (query.lastActive !== undefined) ? parseInt(query.lastActive) : DEFAULT_ACTIVE;

    if(lastActive !== lastActive) lastActive = DEFAULT_ACTIVE;
    lastActive = lastActive.toString();

    let minPlaytime = (query.minPlaytime !== undefined) ? parseInt(query.minPlaytime) : DEFAULT_MIN_PLAYTIME;
    if(minPlaytime !== minPlaytime) minPlaytime = DEFAULT_MIN_PLAYTIME;
    minPlaytime = minPlaytime.toString();


    return {page, perPage, minPlaytime, lastActive, gametype};
}

export default async function Page({params}){

    const header = await headers();

    const query = await params;

    console.log(query);

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


    const rankingManager = new Rankings();
    const gametypeManager = new Gametypes();
    const playerManager = new Players();

    const gametypeNames = await gametypeManager.getAllNames();

    const gametypeIds = [];

    for(const key of Object.keys(gametypeNames)){

        gametypeIds.push(parseInt(key));
    }

    let {page, perPage, minPlaytime, lastActive, gametype} = setQuery(query, pageSettings);

    let data = [];

    if(gametype === 0){

        //get all gametypes top 10 ect
        if(gametypeIds.length <= 1){
            perPage = parseInt(pageSettings["Rankings Per Page (Individual)"]);
        }

        //CHANGE TO LAST ACTIVE GAMETYPE INSTEAD OF DISPLAYING ALL

       // data = await rankingManager.getMultipleGametypesData(gametypeIds, perPage, lastActive, minPlaytime);
        
    }else{
        data.push({"id": gametype, "data": await rankingManager.getData(gametype, page, perPage, lastActive, minPlaytime)});
    }




    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Rankings</div>
                <RankingFilter settings={rankingSettings} lastActive={lastActive} minPlaytime={minPlaytime}/>
            </div>
            
        </div>   
    </main>; 
}