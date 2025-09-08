import Session from "../../../api/session";
import SiteSettings from "../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import Nav from "../UI/Nav";
import SearchForm from "../UI/Matches/SearchForm";
import { getAllObjectNames } from "../../../api/genericServerSide.mjs";

export default async function Page({ searchParams}){


    const query = await searchParams;
    console.log(query);

    let selectedServer = (query.server !== undefined) ? parseInt(query.server) : 0;
    let selectedGametype = (query.gametype !== undefined) ? parseInt(query.gametype) : 0;
    let selectedMap = (query.map !== undefined) ? parseInt(query.map) : 0;
    let displayMode = query.displayMode ?? "default";
    

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = session.settings;

    const pageSettings = await siteSettings.getCategorySettings("Matches Page");

    const defaultPerPage = pageSettings["Default Display Per Page"];
    let perPage = (query.pp !== undefined) ? parseInt(query.pp) : defaultPerPage;

    const serverNames = await getAllObjectNames("servers");
    const gametypeNames = await getAllObjectNames("gametypes");
    const mapNames = await getAllObjectNames("maps");

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
            </div>
        </div>   
    </main>; 
}