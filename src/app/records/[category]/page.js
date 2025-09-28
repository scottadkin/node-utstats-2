import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { validPlayerTotalTypes, totalPerPageOptions, validPlayerMatchTypes, validPlayerCTFTotalTypes, 
    getPlayerTotalRecords, bValidPlayerType, bValidTotalType, bValidPlayerCTFTotalType,
    getTypeName, getPlayerMatchRecords, getPlayerCTFTotalRecords, validPlayerCTFMatchTypes, 
    bValidPlayerCTFMatchType, getPlayerCTFMatchRecords, validPlayerCTFSingleLifeTypes, 
    bValidPlayerCTFSingleLifeType, getPlayerCTFSingleLifeRecords } from "../../../../api/records";
import SearchForm from "../../UI/Records/SearchForm";
import { getAllObjectNames, getObjectName } from "../../../../api/genericServerSide.mjs";
import { PlayerTotalsTable, PlayerMatchTable } from "../../UI/Records/PlayerTables";
import { getAllMapCapRecords, getMapCapEntries, getMapCapTotalEntries } from "../../../../api/ctf";
import CapRecords from "../../UI/Records/CapRecords";
import MapCaps from "../../UI/Records/MapCaps";
import { removeUnr } from "../../../../api/generic.mjs";

const DEFAULT_PLAYER_TOTALS_TYPE = "kills";
const DEFAULT_PLAYER_MATCH_TYPE = "kills";
const DEFAULT_PLAYER_CTF_TOTALS_TYPE = "flag_capture";
const DEFAULT_PLAYER_CTF_MATCH_TYPE = "flag_capture";
const DEFAULT_PLAYER_CTF_SINGLE_LIFE_TYPE = "flag_capture_best";

const TITLES = {
    "player-totals": "Player Totals",
    "player-match": "Player Match",
    "player-ctf-totals": "Player CTF Totals",
    "player-ctf-match": "Player CTF Match",
    "player-ctf-single-life": "Player CTF Single Life",
    "ctf-caps": "CTF Cap",
};


function getSelectedType(cat, selectedType){

    if(cat === "player-totals" && !bValidTotalType(selectedType)){
        selectedType = DEFAULT_PLAYER_TOTALS_TYPE;
    }

    if(cat === "player-match" && !bValidPlayerType(selectedType)){
        selectedType = DEFAULT_PLAYER_MATCH_TYPE;
    }

    if(cat === "player-ctf-totals" && !bValidPlayerCTFTotalType(selectedType)){
        selectedType = DEFAULT_PLAYER_CTF_TOTALS_TYPE;
    }

    if(cat === "player-ctf-match" && !bValidPlayerCTFMatchType(selectedType)){
        selectedType = DEFAULT_PLAYER_CTF_MATCH_TYPE;
    }

    if(cat === "player-ctf-single-life" && !bValidPlayerCTFSingleLifeType(selectedType)){
        selectedType = DEFAULT_PLAYER_CTF_SINGLE_LIFE_TYPE;
    }

    return selectedType;
}

export async function generateMetadata({ params, searchParams }, parent) {

    params = await params;
    searchParams = await searchParams;

    const cat = (params.category !== undefined) ? params.category.toLowerCase() : "";
    let selectedType = (searchParams.type !== undefined) ? searchParams.type.toLowerCase() : "kills";

    selectedType = getSelectedType(cat, selectedType);

    let selectedGametype = searchParams?.g ?? "0";
    let selectedMap = searchParams?.m ?? "0";


    let title = "Unknown";
    let desc = "";

    if(TITLES[cat] !== undefined){
        title = `${TITLES[cat]} Records`;
    }

    let typeTitle = "";

    let name = "all";

    if(selectedGametype !== "0"){

        const result = await getObjectName("gametypes", selectedGametype);
        name = result[selectedGametype] ?? "Not Found";

    }else if(selectedMap !== "0"){

        const result = await getObjectName("maps", selectedMap);
        name = (result[selectedMap] !== undefined) ? removeUnr(result[selectedMap]) :  "Not Found";
    }
    

    if(cat !== "ctf-caps"){

        const name = getTypeName(cat, selectedType);

        typeTitle = `${name} - `;
        desc = `View ${name} ${name.toLowerCase()} records, `;

        if(cat === "player-totals"){
            desc += `these records are based on a player's profile all time records.`;
        }else if(cat === "player-match"){
            desc += `these records are based on a player's best performance in a single match.`;
        }else if(cat === "player-ctf-totals"){
            desc += `these Capture The Flag records are based on a player's profile all time records.`;
        }else if(cat === "player-ctf-match"){
            desc += `these Capture The Flag records are based on a player's best performance in a single match.`;
        }else if(cat === "player-ctf-single-life"){
            desc += `these Capture The Flag records are based on a player's best performance in a single life.`;
        }
        
    }else{
        //typeTitle = "CTF Cap";
        desc = `View ${name} fastest Capture The Flag cap times.`;
    }


    console.log(params);

    console.log(desc);


    

    switch(cat){

        case "player-totals": {
           
        } break;
    }
    
    return {
        "title": `${typeTitle}${title} - Node UTStats 2`,
        "description": desc,
        "keywords": ["servers", "utstats", "node"],
    }
}

