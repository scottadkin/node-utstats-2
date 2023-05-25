import { useReducer, useEffect } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import { toPlaytime, convertTimestamp, ignore0 } from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){

        case "error": {
            return {
                ...state,
                "error": action.errorMessage,
                "bLoading": false     
            }
        }
        case "loaded": {
            return {
                ...state,
                "error": null,
                "bLoading": false,
                "data": action.data
            }
        }
    }

    return state;
}

const renderData = (data) =>{

    if(data === null) return null;

    const headers = {
        "name": "Map",
        "first": "First",
        "last": "Last",
        "matches": "Matches",
        "wins": "Wins",
        "winRate": "Win Rate",
        "playtime": "Playtime",
        "spec": "Spectime"
    };

    const tableData = data.map((d) =>{

        return {
            "name": {
                "value": d.mapName.toLowerCase(), 
                "displayValue": d.mapName,
                "className": "text-left"
            },
            "first": {
                "value": d.first,
                "displayValue": convertTimestamp(d.first, true, true)
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last, true, true)
            },
            "matches": {
                "value": d.matches,
            },
            "wins": {
                "value": ignore0(d.wins)
            },
            "winRate": {
                "value": d.winrate,
                "displayValue": `${d.winrate.toFixed(2)}%`
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
            },
            "spec": {
                "value": d.spec_playtime,
                "displayValue": toPlaytime(d.spec_playtime),
                "className": "playtime"
            }
        }
    });

    return <InteractiveTable width={1} headers={headers} data={tableData} defaultOrder={"name"}/>
}

const PlayerMapStats = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "data": null
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () => {

            try{

                const req = await fetch(`/api/player/?mode=map-stats&playerId=${playerId}`, {
                    "signal": controller.signal,
                    "method": "GET"
                });

                const res = await req.json();

                if(res.error !== undefined){

                    dispatch({"type": "error", "errorMessage": res.error});
                    return;
                }

                dispatch({"type": "loaded", "data": res.data});

                console.log(res);

            }catch(err){

                if(err.name === "AbortError") return;
                dispatch({"type": "error", "errorMessage": err.toString()});
                console.trace(err);
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [playerId]);


    if(state.error !== null) return <ErrorMessage title="Map Stats" text={state.error}/>

    return <div>
        <div className="default-header">Map Stats</div>
        <Loading value={!state.bLoading}/>
        {renderData(state.data)}
    </div>
}

export default PlayerMapStats;