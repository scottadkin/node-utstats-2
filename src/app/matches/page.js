import Session from "../../../api/session";
import {getSettings, getNavSettings} from "../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import Nav from "../UI/Nav";
import SearchForm from "../UI/Matches/SearchForm";
import { getAllObjectNames, getSingleObjectName } from "../../../api/genericServerSide.mjs";
import MatchesDefaultView from "../UI/MatchesDefaultView";
import MatchesTableView from "../UI/MatchesTableView";
import Matches from "../../../api/matches";
import Players from "../../../api/players";
import {getImages as getMapImages} from "../../../api/maps";
import Pagination from "../UI/Pagination";
import { removeUnr } from "../../../api/generic.mjs";


function setQueryStuff(query){

    let selectedServer = (query.server !== undefined) ? parseInt(query.server) : 0;
    let selectedGametype = (query.gametype !== undefined) ? parseInt(query.gametype) : 0;
    let selectedMap = (query.map !== undefined) ? parseInt(query.map) : 0;
    let displayMode = query.displayMode ?? "default";
    let page = (query.page !== undefined) ? parseInt(query.page) : 1;

    displayMode = displayMode.toLowerCase();

    return {selectedServer, selectedGametype, selectedMap, displayMode, page};

}

export async function generateMetadata({ params, searchParams }, parent) {

    const query = await searchParams;

    const {selectedServer, selectedGametype, selectedMap, displayMode, page} = setQueryStuff(query);

    const serverName = (selectedServer !== 0) ? await getSingleObjectName("servers", selectedServer) : "";
    const gametypeName = (selectedGametype !== 0) ? await getSingleObjectName("gametypes", selectedGametype) : "";
    const mapName = (selectedMap !== 0) ? removeUnr(await getSingleObjectName("maps", selectedMap)) : "";

    let title = "";
    let description = "";
    const keywords = ["search", "utstats", "node", "matches"];

    if(serverName !== "" || gametypeName !== "" || mapName !== ""){

        if(serverName !== ""){
            description = `on the server ${serverName}`;
            title = serverName;
            keywords.push(serverName);
        }

        if(gametypeName !== ""){

            if(description !== "") description += `, `;
            if(title !== "") title += ` - `;
            title += gametypeName;

            description += `with the gametype ${gametypeName}`;
            keywords.push(gametypeName);
        }

        if(mapName !== ""){
            if(description !== "") description += `, `;
            if(title !== "") title += ` - `;
            title += mapName;
            description += `on the map ${mapName}`;
            keywords.push(mapName);
        }

        description = `Match search for games played ${description}`;

        title = `${title} Match Search`;
    }

    if(title === ""){
        title = "Recent Matches";
    }

    return {
        "title": `${title} - Node UTStats 2`,
        "description": "Search for matches played on our Unreal Tournament Servers.",
        "keywords": keywords,
    }
}

export default async function Page({ searchParams}){


    const query = await searchParams;

    const {selectedServer, selectedGametype, selectedMap, displayMode, page} = setQueryStuff(query);

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings("Navigation");
    const sessionSettings = session.settings;

    const pageSettings = await getSettings("Matches Page");

    const defaultPerPage = pageSettings["Default Display Per Page"];
    let perPage = (query.pp !== undefined) ? parseInt(query.pp) : defaultPerPage;

    const serverNames = await getAllObjectNames("servers");
    const gametypeNames = await getAllObjectNames("gametypes");
    const mapNames = await getAllObjectNames("maps");

    const matchManager = new Matches();
    const data = await matchManager.searchMatches(selectedServer, selectedGametype, selectedMap, page - 1, perPage);

    const dmWinners = new Set();

    for(let i = 0; i < data.length; i++){

        if(data[i].dm_winner !== 0){
            dmWinners.add(data[i].dm_winner);
        }
    }

    const playerManager = new Players();
    const dmWinnerPlayers = await playerManager.getNamesByIds([...dmWinners], true);

    let mapImages = {};

    if(displayMode === "default"){
        mapImages = getMapImages(Object.values(mapNames));
    }


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        d.mapName = mapNames[d.map] ?? "Not Found";
        d.gametypeName = gametypeNames[d.gametype] ?? "Not Found"; 
        d.serverName = serverNames[d.server] ?? "Not Found";

        if(d.dm_winner !== 0){
            
            if(dmWinnerPlayers[d.dm_winner] !== undefined){
                d.dmWinner = dmWinnerPlayers[d.dm_winner];
            }else{
                d.dmWinner = {"name": "Not Found", "country": "xx"};
            }
        }
    }

    const totalMatches = await matchManager.getSearchTotalResults(selectedServer, selectedGametype, selectedMap);

    const pURL = `/matches?server=${selectedServer}&gametype=${selectedGametype}&map=${selectedMap}&pp=${perPage}&displayMode=${displayMode}&page=`;

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
     
            <div className="default">
                <div className="default-header">Matches</div>
                <SearchForm 
                    selectedServer={selectedServer}
                    selectedGametype={selectedGametype}
                    selectedMap={selectedMap}
                    displayMode={displayMode}
                    serverNames={serverNames} 
                    gametypeNames={gametypeNames} 
                    perPage={perPage}
                    mapNames={mapNames}
                />
                <Pagination currentPage={page} results={totalMatches} perPage={perPage} url={pURL} />
                {(displayMode === "table") ? <MatchesTableView data={data}/> : null }
                {(displayMode === "default") ? <MatchesDefaultView data={data} images={mapImages}/> : null }
                <Pagination currentPage={page} results={totalMatches} perPage={perPage} url={pURL} />
            </div>
            
        </div>   
    </main>; 
}