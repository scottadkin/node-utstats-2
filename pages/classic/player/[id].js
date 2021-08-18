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

const PlayerPage = ({session, host, basicData, data, gametypeData, firstBloods}) =>{

    basicData = JSON.parse(basicData)
    data = JSON.parse(data);
    gametypeData = JSON.parse(gametypeData);

    const title = `${basicData.name}${Functions.apostrophe(basicData.name)} Career Profile`;

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
                <PlayerSpecialEvents data={data.totals} firstBloods={firstBloods}/>
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

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "basicData": JSON.stringify(basicData),
            "data": JSON.stringify(data),
            "gametypeData": JSON.stringify(playerGametypeData),
            "firstBloods": firstBloods
        }
    };
}


export default PlayerPage;