import Head from '../../components/classic/Head';
import Nav from '../../components/classic/Nav';
import Footer from '../../components/Footer';
import Session from '../../api/session';
import Screenshot from '../../components/Screenshot';
import Matches from '../../api/classic/matches';
import Players from '../../api/classic/players';
import Maps from '../../api/maps';
import Faces from '../../api/faces';
import HomeRecentMatches from '../../components/classic/HomeRecentMatches';
import HomeRecentPlayers from '../../components/classic/HomeRecentPlayers';
import Gametypes from '../../api/classic/gametypes';
import HomeGametypes from '../../components/classic/HomeGametypes';
import ClassicMaps from '../../api/classic/maps';
import HomeTopMaps from '../../components/HomeTopMaps';




const HomePage = ({host, session, matchData, playerData, faces, image, recentMatches, recentPlayers, gametypesData,
        mostPlayedMaps, mapImages}) =>{

    matchData = JSON.parse(matchData);
    recentMatches = JSON.parse(recentMatches);
    recentPlayers = JSON.parse(recentPlayers);
    gametypesData = JSON.parse(gametypesData);

    let screenshotElem = null;

    if(matchData !== -1){

        screenshotElem = <Screenshot map={matchData.mapfile} totalTeams={matchData.teams} players={playerData} image={image} bClassic={true}
            serverName={matchData.servername} gametype={matchData.gamename} matchData={JSON.stringify(matchData)} faces={faces} bHome={true}
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
                        <HomeRecentMatches data={recentMatches}/>  
                        <HomeGametypes data={gametypesData}/>
                        <HomeTopMaps maps={mostPlayedMaps} images={mapImages} classic={true}/>
                        <HomeRecentPlayers data={recentPlayers} faces={JSON.parse(faces)}/>   
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
    const totalFaces = (matchData.players > 4) ? matchData.players : 5
    const faces = faceManager.getRandom(totalFaces);

    if(matchData !== null){
        playerData = await playerManager.getMatchData(matchData.id, false);
        
    }else{
        matchData = -1;
    }

    const recentMatches = await matchManager.getLatestMatches(0, 0, 3);

    let recentPlayerData = [];

    if(recentMatches.length > 0){
        recentPlayerData = await playerManager.getLatestPlayerDetails(recentMatches[0].id, 5);
    }

    const gametypeManager = new Gametypes();
    const gametypesData = await gametypeManager.getMostPlayed(5);

    const cMapManager = new ClassicMaps();

    const mostPlayedMaps = await cMapManager.getMostPlayedBasic(3);

    const mapNames = [];

    for(let i = 0; i < mostPlayedMaps.length; i++){

        const m = mostPlayedMaps[i];

        mapNames.push(m.name);
    }

    const mapImages = await mapManager.getImages(mapNames);

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "matchData": JSON.stringify(matchData),
            "playerData": JSON.stringify(playerData),
            "faces": JSON.stringify(faces),
            "image": image,
            "recentMatches": JSON.stringify(recentMatches),
            "recentPlayers": JSON.stringify(recentPlayerData),
            "gametypesData": JSON.stringify(gametypesData),
            "mostPlayedMaps": JSON.stringify(mostPlayedMaps),
            "mapImages": JSON.stringify(mapImages)
  
        }
    };
}


export default HomePage;