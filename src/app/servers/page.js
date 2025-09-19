import Nav from "../UI/Nav";
import Session from "../../../api/session";
import SiteSettings from "../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import Servers from "../../../api/servers";
import Maps from "../../../api/maps";
import ServerList from "../UI/Servers/ServerList";

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Servers - Node UTStats 2",
        "description": "View information about our servers",
        "keywords": ["servers", "utstats", "node"],
    }
}

export default async function Page(){

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = session.settings;

    const serverManager = new Servers();
    
    const serverList = await serverManager.getAll();

    const mapIds = [...new Set([...serverList.map((s) =>{
        return s.last_map_id;
    })])];

    const mapManager = new Maps();
    const mapNames = await mapManager.getNames([...mapIds]);
    const mapNamesArray = Object.values(mapNames);

    const mapImages = await mapManager.getImages(mapNamesArray);

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Servers</div>
                <ServerList mapImages={mapImages} mapNames={mapNames} servers={serverList}/>
            </div>
            
        </div>   
    </main>; 
}