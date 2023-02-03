import {useEffect, useState} from "react";


const useMatchPlayersLoader = (matchId) =>{

    const [data, setData] = useState({"playerData": [], "faces": {}, "basicPlayers": {}, "nonSpectators": {}, "bLoadingPlayers": true});

    const createPlayerObjects = (data) =>{

        const basicPlayers = {};
        const justPlayerNames = {};
        const playedPlayers = {};

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

            justPlayerNames[data.playerData[i].player_id] = data.playerData[i].name;

            if(p.playtime > 0 || !p.spectator){
                playedPlayers[data.playerData[i].player_id] = data.playerData[i].name;
            }
        }

        return {
            "playerData": data.playerData,
            "faces": data.playerFaces,
            "basicPlayers": basicPlayers,
            "nonSpectators": playedPlayers,
            "bLoadingPlayers": false
        }
           
    }

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
        
            setData(createPlayerObjects(res))
        }

        loadPlayerData();

        return () =>{
            controller.abort();
        }

    }, [matchId]);

    return data;
}

export default useMatchPlayersLoader;
