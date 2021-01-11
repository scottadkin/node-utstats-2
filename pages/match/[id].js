import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/'
import Footer from '../../components/Footer/';
import MatchManager from '../../api/match';
import Servers from '../../api/servers';
import Maps from '../../api/maps';
import Gametypes from '../../api/gametypes';
import MatchSummary from '../../components/MatchSummary/'
import Player from '../../api/player';
import MatchFragSummary from '../../components/MatchFragSummary/';


function Match({info, server, gametype, map, image, playerData}){

    const parsedInfo = JSON.parse(info);

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        Match Report
                    </div>

                    <MatchSummary info={info} server={server} gametype={gametype} map={map} image={image}/>

                    <MatchFragSummary bTeamGame={parsedInfo.team_game} totalTeams={parsedInfo.total_teams} playerData={playerData}/>
                </div>
            </div>
            <Footer />
        </main>
    </div>
}


export async function getServerSideProps({query}){

    let matchId = (query.id !== undefined) ? parseInt(query.id) : parseInt(null);

    const m = new MatchManager();

    if(matchId !== matchId){
        return {
            props: {

            }
        };
    }

    if(!await m.exists(matchId)){

        return {
            props: {

            }
        };
    }

    let matchInfo = await m.get(matchId);

    const s = new Servers();

    const serverName = await s.getName(matchInfo.server);

    const g = new Gametypes();
    const gametypeName = await g.getName(matchInfo.gametype);

    const map = new Maps();
    const mapName = await map.getName(matchInfo.map);

    const image = await map.getImage(mapName);

    const playerManager = new Player();

    let playerData = await playerManager.getAllInMatch(matchId);

    const playerIds = [];

    for(let i = 0; i < playerData.length; i++){

        playerIds.push(playerData[i].player_id);
    }

    let playerNames = await playerManager.getNames(playerIds);

    let currentName = 0;

    console.log(playerNames);

    for(let i = 0; i < playerData.length; i++){

        //playerData[i].name = 'Not Found';
        currentName = playerNames.get(playerData[i].player_id);

        console.log(`currentName = ${currentName} ()`);
        if(currentName === undefined){
            currentName = 'Not Found';
        }
        playerData[i].name = currentName;
    }

   // console.log(playerData);

    playerData = JSON.stringify(playerData);

    return {
        props: {
            "info": JSON.stringify(matchInfo),
            "server": serverName,
            "gametype": gametypeName,
            "map": mapName,
            "image": image,
            "playerData": playerData
        }
    };

}

export default Match;