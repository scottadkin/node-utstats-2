import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import { getNavSettings, getPageOrder, getSettings } from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { getPlayerById } from "../../../../api/player";
import PlayerGeneral from "../../UI/Player";
import { getCountryName } from "../../../../api/countries";

function setQueryVars(params, searchParams){

    let playerId = (params.id !== undefined) ? parseInt(params.id) : 0;
    if(playerId !== playerId) playerId = 0;


    return {playerId}
}

export default async function Page({params, searchParams}){

    const header = await headers();

    params = await params;
    searchParams = await searchParams;

    console.log(params);
    const {playerId} = setQueryVars(params, searchParams);

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

    const cookieStore = await cookies();
    const cookiesData = cookieStore.getAll();
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings();
    const pageSettings = await getSettings("Player Pages");
    const pageOrder = await getPageOrder("Player Pages");
    const sessionSettings = session.settings;


    const basic = await getPlayerById(playerId);
    console.log(basic);
    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Player Profile</div>
                <PlayerGeneral data={basic} country={getCountryName(basic.country)} face=""/>
            </div>    
        </div>   
    </main>
}