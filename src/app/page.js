import SiteSettings from "../../api/sitesettings";
import { cookies, headers } from "next/headers";
import Session from "../../api/session";
import Matches from "../../api/matches";
import Players from "../../api/players";
import MatchesTableView from "../../components/MatchesTableView";

export default async function Page(){

    const cookieStore = await cookies();
	const header = await headers();
	const cookiesData = cookieStore.getAll();

	const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]

    const siteSettings = new SiteSettings();

	const pageSettings = await siteSettings.getCategorySettings("Home");
	const pageOrder = await siteSettings.getCategoryOrder("Home");

    console.log(pageSettings);

    const session = new Session(ip, JSON.stringify(cookiesData));

	await session.load();

    const matchManager = new Matches();
    const playerManager = new Players();

    let matchesData = [];

    if(pageSettings["Display Recent Matches"] === "true"){

		matchesData = await matchManager.getRecent(0, pageSettings["Recent Matches To Display"], 0, playerManager);
	}

    console.log(matchesData);

    return <div>

        home page
        <MatchesTableView data={matchesData}/>
    </div>;
}