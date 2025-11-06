import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import { getNavSettings, getPageOrder, getSettings, PageComponentManager } from "../../../../api/sitesettings";
import { headers, cookies } from "next/headers";
import { getPlayerById } from "../../../../api/player";
import PlayerGeneral from "../../UI/Player/PlayerGeneral";
import { getCountryName } from "../../../../api/countries";
import { getFacesWithFileStatuses } from "../../../../api/faces";
import ErrorPage from "../../UI/ErrorPage";
import { getProfileGametypeStats, getProfileFragStats, getPossibleAliasesByHWID, getTotalMatches, getProfileMapStats } from "../../../../api/player";
import PlayerGametypeStats from "../../UI/Player/PlayerGametypeStats";
import PlayerFragSummary from "../../UI/Player/PlayerFragSummary";
import { getAllRankings, getSpecialEvents } from "../../../../api/player";
import PlayerRankings from "../../UI/Player/PlayerRankings";
import PlayerSpecialEvents from "../../UI/Player/PlayerSpecialEvents";
import { getPlayerProfileData, getPlayerSoloCapRecords } from "../../../../api/ctf";
import PlayerCTFSummary from "../../UI/Player/PlayerCTFSummary";
import PlayerCTFCapRecords from "../../UI/Player/PlayerCTFCapRecords";
import PlayerADSummary from "../../UI/Player/PlayerADSummary";
import { getPlayerProfileData as getPlayerWeaponData } from "../../../../api/weapons";
import PlayerWeapons from "../../UI/Player/PlayerWeapons";
import PlayerItemsSummary from "../../UI/Player/PlayerItemsSummary";
import { getPlayerProfileData as getPlayerItemData } from "../../../../api/items";
import PlayerAliases from "../../UI/Player/PlayerAliases";
import PlayerPingHistory from "../../UI/Player/PlayerPingHistory";
import { getPlayerHistoryGraphData } from "../../../../api/pings";
import PlayerRecentMatches from "../../UI/Player/PlayerRecentMatches";
import { getPlayerTotals as getTelefragTotals } from "../../../../api/telefrags";
import PlayerTeleFrags from "../../UI/Player/PlayerTeleFrags";
import PlayerMapStats from "../../UI/Player/PlayerMapStats";
import { getAllPlayerCurrent as getAllCurrentWinrates } from "../../../../api/winrate";
import PlayerWinRates from "../../UI/Player/PlayerWinRates";
import { getPlayerTotals as getCombogibTotals } from "../../../../api/combogib";
import PlayerCombogibStats from "../../UI/Player/PlayerCombogibStats";
import PlayerMonsterHuntStats from "../../UI/Player/PlayerMonsterHuntStats";
import { getPlayerProfileMonsters } from "../../../../api/monsterhunt";
import PlayerMonsters from "../../UI/Player/PlayerMonsters";
import { convertTimestamp } from "../../../../api/generic.mjs";
import PlayerPowerupSummary from "../../UI/Player/PlayerPowerupSummary";
import { getPlayerProfileData as getPowerupData } from "../../../../api/powerups";


function setQueryVars(params, searchParams){

    let playerId = (params.id !== undefined) ? parseInt(params.id) : 0;
    if(playerId !== playerId) playerId = 0;


    return {playerId}
}

function getOGImage(faceFiles, faceId){

	if(faceFiles[faceId] !== undefined){
		return `${faceFiles[faceId].name}`;
	}

	return "faceless";

}

export async function generateMetadata({ params, searchParams }, parent) {

    params = await params;
    searchParams = await searchParams;

    const {playerId} = setQueryVars(params, searchParams);
    const basic = await getPlayerById(playerId);

    if(basic === null){
        return {
            "title": "Player Not Found - Node UTStats 2",
            "description": "Could not find the player you were looking for,",
            "keywords": ["player", "profile", "utstats", "node"],
        }
    }

    const faces = await getFacesWithFileStatuses([basic.face]);

    const ogImage = getOGImage(faces, basic.face);

    let description = `View ${basic.name} career profile, ${basic.name} is from ${getCountryName(basic.country)}, last seen ${convertTimestamp(basic.last)},`;
    description += ` played ${basic.matches} matches with a winrate of ${basic.winrate.toFixed(2)}% and has played for a total of ${(basic.playtime / (60 * 60)).toFixed(2)}` ;
    description += ` hours since ${convertTimestamp(basic.first)}.` ;

    return {
        "title": `${basic.name} - Player Profile - Node UTStats 2`,
        "description": description,
        "keywords": ["match","report", "utstats", "node", basic.name],
        "openGraph": {
            "images": [`/images/faces/${ogImage}.png`]
        }
    }
}

