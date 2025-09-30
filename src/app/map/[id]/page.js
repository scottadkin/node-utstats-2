import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import SiteSettings from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { getBasic } from "../../../../api/maps";
import { removeUnr } from "../../../../api/generic.mjs";
import MapSummary from "../../UI/Maps/MapSummary";

function setQueryValues(params, searchParams){

    let id = params.id ?? 0;
    id = parseInt(id);
    if(id !== id) id = 0;

    return {id};
}

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Map - Node UTStats 2",
        "description": "",
        "keywords": ["map", "utstats", "node"],
    }
}

export default async function Page({params, searchParams}){

    params = await params;
    searchParams = await searchParams;

    const {id} = setQueryValues(params, searchParams);

    const header = await headers();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = session.settings;

    const basic = await getBasic(id);

    

    if(basic === null){

        return <main>
            <Nav settings={navSettings} session={sessionSettings}/>		
            <div id="content">
                <div className="default">
                    <div className="default-header">Map Doesn't exist</div>
                </div>    
            </div>   
        </main>; 
    }

    basic.name = removeUnr(basic.name);

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{basic.name}</div>
                <MapSummary data={basic} spawns={[]}/>
            </div>    
        </div>   
    </main>; 
}