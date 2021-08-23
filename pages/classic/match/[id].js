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
import Functions from '../../../api/functions';
import Maps from '../../../api/maps';
import Faces from '../../../api/faces';
import Analytics from '../../../api/analytics';

const MatchPage = ({host, session, matchId, matchData, playerData, weaponData, rankingData, killsData, image, faces}) =>{

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
    

    const map = Functions.removeUnr(matchData.mapfile);
    const dateString = Functions.convertTimestamp(Functions.utDate(matchData.time, true, true));

    const ogImage = Functions.createMapOGLink(image);

    return <div>
        <Head host={host} title={`${map} (${dateString}) Match report (Classic)`} 
            description={`Match report for ${map} (${matchData.gamename}${(matchData.insta) ? " Instagib" : ""}) 
            played on ${matchData.servername} at ${dateString}, total players ${matchData.players}, match length ${Functions.MMSS(matchData.gametime)}.`} 
            keywords={`match,report,${map},${matchData.gamename},${matchData.servername}`} image={ogImage}
        />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Match Report</div>
                    <MatchSummary data={matchData}/>
                    <Screenshot map={matchData.mapfile} totalTeams={matchData.teams} players={JSON.stringify(playerData)} image={image} bClassic={true}
                        serverName={matchData.servername} gametype={matchData.gamename} matchData={JSON.stringify(matchData)} faces={faces}
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

    const playerData = await playerManager.getMatchData(id, false);

    const weaponsManager = new Weapons();

    const weaponData = await weaponsManager.getMatchData(id);

    const rankingManager = new Rankings();

    const playerIds = [];

    for(const [key, value] of Object.entries(playerData)){

        playerIds.push(value.pid);
    }

    const rankingData = await rankingManager.getPlayers(playerIds, matchData.gid);

    const killsData = await matchManager.getKillsData(id);

    const mapManager = new Maps();

    const image = await mapManager.getImage(matchData.mapfile);

    const faceManager = new Faces();

    const faces = faceManager.getRandom(matchData.players);

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);


    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "matchId": id,
            "matchData": JSON.stringify(matchData),
            "playerData": JSON.stringify(playerData),
            "weaponData": JSON.stringify(weaponData),
            "rankingData": JSON.stringify(rankingData),
            "killsData": JSON.stringify(killsData),
            "image": image,
            "faces": JSON.stringify(faces)
        }
    }
}


export default MatchPage;