export default async function Page({params, searchParams}){

    const header = await headers();

    params = await params;
    searchParams = await searchParams;

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

    const elems = [];
    const pageManager = new PageComponentManager(pageSettings, pageOrder, elems);


    const basic = await getPlayerById(playerId);
    const totalMatches = await getTotalMatches(playerId);


    if(basic === null){
        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Failed to get player">
            There are no players with that id.
        </ErrorPage>
    }

    const faces = await getFacesWithFileStatuses([basic.face]);
 
    console.log(pageSettings);

    if(pageManager.bEnabled("Display Gametype Stats")){

        const gametypeStats = await getProfileGametypeStats(playerId);

        pageManager.addComponent("Display Gametype Stats", <PlayerGametypeStats key="gametype-stats" data={gametypeStats} />);
    }

    if(pageManager.bEnabled("Display Frag Summary")){

        const fragStats = await getProfileFragStats(playerId);
        pageManager.addComponent("Display Frag Summary", <PlayerFragSummary key="frags" data={fragStats} />);
    }

    if(pageManager.bEnabled("Display Rankings")){

        const rankingData = await getAllRankings(playerId);
        pageManager.addComponent("Display Rankings", <PlayerRankings key="rankings" data={rankingData}/>);
    }
    
    if(pageManager.bEnabled("Display Special Events")){

        const specalEvents = await getSpecialEvents(playerId);
        pageManager.addComponent("Display Special Events", <PlayerSpecialEvents key="special-events" data={specalEvents}/>);
    }

    if(pageManager.bEnabled("Display Capture The Flag Summary")){
        const ctfData = await getPlayerProfileData(playerId);
        pageManager.addComponent("Display Capture The Flag Summary", <PlayerCTFSummary key="ctf-sum"  ctfData={ctfData}/>);
    }


    if(pageManager.bEnabled("Display Capture The Flag Cap Records")){

        const caps = await getPlayerSoloCapRecords(playerId);
        pageManager.addComponent("Display Capture The Flag Cap Records", <PlayerCTFCapRecords key="ctf-cap-records" data={caps}/>);
    }

    pageManager.addComponent("Display Assault & Domination", <PlayerADSummary key="ad-sum" data={basic}/>);
  
    if(pageManager.bEnabled("Display Weapon Stats")){
        const {totals, best} = await getPlayerWeaponData(playerId);
        pageManager.addComponent("Display Weapon Stats", <PlayerWeapons key="weapons" totals={totals} best={best}/>);
    }
    

    if(pageManager.bEnabled("Display Items Summary")){

        const itemData = await getPlayerItemData(playerId);
        pageManager.addComponent("Display Items Summary", <PlayerItemsSummary key="items" data={itemData}/>);
    }

    if(pageManager.bEnabled("Display Aliases")){
        const aliases = await getPossibleAliasesByHWID(playerId);
        pageManager.addComponent("Display Items Summary", <PlayerAliases key="aliases" data={aliases}/>);
    }

    if(pageManager.bEnabled("Display Ping History Graph")){

        const data = await getPlayerHistoryGraphData(playerId, 50);

        pageManager.addComponent("Display Ping History Graph", <PlayerPingHistory key="ping" data={data}/>);
    }

    if(pageManager.bEnabled("Display Recent Matches")){

        pageManager.addComponent("Display Recent Matches",<PlayerRecentMatches 
            key={"prm"}  
            perPage={pageSettings["Recent Matches Per Page"]} 
            defaultDisplayMode={pageSettings["Default Recent Matches Display"]}
            playerId={playerId} 
            totalMatches={totalMatches} 
        />);
    }

    if(pageManager.bEnabled("Display Telefrag Stats")){

        const data = await getTelefragTotals(playerId);

        pageManager.addComponent("Display Telefrag Stats", <PlayerTeleFrags key="tele" data={data}/>);
    }


    if(pageManager.bEnabled("Display Map Stats")){

        const {gametypeNames, data} = await getProfileMapStats(playerId);
        pageManager.addComponent("Display Map Stats", <PlayerMapStats key="maps" gametypeNames={gametypeNames} data={data}/>);
    }
    

    if(pageManager.bEnabled("Display Win Rates")){

        const data = await getAllCurrentWinrates(playerId);
        pageManager.addComponent("Display Win Rates", <PlayerWinRates key="wins" data={data}/>);
    }

    if(pageManager.bEnabled("Display Combogib Stats")){

        const data = await getCombogibTotals(playerId);

        pageManager.addComponent("Display Combogib Stats", <PlayerCombogibStats key="combo" data={data}/>);
    }


    pageManager.addComponent("Display Monsterhunt Basic Stats", <PlayerMonsterHuntStats key="mh-basic" data={basic}/>)

    
    if(pageManager.bEnabled("Display Monsterhunt Monster Stats")){

        const data = await getPlayerProfileMonsters(playerId);
        pageManager.addComponent("Display Monsterhunt Monster Stats", <PlayerMonsters key="mh-monsters" data={data}/>);
    }

    pageManager.addComponent("Display Summary",<PlayerGeneral key="sum" data={basic} country={getCountryName(basic.country)} face={faces[basic.face].name}/> );


    if(pageManager.bEnabled("Display Powerups Summary")){
        const data = await getPowerupData(playerId);
        pageManager.addComponent("Display Powerups Summary", <PlayerPowerupSummary data={data} key="powerups"/>);
    }

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{basic.name} - Player Profile</div>        
                {elems}
            </div>    
        </div>   
    </main>
}