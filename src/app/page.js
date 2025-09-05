import SiteSettings from "../../api/sitesettings";
import { cookies, headers } from "next/headers";
import Session from "../../api/session";
import Matches from "../../api/matches";
import Players from "../../api/players";
import MatchesTableView from "../../components/MatchesTableView";
import Nav from "../../components/Nav";

export default async function Page(){

    const cookieStore = await cookies();
    const header = await headers();
    const cookiesData = cookieStore.getAll();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    
    const session = new Session(ip, JSON.stringify(cookiesData));

    await session.load();
    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");
    const sessionSettings = JSON.stringify(session.settings);
    const pageSettings = await siteSettings.getCategorySettings("Home");

    console.log(pageSettings);

    const matchManager = new Matches();
    const playerManager = new Players();

    let matchesData = [];

    if(pageSettings["Display Recent Matches"] === "true"){

		matchesData = await matchManager.getRecent(0, pageSettings["Recent Matches To Display"], 0, playerManager);
	}

    console.log(matchesData);

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">	
            {"message"}	
            </div>
            home page
            <MatchesTableView data={matchesData}/>
        </div>   
    </main>; 
}