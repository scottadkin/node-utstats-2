import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import {getSettings, getNavSettings} from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { getBasic, getSpawns, getGraphHistoryData, getTopPlayersPlaytime, getLongestMatches, getRecent as getRecentMatches } from "../../../../api/maps";
import { removeUnr, getGametypePrefix, cleanMapName } from "../../../../api/generic.mjs";
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
import MapRecentMatches from "../../UI/Maps/MapRecentMatches";
import CombogibMapRecords from "../../UI/Maps/CombogibMapRecords";
import CombogibMapTotals from "../../UI/Maps/CombogibMapTotals";

function setQueryValues(params, searchParams){

    let id = params.id ?? 0;
    id = parseInt(id);
    if(id !== id) id = 0;

    return {id};
}

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Map - Node UTStats 2",
        "description": "",
        "keywords": ["map", "utstats", "node"],
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

    const basic = await getBasic(id);
    const spawns = await getSpawns(id);
    const historyGraphData = (pageSettings["Display Games Played"] === "true") ? await getGraphHistoryData(id) : null;


    const flagLocations = await getFlagLocations(id);
    console.log(basic);

    
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
    
    console.log(pageSettings);

    const bAnyCTFCaps = await bMapHaveCTFCaps(id);
    const domControlPoints = await getMapFullControlPoints(id);
    const assaultObjectives = await getMapObjectives(id);
    const assaultImages = await getMapAssaultImages(cleanMapName(basic.name));
    const addictedPlayers = await getTopPlayersPlaytime(id, pageSettings["Max Addicted Players"]);
    const longestMatches = await getLongestMatches(id, pageSettings["Max Longest Matches"], basic.name);
    const recentMatches = await getRecentMatches(id, 1, 10, matchesSettings, basic.name);

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{basic.name}</div>
                {(pageSettings["Display Summary"] === "false") ? null :<MapSummary data={basic} spawns={spawns}/>}
                {(historyGraphData === null) ? null :<MapHistoryGraph data={historyGraphData} />}
                {(pageSettings["Display Spawn Points"] === "true") ? <MapSpawns spawns={spawns} flagLocations={flagLocations}/> : null}
                {(bAnyCTFCaps && pageSettings["Display CTF Caps"] === "true") ? <MapCTFCaps mapId={id} perPage={25} page={1} mode="solo"/> : null}
                <MapDomControlPoints points={domControlPoints}/>
                <MapAssaultObjectives objects={assaultObjectives} mapPrefix={gametypePrefix} mapName={cleanMapName(basic.name)} images={assaultImages}/>
                <MapAddictedPlayers players={addictedPlayers}/>
                <MapLongestMatches data={longestMatches}/>
                <MapRecentMatches data={recentMatches} />
                <CombogibMapRecords mapId={id}/>
                <CombogibMapTotals mapId={id} />
            </div>    
        </div>   
    </main>; 
}