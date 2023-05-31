import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import { convertTimestamp, toPlaytime, ignore0 } from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){

        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data
            }
        }
    }

    return state;
}

const renderData = (state) =>{

    if(state.data === null) return null;

    const headers = {
        "name": "Name",
        "last": "Last Played",
        "matches": "Matches",
        "wins": "Wins",
        "playtime": "Playtime",
        "spec": "Spectime",
        "acc": "Last Accuracy",
        "kills": "Kills",
        "deaths": "Deaths",
        "eff": "Efficiency"
    };

    const tableData = state.data.map((d) =>{
        return {
            "name": {
                "value": d.gametypeName.toLowerCase(), 
                "displayValue": d.gametypeName,
                "className": "text-left"
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last, true)
            },
            "matches": {
                "value": d.matches
            },
            "wins": {
                "value": d.wins,
                "displayValue": ignore0(d.wins),
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
            },
            "acc": {
                "value": d.accuracy,
                "displayValue": `${d.accuracy.toFixed(2)}%`
            },
            "kills": {
                "value": d.kills
            },
            "deaths": {
                "value": d.deaths
            },
            "eff": {
                "value": d.efficiency,
                "displayValue": `${d.efficiency.toFixed(2)}%`
            }
        }
    });


    return <InteractiveTable headers={headers} data={tableData} width={1} defaultOrder={"name"}/>
}

const PlayerGametypeStats = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "data": null
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch(`/api/player/?mode=gametype-stats&playerId=${playerId}`, {
                    "signal": controller.signal
                });

                const res = await req.json();

                if(res.error !== undefined){
                    dispatch({"type": "error", "errorMessage": res.error.toString()})
                    return;
                }

                dispatch({"type": "loaded", "data": res.data})
                console.log(res);

            }catch(err){

                if(err.name === "AbortError") return;
                console.trace(err);
            }
        }

        loadData();

        return () =>{

            controller.abort();
        }

    }, [playerId]);

    return <>
        <div className="default-header">Gametypes Summary</div>
        <ErrorMessage title="Gametypes Summary" text={state.error}/>
        <Loading value={!state.bLoading} />
        {renderData(state)}
    </>
}


export default PlayerGametypeStats;