import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Functions from '../../../api/functions';
import Session from '../../../api/session';
import Matches from '../../../api/classic/matches';
import MatchSummary from '../../../components/classic/MatchSummary';
import Players from '../../../api/classic/players';
import Screenshot from '../../../components/Screenshot';
import Faces from '../../../api/faces';
import MatchFragSummary from '../../../components/classic/MatchFragSummary';
import MatchCTFSummary from '../../../components/classic/MatchCTFSummary';
import MatchSpecialEvents from '../../../components/classic/MatchSpecialEvents';
import MatchPickupsSummary from '../../../components/classic/MatchPickupsSummary';
import MatchWeaponStats from '../../../components/classic/MatchWeaponStats';
import Weapons from '../../../api/classic/weapons';
import Rankings from '../../../api/classic/rankings';
import MatchRankingSummary from '../../../components/classic/MatchRankingSummary';
import MatchAssaultSummary from '../../../components/classic/MatchAssaultSummary';
import MatchDominationSummary from '../../../components/classic/MatchDominationSummary';


function getPlayerName(id, players){

    for(let i = 0; i < players.length; i++){

        if(players[i].pid === id) return players[i].name;
    }

    return "Not Found";
}

function getTargetPlayerData(id, players){

    for(let i = 0; i < players.length; i++){

        if(players[i].pid === id) return players[i];
    }

    return null;
}

const PMatch = ({host, session, matchId, playerId, matchData, image, playerData, faces, weaponData, rankingData}) =>{

    matchData = JSON.parse(matchData);
    playerData = JSON.parse(playerData);
    weaponData = JSON.parse(weaponData);
    rankingData = JSON.parse(rankingData);

    const ogImage = Functions.createMapOGLink(image);

    const map = Functions.removeUnr(matchData.mapfile);
    const dateString = Functions.convertTimestamp(Functions.utDate(matchData.time), true, true);

    const playerName = getPlayerName(playerId, playerData);
    const targetPlayerData = getTargetPlayerData(playerId, playerData);
    
    const basicPlayerData = {};

    for(const [key, value] of Object.entries(playerData)){

        if(value.pid === playerId){

            basicPlayerData[value.pid] = {
                "name": value.name,
                "team": value.team,
                "country": value.country,
                "id": value.pid,
                "matchId": value.playerid
            }
            break;
        }
    }

    return <div>
        <Head host={host} title={`${playerName}${Functions.apostrophe(playerName)} match report for ${map} (${dateString})(Classic)`} 
            description={`${playerName }${Functions.apostrophe(playerName)} Match report for ${map} (${matchData.gamename}${(matchData.insta) ? " Instagib" : ""}) 
            played on ${matchData.servername} at ${dateString}, total players ${matchData.players}, match length ${Functions.MMSS(matchData.gametime)}.`} 
            keywords={`match,report,player,${playerName},${map},${matchData.gamename},${matchData.servername}`} image={ogImage}
        />

        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">{playerName}{Functions.apostrophe(playerName)} Match Report</div>
                    <MatchSummary data={matchData}/>
                    <Screenshot map={matchData.mapfile} totalTeams={matchData.teams} players={JSON.stringify(playerData)} image={image} bClassic={true}
                        serverName={matchData.servername} gametype={matchData.gamename} matchData={JSON.stringify(matchData)} faces={faces} 
                        highlight={playerName}
                    />
                    <MatchFragSummary data={[targetPlayerData]} teams={matchData.teams} matchId={matchId} />
                    <MatchCTFSummary data={[targetPlayerData]} teams={matchData.teams} matchId={matchId} />
                    <MatchAssaultSummary data={[targetPlayerData]} teams={matchData.teams} matchId={matchId} />
                    <MatchDominationSummary data={[targetPlayerData]} teams={matchData.teams} matchId={matchId} />

                    <MatchSpecialEvents data={[targetPlayerData]} teams={matchData.teams} matchId={matchId} />
                    
                    <MatchPickupsSummary data={[targetPlayerData]} teams={matchData.teams} matchId={matchId} />

                    <MatchWeaponStats data={weaponData.stats} names={weaponData.names} players={basicPlayerData}
                    teams={matchData.teams} matchId={matchId}/>
                    <MatchRankingSummary data={rankingData} players={basicPlayerData} teams={matchData.teams} matchId={matchId}/>
    
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

    const weaponsManager = new Weapons();

    const weaponData = await weaponsManager.getMatchData(id, [playerId]);

    const rankingManager = new Rankings();
    const rankingData = await rankingManager.getPlayers([playerId], matchData.gid);

    return {
        "props": {
            "host": host,
            "session": JSON.stringify(session.settings),
            "matchId": id,
            "playerId": playerId,
            "matchData": JSON.stringify(matchData),
            "image": "/images/maps/default.jpg",
            "playerData": JSON.stringify(playerData),
            "faces": JSON.stringify(faces),
            "weaponData": JSON.stringify(weaponData),
            "rankingData": JSON.stringify(rankingData)
            
        }
    }
}

export default PMatch;