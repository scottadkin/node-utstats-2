import {getNavSettings, getSettings, getPageOrder, PageComponentManager} from "../../api/sitesettings";
import { cookies, headers } from "next/headers";
import Session from "../../api/session";
import Matches from "../../api/matches";
import Players from "../../api/players";
import MatchesTableView from "./UI/MatchesTableView";
import Nav from "./UI/Nav";
import Screenshot from "./UI/Screenshot";
import { cleanMapName} from "../../api/generic.mjs";
import {getImages as getMapImages, getMostPlayed as getMostPlayedMaps} from "../../api/maps";
import HomeMostPlayedGametypes from "./UI/Home/HomeMostPlayedGametypes";
import Gametypes from "../../api/gametypes";
import HomeTopMaps from "./UI/Home/HomeTopMaps";
import PopularCountries from "./UI/Home/PopularCountries";
import CountriesManager from "../../api/countriesmanager";
import HomeGeneralStats from "./UI/Home/HomeGeneralStats";
import BasicPlayers from "./UI/Home/BasicPlayers";
import MostUsedFaces from "./UI/MostUsedFaces";
import { getAllInMatch } from "../../api/players";
import { getFacesWithFileStatuses, getMostUsed as getMostUsedFaces } from "../../api/faces";
import MatchesDefaultView from "./UI/MatchesDefaultView";
import { searchMatches } from "../../api/matches";
import HomeWeaponSummary from "./UI/Home/HomeWeaponSummary";
import { getAllTimeTotals as getAllTimeWeaponTotals } from "../../api/weapons";

export async function generateMetadata({ params, searchParams }, parent) {

 
  return {
    "title": "Node UTStats 2",
    "description": "Welcome to Node UTStats 2, view various stats for players,matches,maps,records and more!",
    "keywords": ["home" , "welcome", "utstats", "node"],
  }
}




