import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import {getSettings, getNavSettings, getPageOrder} from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { getBasic, getSpawns, getGraphHistoryData, getTopPlayersPlaytime } from "../../../../api/maps";
import { removeUnr, getGametypePrefix, cleanMapName, convertTimestamp } from "../../../../api/generic.mjs";
import MapSummary from "../../UI/Maps/MapSummary";
import MapHistoryGraph from "../../UI/Maps/MapHistoryGraph";
import { getFlagLocations, bMapHaveCTFCaps } from "../../../../api/ctf";
import MapSpawns from "../../UI/Maps/MapSpawns";
import MapCTFCaps from "../../UI/Maps/MapCTFCaps";
import { getMapFullControlPoints } from "../../../../api/domination";
import MapDomControlPoints from "../../UI/Maps/MapDomControlPoints";
import { getMapObjectives, getMapImages as getMapAssaultImages } from "../../../../api/assault";
import MapAssaultObjectives from "../../UI/Maps/MapAssaultObjectives";
import MapAddictedPlayers from "../../UI/Maps/MapAddictedPlayers";
import MapLongestMatches from "../../UI/Maps/MapLongestMatches";
import CombogibMapRecords from "../../UI/Maps/CombogibMapRecords";
import CombogibMapTotals from "../../UI/Maps/CombogibMapTotals";
import { searchMatches } from "../../../../api/matches";
import MapRecentMatches from "../../UI/Maps/MapRecentMatches";

function setQueryValues(params, searchParams){

    let id = params.id ?? 0;
    id = parseInt(id);
    if(id !== id) id = 0;

    return {id};
}

export async function generateMetadata({ params, searchParams }, parent) {

    params = await params;
    searchParams = await searchParams;

    const {id} = setQueryValues(params, searchParams);

    const basic = await getBasic(id);

    if(basic === null){
        return {
            "title": "Map Not Found - Node UTStats 2",
            "description": "Could not find the map you were looking for,",
            "keywords": ["map", "utstats", "node"],
        }
    }
    
    return {
        "title": `${removeUnr(basic.name)} - Node UTStats 2`,
        "description": `${removeUnr(basic.name)} (${basic.title}) created by ${basic.author}, ${basic.matches} matches played since ${convertTimestamp(basic.first)}, last played ${convertTimestamp(basic.last)}`,
        "keywords": ["map", "utstats", "node"],
        "openGraph": {
            "images": [`/images/maps/${basic.image}.jpg`]
        }
    }
}

export default async function Page({params, searchParams}){

    params = await params;
    searchParams = await searchParams;

    const {id} = setQueryValues(params, searchParams);

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
   // const siteSettings = new SiteSettings();
    const navSettings = await getNavSettings();
    const pageSettings = await getSettings("Map Pages");
    const sessionSettings = session.settings;
    const matchesSettings = await getSettings("Matches Page");
    
    const pageOrder = await getPageOrder("Map Pages");

    const basic = await getBasic(id);
    const spawns = await getSpawns(id);
    const historyGraphData = (pageSettings["Display Games Played"] === "true") ? await getGraphHistoryData(id) : null;
    const flagLocations = await getFlagLocations(id);

    if(basic === null){

        return <main>
            <Nav settings={navSettings} session={sessionSettings}/>		
            <div id="content">
                <div className="default">
                    <div className="default-header">Map Doesn't exist</div>
                </div>    
            </div>   
        </main>; 
    }

    basic.name = removeUnr(basic.name);
    const gametypePrefix = getGametypePrefix(basic.name);    
    
    const elems = [];

    

    if(pageSettings["Display Control Points (Domination)"] === "true"){
        const domControlPoints = await getMapFullControlPoints(id);
        elems[pageOrder["Display Control Points (Domination)"]] = <MapDomControlPoints key="dom-control" points={domControlPoints}/>;
    }

    if(pageSettings["Display Summary"] === "true"){
        elems[pageOrder["Display Summary"]] = <MapSummary key="map-sum" data={basic} spawns={spawns}/>;
    }

    if(pageSettings["Display Games Played"] === "true" && historyGraphData != null){
        elems[pageOrder["Display Games Played"]] = <MapHistoryGraph key="history-graph" data={historyGraphData} />;
    }

    if(pageSettings["Display Spawn Points"] === "true"){
        elems[pageOrder["Display Spawn Points"]] = <MapSpawns key="spawns" spawns={spawns} flagLocations={flagLocations}/>;
    }

    if(pageSettings["Display CTF Caps"] === "true"){

        const bAnyCTFCaps = await bMapHaveCTFCaps(id);
        if(bAnyCTFCaps){
            elems[pageOrder["Display CTF Caps"]] = <MapCTFCaps key="ctf-caps" mapId={id} perPage={25} page={1} mode="solo"/>;
        }
    }

    if(pageSettings["Display Map Objectives"] === "true"){

        const assaultObjectives = await getMapObjectives(id);
        const assaultImages = await getMapAssaultImages(cleanMapName(basic.name));

        elems[pageOrder["Display Map Objectives"]] = <MapAssaultObjectives key="assault-obj"
            objects={assaultObjectives} mapPrefix={gametypePrefix} 
            mapName={cleanMapName(basic.name)} images={assaultImages}
        />;
    }

    if(pageSettings["Display Addicted Players" === "true"]){
        const addictedPlayers = await getTopPlayersPlaytime(id, pageSettings["Max Addicted Players"]);
        elems[pageOrder["Display Addicted Players"]] = <MapAddictedPlayers key="addic" players={addictedPlayers}/>;
    }

    if(pageSettings["Display Longest Matches"] === "true"){
        //const longestMatches = await getLongestMatches(id, pageSettings["Max Longest Matches"], basic.name);
        const longestMatches = await searchMatches(0,0,id,0,pageSettings["Max Longest Matches"], "playtime", "desc");
        elems[pageOrder["Display Longest Matches"]] = <MapLongestMatches key="longest" data={longestMatches.matches}/>;
    }

    if(pageSettings["Display Recent Matches"] === "true"){

        const recentMatches = await searchMatches(0,0,id, 0, 10, "date", "desc");
        elems[pageOrder["Display Recent Matches"]] = <MapRecentMatches key="recent"  data={recentMatches.matches} />;
    }

    if(pageSettings["Display Combogib Player Records"] === "true"){
        elems[pageOrder["Display Combogib Player Records"]] = <CombogibMapRecords key="combo-records" mapId={id}/>;
    }
    

    if(pageSettings["Display Combogib General Stats"] === "true"){
        elems[pageOrder["Display Combogib General Stats"]] = <CombogibMapTotals key="combo-totals" mapId={id} />
    }
    
    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{basic.name}</div>
                {elems}
             
            </div>    
        </div>   
    </main>; 
}