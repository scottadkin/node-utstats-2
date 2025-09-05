import SiteSettings from "../../api/sitesettings";
import { cookies, headers } from "next/headers";
import Session from "../../api/session";
import Matches from "../../api/matches";
import Players from "../../api/players";
import MatchesTableView from "../../components/MatchesTableView";
import Nav from "../../components/Nav";
import Screenshot from "../../components/Screenshot";
import { cleanMapName, removeUnr } from "../../api/generic.mjs";
import Faces from "../../api/faces";
import Maps from "../../api/maps";

export default async function Page(){

    const cookieStore = await cookies();
    const header = await headers();
    const cookiesData = cookieStore.getAll();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    
    const session = new Session(ip, JSON.stringify(cookiesData));

    await session.load();
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = JSON.stringify(session.settings);
    const pageSettings = await siteSettings.getCategorySettings("Home");
    const pageOrder = await siteSettings.getCategoryOrder("Home");
    


    const matchManager = new Matches();
    const playerManager = new Players();
    const mapManager = new Maps();

    const elems = [];

    let mapImages = [];
    let matchesData = [];

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

            const faceManager = new Faces();

            const latestFaces = await faceManager.getFacesWithFileStatuses(playerFaces);

            const latestMapName = latestMatch[0].mapName;
            const mapImage = await mapManager.getImages([latestMapName]);

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

    

    

    



    //console.log(await getObjectName("maps", [1,2,3,4]));

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
     
            {elems}
            
        </div>   
    </main>; 
}