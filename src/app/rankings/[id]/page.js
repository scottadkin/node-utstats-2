import { headers, cookies } from "next/headers";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import Nav from "../../UI/Nav";
import RankingFilter from "../../UI/Rankings/RankingFilter";
import {getDetailedSettings} from "../../../../api/rankings";

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Player Rankings - Node UTStats 2",
        "description": "View player rankings for various gametypes and time frames.",
        "keywords": ["ranking", "players", "utstats", "node"],
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

    const rankingSettings = await getDetailedSettings();

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Rankings</div>
            </div>
            <RankingFilter settings={rankingSettings}/>
        </div>   
    </main>; 
}