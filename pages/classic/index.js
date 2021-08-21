import Head from '../../components/classic/Head';
import Nav from '../../components/classic/Nav';
import Footer from '../../components/Footer';
import Session from '../../api/session';
import Screenshot from '../../components/Screenshot';
import Matches from '../../api/classic/matches';
import Players from '../../api/classic/players';
import Maps from '../../api/maps';
import Faces from '../../api/faces';




const HomePage = ({host, session, matchData, playerData, faces, image}) =>{

    matchData = JSON.parse(matchData);

    let screenshotElem = null;

    if(matchData !== -1){

        screenshotElem = <Screenshot map={matchData.mapfile} totalTeams={matchData.teams} players={playerData} image={image} bClassic={true}
            serverName={matchData.servername} gametype={matchData.gamename} matchData={JSON.stringify(matchData)} faces={faces}
        />
    }

    return <div>
            <Head host={host} title={`Home`} 
            description={"Welcome to Node UTStats 2 Classic Mode, view various stats for players,matches,maps,records and more from original utstats databases!"} 
            keywords={`classic`}/>
            <main>
                <Nav />
                <div id="content">

                    <div className="default">
                        <div className="default-header">Welcome to Node UTStats 2 <span className="yellow">Classic Mode</span></div>
                        <div id="welcome-text">
                            Here you can look up information for UT matches, players, and maps from original utstats databases.<br/>
                            Not all features from the main site are available because the original utstats database don't have the required data.
                        </div>


                        {screenshotElem}
                    
                    </div>
                </div>
                
                <Footer session={session}/>
            </main>
        </div>


} 
        



export async function getServerSideProps({req, query}) {

    const session = new Session(req);

    await session.load();

    const matchManager = new Matches();

    const matchData = await matchManager.getLatestMatch();

    const playerManager = new Players();

    let playerData = [];

    const mapManager = new Maps();

    const image = await mapManager.getImage(matchData.mapfile);

    const faceManager = new Faces();

    const faces = faceManager.getRandom(matchData.players);

    if(matchData !== null){
        playerData = await playerManager.getMatchData(matchData.id, false);
        
    }else{
        matchData = -1;
    }

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "matchData": JSON.stringify(matchData),
            "playerData": JSON.stringify(playerData),
            "faces": JSON.stringify(faces),
            "image": image
  
        }
    };
}


export default HomePage;