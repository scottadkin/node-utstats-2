import CustomGraph from "../../CustomGraph";
import { useEffect, useReducer } from "react";
import Loading from "../../Loading";
import ErrorMessage from "../../ErrorMessage";
import InteractiveTable from "../../InteractiveTable";
import {MMSS, scalePlaytime} from "../../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "graphData": action.graphData,
                "graphLabels": action.graphLabels,
                "basicInfo": action.basicInfo,
                "error": null
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


const renderTable = (basicInfo) =>{

    const headers = {"min": "Minimum", "average": "Average", "max": "Max"};
    const data = {
        "min": {"value": basicInfo.min},
        "average": {"value": basicInfo.average},
        "max": {"value": basicInfo.max},
    };

    return <InteractiveTable width={2} headers={headers} data={[data]}/>;
}

const PlayerMatchPing = ({matchId, playerId, matchStart, bHardcode}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "graphData": [],
        "graphLabels": [],
        "basicInfo": {"min": 0, "average": 0, "max": 0}
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/match", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "player-ping", "playerId": playerId, "matchId": matchId})
                });

                const res = await req.json();


                const newGraphData = [
                    {"name": "Ping", "values": res.graphData[0].data}
                ];


                const graphLabels = res.graphText.map((d) =>{
                    return MMSS(scalePlaytime(d - matchStart, bHardcode));
                });

                if(res.error !== undefined){
                    dispatch({"type": "error", "errorMessage": res.error});
                }else{
                    dispatch({"type": "loaded", "graphData": newGraphData, "graphLabels": graphLabels, "basicInfo": res.basicInfo})
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

    },[matchId, playerId, matchStart, bHardcode]);



    //<Graph title="Ping Over Time" data={state.graphData} text={state.graphText} minValue={0} />
    if(state.bLoading) return <Loading/>;
    if(state.error !== null) return <ErrorMessage title="Ping Summary" text={state.error}/>

    return <div>
        <div className="default-header">Ping Summary</div>
        {renderTable(state.basicInfo)}
        <CustomGraph 
            tabs={[{"name": "Ping", "title": "Player Ping Over Time"}]}
            labels={[state.graphLabels]}
            labelsPrefix={[]}
            data={[state.graphData]}
        />
    </div>
}

export default PlayerMatchPing;
