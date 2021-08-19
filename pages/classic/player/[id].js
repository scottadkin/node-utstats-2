import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Players from '../../../api/classic/players';
import Functions from '../../../api/functions';
import PlayerGeneral from '../../../components/classic/PlayerGeneral';
import Gametypes from '../../../api/classic/gametypes';
import PlayerSpecialEvents from '../../../components/classic/PlayerSpecialEvents';
import PlayerCTFSummary from '../../../components/classic/PlayerCTFSummary';
import PlayerADSummary from '../../../components/classic/PlayerADSummary';
import Weapons from '../../../api/classic/weapons';
import PlayerWeaponStats from '../../../components/classic/PlayerWeaponStats';
import PlayerPingSummary from '../../../components/classic/PlayerPingSummary';
import Rankings from '../../../api/classic/rankings';
import PlayerRankingSummary from '../../../components/classic/PlayerRankingSummary';
import PlayerRecentMatches from '../../../components/classic/PlayerRecentMatches';
import MainMaps from '../../../api/maps';

const PlayerPage = ({session, host, playerId, basicData, data, gametypeData, firstBloods, weaponData, rankingData,
        recentMatches, mapImages, page, pages, perPage, mode }) =>{

    basicData = JSON.parse(basicData)
    data = JSON.parse(data);
    gametypeData = JSON.parse(gametypeData);
    weaponData = JSON.parse(weaponData);
    rankingData = JSON.parse(rankingData);
    recentMatches = JSON.parse(recentMatches);
    mapImages = JSON.parse(mapImages);

    const title = `${basicData.name}${Functions.apostrophe(basicData.name)} Career Profile`;

    const adTotals = {
        "dom": data.totals.dom.caps,
        "assault": data.totals.assault.caps
    };

    const adMax = {
        "dom": data.max.dom.caps
    };

    const pingAverage = {
        "min": data.totals.ping.low,
        "average": data.totals.ping.average,
        "max": data.totals.ping.max
    };

    const pingMax = {
        "min": data.max.ping.low,
        "average": data.max.ping.average,
        "max": data.max.ping.max
    };

    return <div>
    <Head host={host} title={title} 
    description={`page desc`} 
    keywords={`,classic`}/>
    <main>
        <Nav />
        <div id="content">

            <div className="default">
                <div className="default-header">{title}</div>
                <PlayerGeneral totals={data.totals} gametypes={gametypeData}/>
                <PlayerCTFSummary totals={data.totals.ctf} max={data.max.ctf}/>
                <PlayerADSummary totals={adTotals} max={adMax}/>
                <PlayerSpecialEvents data={data.totals} firstBloods={firstBloods}/>
                <PlayerWeaponStats data={weaponData}/>
                <PlayerPingSummary average={pingAverage} max={pingMax}/>
                <PlayerRankingSummary data={rankingData} playerName={basicData.name}/>
                <PlayerRecentMatches data={recentMatches} images={mapImages} page={page} perPage={perPage} pages={pages}
                    playerId={playerId} mode={mode}
                />
            </div>
        </div>
        
        <Footer session={session}/>
    </main>
</div>

}


export async function getServerSideProps({req, query}) {

    const session = new Session(req);
    await session.load();

    let id = parseInt(query.id);
    if(id !== id) id = 1;

    let matchPage = (query.matchPage !== undefined) ? parseInt(query.matchPage) : 1;
    if(matchPage !== matchPage) matchPage = 1;
    matchPage--;

    let matchView = "d";

    if(query.mv !== undefined) matchView = query.mv;

    if(query.mv != "a" || query.mv !== "t") query.mv = "d";

    const playerManager = new Players();
    const data = await playerManager.getPlayerProfileData(id);

    const basicData = await playerManager.getSingleNameAndCountry([id]);

    const playerGametypeData = await playerManager.getPlayerGametypes(id);

    const gametypeManager = new Gametypes();

    const gametypeIds = [];

    for(let i = 0; i < playerGametypeData.length; i++){

        const g = playerGametypeData[i];
        gametypeIds.push(g.gid);
    }

    const gametypeNames = await gametypeManager.getNames(gametypeIds);

    for(let i = 0; i < playerGametypeData.length; i++){

        const g = playerGametypeData[i];

        const currentName = gametypeNames[g.gid];

        if(currentName === undefined) currentName = "Not Found";

        g.name = currentName;
    }

    const firstBloods = await playerManager.getTotalFirstBloods(id);

    const weaponManager = new Weapons();
    const weaponData = await weaponManager.getPlayerTotals(id);

    const rankingManager = new Rankings();

    const rankingData = await rankingManager.getPlayerData(id);

    const matchesPerPage = 20;
    const recentMatches = await playerManager.getRecentMatches(id, matchPage, matchesPerPage);

    const mapNames = [];

    for(let i = 0; i < recentMatches.matches.length; i++){

        const r = recentMatches.matches[i];
        if(mapNames.indexOf(r.mapfile) === -1) mapNames.push(r.mapfile);
    }

    let pages = 1;

    if(recentMatches.totalMatches > 0){
        pages = Math.ceil(recentMatches.totalMatches / matchesPerPage);
    }

    const mapManager = new MainMaps();
    const images = await mapManager.getImages(mapNames);
   
    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "playerId": id,
            "basicData": JSON.stringify(basicData),
            "data": JSON.stringify(data),
            "gametypeData": JSON.stringify(playerGametypeData),
            "firstBloods": firstBloods,
            "weaponData": JSON.stringify(weaponData),
            "rankingData": JSON.stringify(rankingData),
            "recentMatches": JSON.stringify(recentMatches),
            "mapImages": JSON.stringify(images),
            "page": matchPage,
            "perPage": matchesPerPage,
            "pages": pages,
            "mode": matchView
        }
    };
}


export default PlayerPage;