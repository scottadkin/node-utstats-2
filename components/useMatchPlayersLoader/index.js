import {useEffect, useState} from "react";

const createPlayerObjects = (data, optionalTargetPlayer) =>{

    const basicPlayers = {};
    const justPlayerNames = {};
    const playedPlayersIds = {};
    const playedPlayersData = [];
    const targetPlayer = [];

    for(let i = 0; i < data.playerData.length; i++){

        const p = data.playerData[i];

        basicPlayers[p.player_id] = {
            "id": p.player_id,
            "name": p.name, 
            "country": p.country,
            "team": p.team,
            "spectator": p.spectator,
            "played": p.played,
            "playtime": p.playtime
        };

        if(p.player_id === optionalTargetPlayer){
            targetPlayer.push(p);
        }

        justPlayerNames[data.playerData[i].player_id] = data.playerData[i].name;

        if(p.playtime > 0 || !p.spectator){
            playedPlayersIds[data.playerData[i].player_id] = data.playerData[i].name;
            playedPlayersData.push(p);
        }
    }


    return {
        "playerData": data.playerData,
        "faces": data.playerFaces,
        "basicPlayers": basicPlayers,
        "nonSpectators": playedPlayersIds,
        "playedPlayersData": playedPlayersData,
        "bLoadingPlayers": false,
        "targetPlayer": targetPlayer
    }
       
}

const useMatchPlayersLoader = (matchId, optionalTargetPlayer) =>{

    if(optionalTargetPlayer === undefined) optionalTargetPlayer = -1;

    const [data, setData] = useState({
        "playerData": [], 
        "faces": {}, 
        "basicPlayers": {}, 
        "nonSpectators": {}, 
        "playedPlayersData": [],
        "bLoadingPlayers": true, 
        "targetPlayer": []
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadPlayerData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {
                    "Content-type": "application/json"
                },
                "method": "POST",
                "body": JSON.stringify({"mode": "players", "matchId": matchId})
            });

            const res = await req.json();
        
            setData(createPlayerObjects(res, optionalTargetPlayer));
  
        }

        loadPlayerData();

        return () =>{
            controller.abort();
        }

    }, [matchId, optionalTargetPlayer]);

    return data;
}

export default useMatchPlayersLoader;
