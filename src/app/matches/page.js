import Session from "../../../api/session";
import SiteSettings from "../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import Nav from "../UI/Nav";
import SearchForm from "../UI/Matches/SearchForm";
import { getAllObjectNames } from "../../../api/genericServerSide.mjs";

export default async function Page({ searchParams}){


    const query = await searchParams;
    console.log(query);

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

    const serverNames = await getAllObjectNames("servers");
    const gametypeNames = await getAllObjectNames("gametypes");
    const mapNames = await getAllObjectNames("maps");

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
     
            <div className="default">
                <div className="default-header">Matches</div>
                <SearchForm serverNames={serverNames} gametypeNames={gametypeNames} mapNames={mapNames}/>
            </div>
        </div>   
    </main>; 
}