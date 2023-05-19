import {useReducer, useEffect} from "react";
import Loading from "../../Loading";
import ErrorMessage from "../../ErrorMessage";
import InteractiveTable from "../../InteractiveTable";
import Functions from "../../../api/functions";
import CountryFlag from "../../CountryFlag";

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

const renderData = (capData, matchStart, playerId, players) =>{

    const headers = {
        "info": "Info",
        "type": "Cap Type",
        "taken": "Flag Taken",
        "cap": "Flag Capped",
        "carry_time": "Time Carrying Flag"
    };

    const player = Functions.getPlayer(players, playerId, true);

    const data = capData.map((cap) =>{

        const grabTime = cap.grab_time - matchStart;
        const capTime = cap.cap_time - matchStart;

        const info = <><CountryFlag country={player.country}/>{player.name} Capped the {Functions.getTeamName(cap.flag_team, true)} Flag</>

        const type = (cap.total_assists === 0) ? "Solo Cap" : "Assisted Cap";

        return {
            "info": {"value": "", "displayValue": info, "className": Functions.getTeamColor(cap.cap_team)},
            "type": {"value": cap.total_assists, "displayValue": type},
            "taken": {"value": grabTime, "displayValue": Functions.MMSS(grabTime)},
            "cap": {"value": capTime, "displayValue": Functions.MMSS(capTime)},
            "carry_time": {"value": cap.times.carry_time, "displayValue": <div><span className="playtime">{Functions.toPlaytime(cap.times.carryTime)}</span> ({cap.times.carryPercent.toFixed(2)}%)</div>}
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>;
}

const PlayerMatchCTFCaps = ({matchId, playerId, playerData, matchStart}) =>{

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
        {renderData(state.capData, matchStart, playerId, playerData)}
    </div>
}


export default PlayerMatchCTFCaps;