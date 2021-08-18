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

const PlayerPage = ({session, host, basicData, data, gametypeData, firstBloods, weaponData, rankingData}) =>{

    basicData = JSON.parse(basicData)
    data = JSON.parse(data);
    gametypeData = JSON.parse(gametypeData);
    weaponData = JSON.parse(weaponData);
    rankingData = JSON.parse(rankingData);

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

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "basicData": JSON.stringify(basicData),
            "data": JSON.stringify(data),
            "gametypeData": JSON.stringify(playerGametypeData),
            "firstBloods": firstBloods,
            "weaponData": JSON.stringify(weaponData),
            "rankingData": JSON.stringify(rankingData)
        }
    };
}


export default PlayerPage;