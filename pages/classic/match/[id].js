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

const MatchPage = ({host, session, matchId, matchData, playerData, weaponData, rankingData}) =>{

    matchData = JSON.parse(matchData);
    playerData = JSON.parse(playerData);
    weaponData = JSON.parse(weaponData);
    rankingData = JSON.parse(rankingData);

    const basicPlayerData = {};

    for(const [key, value] of Object.entries(playerData)){

        basicPlayerData[value.pid] = {
            "name": value.name,
            "team": value.team,
            "country": value.country,
            "id": value.pid
        }
    }


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
                    <MatchFragSummary data={playerData} teams={matchData.teams} matchId={matchId}/>
                    <MatchCTFSummary data={playerData} teams={matchData.teams} matchId={matchId}/>
                    <MatchAssaultSummary data={playerData} matchId={matchId}/>
                    <MatchSpecialEvents data={playerData} teams={matchData.teams} matchId={matchId}/>
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


    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "matchId": id,
            "matchData": JSON.stringify(matchData),
            "playerData": JSON.stringify(playerData),
            "weaponData": JSON.stringify(weaponData),
            "rankingData": JSON.stringify(rankingData)
        }
    }
}


export default MatchPage;