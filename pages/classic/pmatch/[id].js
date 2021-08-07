import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Matches from '../../../api/classic/matches';
import MatchSummary from '../../../components/classic/MatchSummary';
import Players from '../../../api/classic/players';
import Screenshot from '../../../components/Screenshot';
import Faces from '../../../api/faces';

function getPlayerName(id, players){

    for(let i = 0; i < players.length; i++){

        if(players[i].pid === id) return players[i].name;
    }

    return "Not Found";
}

const PMatch = ({host, session, matchId, playerId, matchData, image, playerData, faces}) =>{

    matchData = JSON.parse(matchData);
    playerData = JSON.parse(playerData);

    return <div>
        <Head host={host} title={`Player Match report (Classic)`} 
        description={`Player Match report `} 
        keywords={`match,report,player`}
        />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Player Match Report</div>
                    <MatchSummary data={matchData}/>
                    <Screenshot map={matchData.mapfile} totalTeams={matchData.teams} players={JSON.stringify(playerData)} image={image} bClassic={true}
                        serverName={matchData.servername} gametype={matchData.gamename} matchData={JSON.stringify(matchData)} faces={faces} 
                        highlight={getPlayerName(playerId, playerData)}
                    />
    
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>;
}

export async function getServerSideProps({req, query}){

    let id = (query.id !== undefined) ? parseInt(query.id) : -1;
    let playerId = (query.p !== undefined) ? parseInt(query.p) : -1;

    if(id !== id) id = -1;
    if(playerId !== playerId) playerId = -1;

    const host = req.headers.host;

    const session = new Session(req);
    await session.load();

    const matchManager = new Matches();
    const matchData = await matchManager.getData(id); 

    const playerManager = new Players();
    const playerData = await playerManager.getMatchData(id);

    const faceManager = new Faces();
    const faces = faceManager.getRandom(matchData.players);

    return {
        "props": {
            "host": host,
            "session": JSON.stringify(session.settings),
            "matchId": id,
            "playerId": playerId,
            "matchData": JSON.stringify(matchData),
            "image": "/images/maps/default.jpg",
            "playerData": JSON.stringify(playerData),
            "faces": JSON.stringify(faces)
            
        }
    }
}

export default PMatch;