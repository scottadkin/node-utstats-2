import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import {calculateMapTotals} from "../../../../api/maps";

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Map - Node UTStats 2",
        "description": "",
        "keywords": ["map", "utstats", "node"],
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


    await calculateMapTotals(1,2);

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Map name</div>
            </div>    
        </div>   
    </main>; 
}