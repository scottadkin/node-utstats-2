import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Matches from '../../../api/classic/matches';
import MatchSummary from '../../../components/classic/MatchSummary';
import Players from '../../../api/classic/players';
import MatchFragSummary from '../../../components/classic/MatchFragSummary';
import MatchSpecialEvents from '../../../components/classic/MatchSpecialEvents';
import Weapons from '../../../api/classic/weapons';
import MatchWeaponStats from '../../../components/classic/MatchWeaponStats';
import Rankings from '../../../api/classic/rankings';
import MatchRankingSummary from '../../../components/classic/MatchRankingSummary';
import MatchPickupsSummary from '../../../components/classic/MatchPickupsSummary';
import MatchCTFSummary from '../../../components/classic/MatchCTFSummary';
import MatchAssaultSummary from '../../../components/classic/MatchAssaultSummary';
import MatchDominationSummary from '../../../components/classic/MatchDominationSummary';
import MatchKillsMatchUp from '../../../components/classic/MatchKillsMatchUp';
import Screenshot from '../../../components/Screenshot';

const MatchPage = ({host, session, matchId, matchData, playerData, weaponData, rankingData, killsData}) =>{

    matchData = JSON.parse(matchData);
    playerData = JSON.parse(playerData);
    weaponData = JSON.parse(weaponData);
    rankingData = JSON.parse(rankingData);
    killsData = JSON.parse(killsData);

    const basicPlayerData = {};

    for(const [key, value] of Object.entries(playerData)){

        basicPlayerData[value.pid] = {
            "name": value.name,
            "team": value.team,
            "country": value.country,
            "id": value.pid,
            "matchId": value.playerid
        }
    }

    //map, totalTeams, players, image, matchData, serverName, gametype, faces, highlight, bHome

    /**
     * map={map} totalTeams={parsedInfo.total_teams} players={playerData} image={image} matchData={info}
            serverName={server} gametype={gametype} faces={faces}
     */

    return <div>
        <Head host={host} title={`Match report`} 
        description={`match report`} 
        keywords={`classic,match,report`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Match Report</div>
                    <MatchSummary data={matchData}/>
                    <Screenshot map={matchData.mapfile} totalTeams={matchData.teams} players={JSON.stringify(playerData)} image={`/images/maps/default.jpg`} bClassic={true}
                        serverName={matchData.servername} gametype={matchData.gamename} matchData={JSON.stringify(matchData)} faces={"[]"}
                    />
                    <MatchFragSummary data={playerData} teams={matchData.teams} matchId={matchId}/>
                    <MatchCTFSummary data={playerData} teams={matchData.teams} matchId={matchId}/>
                    <MatchAssaultSummary data={playerData} matchId={matchId}/>
                    <MatchDominationSummary data={playerData} teams={matchData.teams} matchId={matchId}/>
                    <MatchSpecialEvents data={playerData} teams={matchData.teams} matchId={matchId}/>
                    <MatchKillsMatchUp data={killsData} matchId={matchId} players={basicPlayerData} teams={matchData.teams}/>
                    <MatchPickupsSummary data={playerData} matchId={matchId} teams={matchData.teams} />
                    <MatchWeaponStats data={weaponData.stats} names={weaponData.names} players={basicPlayerData}
                    teams={matchData.teams} matchId={matchId}/>
                    <MatchRankingSummary data={rankingData} players={basicPlayerData} teams={matchData.teams} matchId={matchId}/>
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}){

    const session = new Session(req);

    await session.load();

    const matchManager = new Matches();

    let id = 0;

    if(query.id !== undefined){

        id = parseInt(query.id);
    
        if(id !== id) id = 0;
    }

    const matchData = await matchManager.getData(id);

    const playerManager = new Players();

    const playerData = await playerManager.getMatchData(id);

    const weaponsManager = new Weapons();

    const weaponData = await weaponsManager.getMatchData(id);

    const rankingManager = new Rankings();

    const playerIds = [];

    for(const [key, value] of Object.entries(playerData)){

        playerIds.push(value.pid);
    }

    const rankingData = await rankingManager.getPlayers(playerIds, matchData.gid);

    const killsData = await matchManager.getKillsData(id);

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "matchId": id,
            "matchData": JSON.stringify(matchData),
            "playerData": JSON.stringify(playerData),
            "weaponData": JSON.stringify(weaponData),
            "rankingData": JSON.stringify(rankingData),
            "killsData": JSON.stringify(killsData)
        }
    }
}


export default MatchPage;