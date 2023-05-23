import Graph from '../../Graph';
import { useEffect, useReducer } from 'react';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';
import InteractiveTable from '../../InteractiveTable';


const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "graphData": action.graphData,
                "graphText": action.graphText,
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

const PlayerMatchPing = ({matchId, playerId}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "graphData": [],
        "graphText": [],
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

                if(res.error !== undefined){
                    dispatch({"type": "error", "errorMessage": res.error});
                }else{
                    dispatch({"type": "loaded", "graphData": res.graphData, "graphText": res.graphText, "basicInfo": res.basicInfo})
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
    },[matchId, playerId]);


    if(state.bLoading) return <Loading/>;
    if(state.error !== null) return <ErrorMessage title="Ping Summary" text={state.error}/>

    return <div>
        <div className="default-header">Ping Summary</div>
        {renderTable(state.basicInfo)}
        <Graph title="Ping Over Time" data={state.graphData} text={state.graphText} minValue={0} />
    </div>
}

export default PlayerMatchPing;
