import {React, useEffect, useReducer, useState} from "react";
import ErrorMessage from "../../ErrorMessage";
import Loading from "../../Loading";
import InteractiveTable from "../../InteractiveTable";
import Functions from "../../../api/functions";

const renderData = (returnData, matchStart) =>{

    const headers = {
        "grabbed": "Taken Timestamp",
        "returnTime": "Return Timestamp",
        "travel": "Total Time Taken",
        "carry": "Carry Time",
        "dropped": "Time Dropped",
        "distance": "Distance To Cap"
    };

    const data = returnData.map((currentReturn) =>{

        const returnTime = currentReturn.return_time - matchStart;
        const takenTime = currentReturn.grab_time - matchStart;
        const distance = currentReturn.distance_to_cap;

        return {
            "grabbed": {"value": takenTime, "displayValue": Functions.MMSS(takenTime)},
            "returnTime": {"value": returnTime, "displayValue": Functions.MMSS(returnTime)},
            "carry": {
                "value": currentReturn.carry_time, 
                "displayValue": Functions.toPlaytime(currentReturn.carry_time),
                "className": "playtime"
            },
            "travel": {
                "value": currentReturn.travel_time,
                "displayValue": Functions.toPlaytime(currentReturn.travel_time),
                "className": "playtime"
            },
            "dropped": {
                "value": currentReturn.drop_time,
                "displayValue": Functions.toPlaytime(currentReturn.drop_time),
                "className": "playtime"
            },
            "distance": {
                "value": distance, 
                "displayValue": `${distance.toFixed(2)} (${Functions.getSmartCTFReturnString(currentReturn.return_string)})`
            }
        }
    });

    return <>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const getTotalReturnsByType = (data) =>{

    const found = {
        "base": 0,
        "mid": 0,
        "enemy": 0,
        "save": 0
    };

    for(let i = 0; i < data.length; i++){

        const rString = data[i].return_string.toLowerCase();

        if(rString === "return_closesave") found.save++;
        if(rString === "return_enemybase") found.enemy++;
        if(rString === "return_mid") found.mid++;
        if(rString === "return_base") found.base++;
     
    }

    return found;
}


const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "returnData": action.data
            }
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        default: return state;
    }
}

const PlayerMatchCTFReturns = ({matchId, playerId, playerData, matchStart}) =>{

    //const [displayMode, setDisplayMode] = useState(0);

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "returnData": []
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{
            
            const req = await fetch("/api/ctf", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "match-returns-player",
                    "matchId": matchId,
                    "playerId": playerId
                })
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{
                dispatch({"type": "loaded", "data": res.data});
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    },[matchId, playerId])

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Capture The Flag Returns" text={state.error}/>

    return <div>
        <div className="default-header">Capture The Flag Returns</div>

        {renderData(state.returnData, matchStart)}
        
    </div>
}

export default PlayerMatchCTFReturns;