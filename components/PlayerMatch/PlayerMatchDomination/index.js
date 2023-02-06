import { useReducer, useEffect } from "react";
import Loading from "../../Loading";
import ErrorMessage from "../../ErrorMessage";
import InteractiveTable from "../../InteractiveTable";
import Functions from "../../../api/functions";

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
                "capsData": action.capsData,
                "pointNames": action.pointNames
            }
        }
        default: return state;
    }
}

const renderData = (pointNames, capsData) =>{

    const headers = {};
    const data = {};

    for(let i = 0; i < pointNames.length; i++){

        const p = pointNames[i];
        if(p.id === 0) continue;

        headers[p.name] = p.name;
        const totalCaps = capsData[p.id] ?? 0;

        data[p.name] = {"value": totalCaps, "displayValue": Functions.ignore0(totalCaps)};

    }


    return <InteractiveTable width={2} headers={headers} data={[data]}/>
}

const PlayerMatchDomination = ({matchId, playerId, playerData, mapId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "capsData": {},
        "pointNames": []
    });

    useEffect(() =>{

        const controller = new AbortController();


        const loadData = async () =>{

            const req = await fetch("/api/match", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "single-player-dom", 
                    "matchId": matchId, 
                    "playerId": playerId,
                    "mapId": mapId
                })
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error})
            }else{
                dispatch({"type": "loaded", "capsData": res.caps, "pointNames": res.pointNames});
            }
        }


        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId, playerId]);

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Domination Caps" text={state.error}/>

    return <div>
        <div className="default-header">Domination Caps</div>
        {renderData(state.pointNames, state.capsData)}
    </div>
}

export default PlayerMatchDomination;