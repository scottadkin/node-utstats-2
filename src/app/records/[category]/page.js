import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { validPlayerTotalTypes, totalPerPageOptions, validPlayerMatchTypes, validPlayerCTFTotalTypes, 
    getPlayerTotalRecords, bValidPlayerType, bValidTotalType, bValidPlayerCTFTotalType,
    getTypeName, getPlayerMatchRecords, getPlayerCTFTotalRecords, validPlayerCTFMatchTypes, 
    bValidPlayerCTFMatchType, getPlayerCTFMatchRecords } from "../../../../api/records";
import SearchForm from "../../UI/Records/SearchForm";
import { getAllObjectNames } from "../../../../api/genericServerSide.mjs";
import { PlayerTotalsTable, PlayerMatchTable } from "../../UI/Records/PlayerTables";

const DEFAULT_PLAYER_TOTALS_TYPE = "kills";
const DEFAULT_PLAYER_MATCH_TYPE = "kills";
const DEFAULT_PLAYER_CTF_TOTALS_TYPE = "flag_capture";
const DEFAULT_PLAYER_CTF_MATCH_TYPE = "flag_capture";

const TITLES = {
    "player-totals": "Player Totals",
    "player-match": "Player Match",
    "player-ctf-totals": "Player CTF Totals",
    "player-ctf-match": "Player CTF Match",
    "player-ctf-single-life": "Player CTF Single Life",
    "ctf-caps": "CTF Cap Records",
};

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Records - Node UTStats 2",
        "description": "records",
        "keywords": ["servers", "utstats", "node"],
    }
}

export default async function Page({params, searchParams}){

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    params = await params;
    searchParams = await searchParams;

    console.log(params);

    const cat = (params.category !== undefined) ? params.category.toLowerCase() : "player-totals";
    let selectedType = (searchParams.type !== undefined) ? searchParams.type.toLowerCase() : "kills";
    let selectedGametype = searchParams?.g ?? "0";
    let selectedMap = searchParams?.m ?? "0";
    let selectedPerPage = searchParams?.pp ?? "25";
    let page = searchParams.page ?? 1;

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