export default async function Page(){

    const cookieStore = await cookies();
    const header = await headers();
    const cookiesData = cookieStore.getAll();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings();
    const sessionSettings = session.settings;
    const pageSettings = await getSettings("Home");
    const pageOrder = await getPageOrder("Home");
    
    const matchManager = new Matches();
    const playerManager = new Players();
    const gametypeManager = new Gametypes();
    
    const elems = [];

    const pageManager = new PageComponentManager(pageSettings, pageOrder, elems);
  
	const totalPlayers = await playerManager.getTotalPlayers();

    if(pageManager.bEnabled("Display Recent Matches")){

        const matchesData = await searchMatches(0,0,0,0, pageSettings["Recent Matches To Display"], "date", "desc");

        if(matchesData.totalMatches > 0){

            pageManager.addComponent("Display Recent Matches", <div className="default" key="recent-matches">
                <div className="default-header">Recent Matches</div>
                   
                {(pageSettings["Recent Matches Display Type"] === "default") ? <MatchesDefaultView data={matchesData.matches}/> : null}
                {(pageSettings["Recent Matches Display Type"] === "table") ? <MatchesTableView bHome={true} data={matchesData.matches}/>   : null}
                   
            </div>)
        }
    }

    if(pageManager.bEnabled("Display Latest Match")){

        const latestMatch = await searchMatches(0, 0, 0, 0, 1, "date", "desc");

        if(latestMatch.totalMatches > 0){

            const latestMatchPlayers = await getAllInMatch(latestMatch.matches[0].id);

            const playerFaces = [];

            for(let i = 0; i < latestMatchPlayers.length; i++){

                if(playerFaces.indexOf(latestMatchPlayers[i].face) === -1){
                    playerFaces.push(latestMatchPlayers[i].face);
                }
            }

            const latestFaces = await getFacesWithFileStatuses(playerFaces);

            const latestMapName = latestMatch.matches[0].mapName;
            const mapImage = getMapImages([latestMapName]);

            let latestMatchImage = "default";

            const mapImageName = cleanMapName(latestMapName).toLowerCase();

            if(mapImage[mapImageName] !== undefined){
                latestMatchImage = mapImage[mapImageName];
            }


            pageManager.addComponent("Display Latest Match", 
                <div className="default" key="sshot">
                    <Screenshot map={latestMatch.matches[0].mapName} totalTeams={latestMatch.matches[0].total_teams} players={latestMatchPlayers} 
                    image={`/images/maps/${latestMatchImage}.jpg`} 
                    matchData={latestMatch.matches[0]}
                    title="Latest Match Screenshot"
                    serverName={latestMatch.matches[0].serverName} gametypeName={latestMatch.matches[0].gametypeName} faces={latestFaces} bHome={true}/>
                </div>);
        }

    }

    if(pageManager.bEnabled("Display Most Played Gametypes")){

        const gametypeStats = await gametypeManager.getMostPlayed(5);
        if(gametypeStats.length > 0){
            const imageGametypeNames = [];

            for(let i = 0; i < gametypeStats.length; i++){
                imageGametypeNames.push(gametypeStats[i].name.replace(/ /ig,"").replace(/tournament/ig, "").toLowerCase());
            }

            const gametypeImages = gametypeManager.getMatchingImages(imageGametypeNames, false);

        
            pageManager.addComponent("Display Most Played Gametypes", <div key="gametypes" className="default">
                <HomeMostPlayedGametypes data={gametypeStats} images={gametypeImages}/>
            </div>);
        }
    }

    if(pageManager.bEnabled("Display Most Played Maps")){

        const mostPlayedMaps = await getMostPlayedMaps(4);

        const mapNames = [];

        for(let i = 0; i < mostPlayedMaps.length; i++){

            const m = mostPlayedMaps[i];
            mapNames.push(m.name);  
        }

        const mapImages = getMapImages(mapNames);

        pageManager.addComponent("Display Most Played Maps", <div className="default" key="top-maps">
            <HomeTopMaps maps={mostPlayedMaps} images={mapImages}/>
        </div>);
    }

 
    if(pageManager.bEnabled("Display Most Popular Countries")){

        const cm = new CountriesManager();
        
        const countryData = await cm.getMostPopular(parseInt(pageSettings["Popular Countries Display Limit"]));

       pageManager.addComponent("Display Most Popular Countries",<PopularCountries key="pc" 
            totalPlayers={totalPlayers}
            settings={{
                "Popular Countries Display Type": pageSettings["Popular Countries Display Type"]
            }}
            data={countryData}
        />);
    }


    pageManager.addComponent("Display Recent Matches & Player Stats",<HomeGeneralStats key="general-stats"/>);



    if(pageManager.bEnabled("Display Recent Players")){

        const recentPlayersData = await playerManager.getRecentPlayers(5);
        if(recentPlayersData.length > 0){

            const faceIds = new Set([...recentPlayersData.map((d) =>{ return d.face; })]);
            
            const faceFiles = await getFacesWithFileStatuses([...faceIds]);

            pageManager.addComponent("Display Recent Players", <div className="default"key={"recent-players"} ><BasicPlayers 
                title="Recent Players" 
                players={recentPlayersData} 
                faceFiles={faceFiles}
            /></div>);
        }
    }


    if(pageManager.bEnabled("Display Addicted Players")){

        const addictedPlayersData = await playerManager.getAddictedPlayers(5);

        if(addictedPlayersData.length > 0){

            const faceIds = new Set([...addictedPlayersData.map((d) =>{ return d.face; })]);
            
            const faceFiles = await getFacesWithFileStatuses([...faceIds]);

            pageManager.addComponent("Display Addicted Players",<div className="default" key={"addicted-players"}><BasicPlayers 
                title="Addicted Players" 
                players={addictedPlayersData} 
                faceFiles={faceFiles}
            /></div>);
        }
    }

    if(pageManager.bEnabled("Display Most Used Faces")){

        const mostUsedFaces = await getMostUsedFaces(5);
        const faceIds = new Set([...mostUsedFaces.map((d) =>{ return d.id; })]);
        const faceFiles = await getFacesWithFileStatuses([...faceIds]);

        pageManager.addComponent("Display Most Used Faces",<MostUsedFaces key={"faces"} data={mostUsedFaces} images={faceFiles}/>);
    }

    if(pageManager.bEnabled("Display Weapons Summary")){
        
        const weaponData = await getAllTimeWeaponTotals();
        pageManager.addComponent("Display Weapons Summary", <HomeWeaponSummary key="weapons" data={weaponData}/>);
    }

    
    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">

            {elems}      
        </div>   
    </main>; 
}