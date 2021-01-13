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
import MatchSpecialEvents from '../../components/MatchSpecialEvents/';
import Weapons from '../../api/weapons';
import MatchWeaponSummary from '../../components/MatchWeaponSummary/';
import MatchCTFSummary from '../../components/MatchCTFSummary/'


function bCTF(players){
  
    let p = 0;

    const vars = ['assist', 'return', 'taken', 'dropped', 'capture', 'pickup', 'cover', 'kill', 'save'];

    for(let i = 0; i < players.length; i++){

        p = players[i];

        for(let v = 0; v < vars.length; v++){

            if(p[`flag_${vars[v]}`] > 0){
                return true;
            }
        }  
    }

    return false;
}


function Match({info, server, gametype, map, image, playerData, weaponData}){

    const parsedInfo = JSON.parse(info);

    const parsedPlayerData = JSON.parse(playerData);


    const elems = [];

    elems.push(
        <MatchSummary info={info} server={server} gametype={gametype} map={map} image={image}/>
    );


    if(bCTF(parsedPlayerData)){

        elems.push(
            <MatchCTFSummary players={playerData} totalTeams={parsedInfo.total_teams}/>
        );
    }

    elems.push(
        <MatchFragSummary bTeamGame={parsedInfo.team_game} totalTeams={parsedInfo.total_teams} playerData={playerData}/>
    );

    elems.push(
        <MatchSpecialEvents bTeamGame={parsedInfo.team_game} players={playerData}/>
    );

    elems.push(
        <MatchWeaponSummary data={weaponData} players={playerData} bTeamGame={parsedInfo.team_game}/>
    );

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        Match Report
                    </div>
   
                        {elems}
    
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

    for(let i = 0; i < playerData.length; i++){

        //playerData[i].name = 'Not Found';
        currentName = playerNames.get(playerData[i].player_id);

        if(currentName === undefined){
            currentName = 'Not Found';
        }
        playerData[i].name = currentName;
    }

    playerData = JSON.stringify(playerData);


    const weaponManager = new Weapons();

    let weaponData = await weaponManager.getMatchData(matchId);

    weaponData = JSON.stringify(weaponData);

    return {
        props: {
            "info": JSON.stringify(matchInfo),
            "server": serverName,
            "gametype": gametypeName,
            "map": mapName,
            "image": image,
            "playerData": playerData,
            "weaponData": weaponData
        }
    };

}

export default Match;