import {useReducer, useEffect} from "react";
import Loading from "../../Loading";
import ErrorMessage from "../../ErrorMessage";
import InteractiveTable from "../../InteractiveTable";
import CountryFlag from "../../CountryFlag";
import { scalePlaytime, MMSS, toPlaytime, getTeamColor, getTeamName, getPlayer } from "../../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "capData": action.capData
            }
        }
        default: return state;
    }
}

const renderData = (capData, matchStart, playerId, players, bHardcode) =>{

    const headers = {
        "info": "Info",
        "type": "Cap Type",
        "taken": "Flag Taken",
        "cap": "Flag Capped",
        "carry_time": "Time Carrying Flag"
    };

    const player = getPlayer(players, playerId, true);

    const data = capData.map((cap) =>{

        const grabTime = scalePlaytime(cap.grab_time - matchStart, bHardcode);
        const capTime = scalePlaytime(cap.cap_time - matchStart, bHardcode);

        const info = <><CountryFlag country={player.country}/>{player.name} Capped the {getTeamName(cap.flag_team, true)} Flag</>

        const type = (cap.total_assists === 0) ? "Solo Cap" : "Assisted Cap";

        return {
            "info": {"value": "", "displayValue": info, "className": getTeamColor(cap.cap_team)},
            "type": {"value": cap.total_assists, "displayValue": type},
            "taken": {"value": grabTime, "displayValue": MMSS(grabTime)},
            "cap": {"value": capTime, "displayValue": MMSS(capTime)},
            "carry_time": {"value": cap.times.carry_time, "displayValue": <div><span className="playtime">{toPlaytime(scalePlaytime(cap.times.carryTime, bHardcode))}</span> ({cap.times.carryPercent.toFixed(2)}%)</div>}
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>;
}

const PlayerMatchCTFCaps = ({matchId, playerId, playerData, matchStart, bHardcore}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "capData": []
    });


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/ctf",{
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "player-match-caps", "playerId": playerId, "matchId": matchId})
                });

                const res = await req.json();

                if(res.error !== undefined){
                    dispatch({"type": "error", "errorMessage": res.error});
                }else{

                    dispatch({"type": "loaded", "capData": res.data});
                }

            }catch(err){

                if(err.name !== "AbortError"){
                    console.trace(err);
                }
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId, playerId]);

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Player Caps" text={state.error}/>


    if(state.capData.length === 0) return null;

    return <div>
        <div className="default-header">Player Caps</div>
        {renderData(state.capData, matchStart, playerId, playerData, bHardcore)}
    </div>
}


export default PlayerMatchCTFCaps;