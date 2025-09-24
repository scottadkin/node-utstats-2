import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { validPlayerTotalTypes, totalPerPageOptions, validPlayerMatchTypes } from "../../../../api/records";
import SearchForm from "../../UI/Records/SearchForm";
import { getAllObjectNames } from "../../../../api/genericServerSide.mjs";

const TITLES = {
    "player-totals": "Player Totals",
    "player-match": "Player Match"
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

    if(cat === "player-totals"){
        types = validPlayerTotalTypes;
    }else if(cat === "player-match"){
        types = validPlayerMatchTypes;
    }

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{TITLES?.[cat] ?? "Unknown"} Records</div>
            </div>   
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
    </main>; 
}