export default async function Page({params, searchParams}){

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    params = await params;
    searchParams = await searchParams;

    const cat = (params.category !== undefined) ? params.category.toLowerCase() : "player-totals";
    let selectedType = (searchParams.type !== undefined) ? searchParams.type.toLowerCase() : "kills";
    let selectedGametype = searchParams?.g ?? "0";
    let selectedMap = searchParams?.m ?? "0";
    let selectedPerPage = searchParams?.pp ?? "25";
    let page = searchParams.page ?? 1;

    selectedType = getSelectedType(cat, selectedType);

    page = parseInt(page);

    if(page !== page) page = 1;
    if(page < 1) page = 1;

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = session.settings;


    const gametypeNames = await getAllObjectNames("gametypes", true);
    const mapNames = await getAllObjectNames("maps", true);

    let types = [];
    let data = {"data": [], "totalResults": 0};
    let typeTitle = "Unknown";
    let elems = [];

    if(cat === "player-totals"){

        types = validPlayerTotalTypes;
        data = await getPlayerTotalRecords(selectedType, selectedGametype, selectedMap, page, selectedPerPage);
        typeTitle = getTypeName(cat, selectedType);

        elems = <PlayerTotalsTable 
            type={selectedType} 
            typeTitle={typeTitle}
            data={data} 
            page={page} 
            perPage={selectedPerPage} 
            totalResults={data.totalResults}
            selectedGametype={selectedGametype}
            selectedMap={selectedMap}
        />;  


    }else if(cat === "player-match"){

        types = validPlayerMatchTypes;
        typeTitle = getTypeName(cat, selectedType);
        data = await getPlayerMatchRecords(selectedGametype, selectedMap, selectedType, page, selectedPerPage);

        elems = <PlayerMatchTable 
            type={selectedType} 
            typeTitle={typeTitle}
            data={data} 
            page={page} 
            perPage={selectedPerPage} 
            totalResults={data.totalResults}
            selectedGametype={selectedGametype}
            selectedMap={selectedMap}
        />;  

    }else if(cat === "player-ctf-totals"){

        types = validPlayerCTFTotalTypes;
        typeTitle = getTypeName(cat, selectedType);
        data = await getPlayerCTFTotalRecords(selectedGametype, selectedMap, selectedType, page, selectedPerPage);

        elems = <PlayerTotalsTable 
            bCTF={true}
            type={selectedType} 
            typeTitle={typeTitle}
            data={data} 
            page={page} 
            perPage={selectedPerPage} 
            totalResults={data.totalResults}
            selectedGametype={selectedGametype}
            selectedMap={selectedMap}
        />;  

    }else if(cat === "player-ctf-match"){

        types = validPlayerCTFMatchTypes;
        typeTitle = getTypeName(cat, selectedType);
        data = await getPlayerCTFMatchRecords(selectedGametype, selectedMap, selectedType, page, selectedPerPage);

        elems = <PlayerMatchTable 
            type={selectedType} 
            typeTitle={typeTitle}
            data={data} 
            page={page} 
            perPage={selectedPerPage} 
            totalResults={data.totalResults}
            selectedGametype={selectedGametype}
            selectedMap={selectedMap}
            bCTF={true}
        />; 

    }else if(cat === "player-ctf-single-life"){

        types = validPlayerCTFSingleLifeTypes;
        typeTitle = getTypeName(cat, selectedType);
        data = await getPlayerCTFSingleLifeRecords(selectedGametype, selectedMap, selectedType, page, selectedPerPage);

        elems = <PlayerMatchTable 
            type={selectedType} 
            typeTitle={typeTitle}
            data={data} 
            page={page} 
            perPage={selectedPerPage} 
            totalResults={data.totalResults}
            selectedGametype={selectedGametype}
            selectedMap={selectedMap}
            bCTF={true}
            bSingleLifeCTF={true}
        />; 

    }else if(cat === "ctf-caps"){


        if(selectedMap === "0"){

            const assistCaps = await getAllMapCapRecords("assist", selectedGametype);
            const soloCaps = await getAllMapCapRecords("solo", selectedGametype);

            elems = <CapRecords soloCaps={soloCaps} assistCaps={assistCaps}/>;

        }else{

            const soloCaps = await getMapCapEntries("solo", selectedMap, selectedGametype, page, selectedPerPage);
            const assistCaps = await getMapCapEntries("assist", selectedMap, selectedGametype, page, selectedPerPage);

            const totalSoloResults = await getMapCapTotalEntries("solo", selectedMap, selectedGametype);
            const totalAssistResults = await getMapCapTotalEntries("assist", selectedMap, selectedGametype);

            elems = <MapCaps 
                selectedGametype={selectedGametype} 
                selectedMap={selectedMap}
                soloCaps={soloCaps} 
                assistCaps={assistCaps}
                page={page}
                perPage={selectedPerPage}
                totalSoloResults={totalSoloResults}
                totalAssistResults={totalAssistResults}
            />
        }

        //console.log(assistCaps);

        
    }


    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{TITLES?.[cat] ?? "Unknown"} Records</div>
                <SearchForm 
                    perPageTypes={totalPerPageOptions} 
                    types={types}
                    cat={cat}
                    gametypeNames={gametypeNames}
                    mapNames={mapNames}
                    selectedType={selectedType}
                    selectedGametype={selectedGametype}
                    selectedMap={selectedMap}
                    selectedPerPage={selectedPerPage}
                /> 
            </div>   
         
            {elems} 
            
        </div>      
    </main>; 
}