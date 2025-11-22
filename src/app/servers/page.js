import Nav from "../UI/Nav";
import Session from "../../../api/session";
import {getNavSettings, getSettings} from "../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { getAll } from "../../../api/servers";
import {getImages as getMapImages} from "../../../api/maps";
import ServerList from "../UI/Servers/ServerList";
import { getObjectName } from "../../../api/genericServerSide.mjs";

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
    const navSettings = await getNavSettings();
    const sessionSettings = session.settings;

    
    const serverList = await getAll();

    const mapIds = [...new Set([...serverList.map((s) =>{
        return s.last_map_id;
    })])];

    const mapNames = await getObjectName("maps", [...mapIds]);
    const mapNamesArray = Object.values(mapNames);

    const mapImages = getMapImages(mapNamesArray);

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