import MatchWeapon from '../MatchWeapon/';

const getWeaponData = (id, data) =>{

    const found = [];

    for(let i = 0; i < data.length; i++){

        if(data[i].weapon_id === id){
            found.push(data[i]);
        }
    }

    return JSON.stringify(found);
}

const createPlayerMap = (players) =>{

    const playerMap = new Map();

    for(let i = 0; i < players.length; i++){

        playerMap.set(players[i].player_id, {"name": players[i].name, "country": players[i].country, "team": players[i].team});
    }

    return playerMap;
    
}

const setPlayersDetails = (weaponData, players) =>{

    const mapData = createPlayerMap(players);

    let currentPlayer = 0;

    for(let i = 0; i < weaponData.length; i++){

        currentPlayer = mapData.get(weaponData[i].player_id);

        if(currentPlayer !== undefined){

            weaponData[i].playerName = currentPlayer.name;
            weaponData[i].playerCountry = currentPlayer.country;
            weaponData[i].playerTeam = currentPlayer.team;

        }else{
            weaponData[i].playerName = "Not Found";
            weaponData[i].playerCountry = "xx";
            weaponData[i].playerTeam = 0;
        }
    }
}

const MatchWeaponSummary = ({data, players, bTeamGame}) =>{

    data = JSON.parse(data);
    players = JSON.parse(players);

    setPlayersDetails(data.playerData, players);

    const elems = [];

    let currentId = 0;

    for(let i = 0; i < data.names.length; i++){

        currentId = data.names[i].id;
        if(data.names[i].name.toLowerCase() !== 'none'){
            elems.push(
                <MatchWeapon key={`match_weapon_${data.names[i].name}`} name={data.names[i].name} data={getWeaponData(currentId, data.playerData)} bTeamGame={bTeamGame}/>
            );
        }
        
    }

    return (
        <div>
        <div className="default-header">
            Weapon Summary
        </div>
        {elems}
        </div>
    );
}


export default MatchWeaponSummary;