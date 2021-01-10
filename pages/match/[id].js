import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/'
import Footer from '../../components/Footer/';
import MatchManager from '../../api/match';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import Gametypes from '../../api/gametypes';
import MatchSummary from '../../components/MatchSummary/'


function Match({info, server, gametype, map}){

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        Match Report
                    </div>

                    <MatchSummary info={info} server={server} gametype={gametype} map={map}/>
                </div>
            </div>
            <Footer />
        </main>
    </div>
}


export async function getServerSideProps({query}){

    const m = new MatchManager();

    let matchId = (query.id !== undefined) ? parseInt(query.id) : 1;

    if(matchId !== matchId) matchId = 1;

    let matchInfo = await m.get(matchId);

    const s = new Servers();

    const serverName = await s.getName(matchInfo.server);

    console.log(`serverName = ${serverName}`);

    const g = new Gametypes();
    const gametypeName = await g.getName(matchInfo.gametype);

    const map = new Maps();
    const mapName = await map.getName(matchInfo.map);


    return {
        props: {
            info: JSON.stringify(matchInfo),
            server: serverName,
            gametype: gametypeName,
            map: mapName
        }
    };
}

export default Match;