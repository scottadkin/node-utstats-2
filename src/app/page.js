import SiteSettings from "../../api/sitesettings";
import { cookies, headers } from "next/headers";
import Session from "../../api/session";
import Matches from "../../api/matches";
import Players from "../../api/players";
import MatchesTableView from "./UI/MatchesTableView";
import Nav from "./UI/Nav";
import Screenshot from "./UI/Screenshot";
import { cleanMapName, removeUnr, getUniqueValues } from "../../api/generic.mjs";
import Faces from "../../api/faces";
import {getImages as getMapImages, getMostPlayed as getMostPlayedMaps} from "../../api/maps";
import HomeMostPlayedGametypes from "./UI/Home/HomeMostPlayedGametypes";
import Gametypes from "../../api/gametypes";
import HomeTopMaps from "./UI/Home/HomeTopMaps";
import PopularCountries from "./UI/Home/PopularCountries";
import CountriesManager from "../../api/countriesmanager";
import HomeGeneralStats from "./UI/Home/HomeGeneralStats";
import BasicPlayers from "./UI/Home/BasicPlayers";
import MostUsedFaces from "../../components/MostUsedFaces";

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
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = session.settings;
    const pageSettings = await siteSettings.getCategorySettings("Home");
    const pageOrder = await siteSettings.getCategoryOrder("Home");
    
    const matchManager = new Matches();
    const playerManager = new Players();
    const gametypeManager = new Gametypes();
    const faceManager = new Faces();

    const elems = [];

    let mapImages = [];
    let matchesData = [];

    
	const totalPlayers = await playerManager.getTotalPlayers();

   // let uniqueMapNames = new Set();

    if(pageSettings["Display Recent Matches"] === "true"){

		matchesData = await matchManager.getRecent(0, pageSettings["Recent Matches To Display"], 0, playerManager);

       // for(let i = 0; i < matchesData.length; i++){
       //     uniqueMapNames.add(removeUnr(matchesData[i].mapName));
       // }

        elems[pageOrder["Display Recent Matches"]] = <div className="default" key="recent-matches">
            <div className="default-header">Recent Matches</div>
            <MatchesTableView  data={matchesData}/>
            
        </div>
	}


    if(pageSettings["Display Latest Match"] === "true"){

        const latestMatch = await matchManager.getRecent(0, 1, 0, playerManager);

        if(latestMatch.length > 0){

            const latestMatchPlayers = await playerManager.getAllInMatch(latestMatch[0].id);

            const playerFaces = [];

            for(let i = 0; i < latestMatchPlayers.length; i++){

                if(playerFaces.indexOf(latestMatchPlayers[i].face) === -1){
                    playerFaces.push(latestMatchPlayers[i].face);
                }
            }

            

            const latestFaces = await faceManager.getFacesWithFileStatuses(playerFaces);

            const latestMapName = latestMatch[0].mapName;
            const mapImage = getMapImages([latestMapName]);

            let latestMatchImage = "default";

            const mapImageName = cleanMapName(latestMapName).toLowerCase();

            if(mapImage[mapImageName] !== undefined){
                latestMatchImage = mapImage[mapImageName];
            }

            elems[pageOrder["Display Latest Match"]] = <div className="default" key="sshot">
                <Screenshot 
                key={"match-sshot"} map={latestMatch[0].mapName} totalTeams={latestMatch[0].total_teams} players={latestMatchPlayers} 
                image={`/images/maps/${latestMatchImage}.jpg`} 
                matchData={JSON.stringify(latestMatch[0])}
                serverName={latestMatch[0].serverName} gametypeName={latestMatch[0].gametypeName} faces={latestFaces} bHome={true}
            /></div>;
        }
    }

    if(pageSettings["Display Most Played Gametypes"] === "true"){
        
        const gametypeStats = await gametypeManager.getMostPlayed(5);

         const imageGametypeNames = [];

		for(let i = 0; i < gametypeStats.length; i++){
			imageGametypeNames.push(gametypeStats[i].name.replace(/ /ig,"").replace(/tournament/ig, "").toLowerCase());
		}

        const gametypeImages = gametypeManager.getMatchingImages(imageGametypeNames, false);

        elems[pageOrder["Display Most Played Gametypes"]] = <div key="gametypes" className="default">
            <HomeMostPlayedGametypes data={gametypeStats} images={gametypeImages}/>
        </div>
    }


    if(pageSettings["Display Most Played Maps"] === "true"){

        const mostPlayedMaps = await getMostPlayedMaps(4);

        const mapNames = [];

        for(let i = 0; i < mostPlayedMaps.length; i++){

            const m = mostPlayedMaps[i];
            mapNames.push(m.name);  
        }

        const mapImages = await getMapImages(mapNames);

        elems[pageOrder["Display Most Played Maps"]] = <div className="default" key="top-maps">
            <HomeTopMaps maps={mostPlayedMaps} images={mapImages}/>
        </div>;
    }

    if(pageSettings["Display Most Popular Countries"]){

        const cm = new CountriesManager();
        
        const countryData = await cm.getMostPopular(parseInt(pageSettings["Popular Countries Display Limit"]));

        elems[pageOrder["Display Most Popular Countries"]] = <PopularCountries key="pc" 
            totalPlayers={totalPlayers}
            settings={{
                "Popular Countries Display Type": pageSettings["Popular Countries Display Type"]
            }}
            data={countryData}
        />
    }

    if(pageSettings["Display Recent Matches & Player Stats"] === "true"){
		//elems[pageOrder["Display Recent Matches & Player Stats"]] = <CalendarThing key="player-match-heatmap"/>
		elems[pageOrder["Display Recent Matches & Player Stats"]] = <HomeGeneralStats key="general-stats" />;	
	}


    if(pageSettings["Display Recent Players"] === "true"){

        const recentPlayersData = await playerManager.getRecentPlayers(5);

        const faceIds = new Set([...recentPlayersData.map((d) =>{ return d.face; })]);
        
        const faceFiles = await faceManager.getFacesWithFileStatuses([...faceIds]);

        elems[pageOrder["Display Recent Players"]] = <div className="default"key={"recent-players"} ><BasicPlayers 
            title="Recent Players" 
            players={recentPlayersData} 
            faceFiles={faceFiles}
        /></div>;
    }


    if(pageSettings["Display Addicted Players"] === "true"){

        const addictedPlayersData = await playerManager.getAddictedPlayers(5);

        const faceIds = new Set([...addictedPlayersData.map((d) =>{ return d.face; })]);
        
        const faceFiles = await faceManager.getFacesWithFileStatuses([...faceIds]);

        elems[pageOrder["Display Addicted Players"]] = <div className="default" key={"addicted-players"}><BasicPlayers 
            title="Addicted Players" 
            players={addictedPlayersData} 
            faceFiles={faceFiles}
        /></div>;
    }

    if(pageSettings["Display Most Used Faces"] === "true"){

        const mostUsedFaces = await faceManager.getMostUsed(5);
        const faceIds = new Set([...mostUsedFaces.map((d) =>{ return d.id; })]);
        const faceFiles = await faceManager.getFacesWithFileStatuses([...faceIds]);

        elems[pageOrder["Display Most Used Faces"]] = <MostUsedFaces key={"faces"} data={mostUsedFaces} images={faceFiles} />;
    }


    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            {elems}      
        </div>   
    </main>; 
}