import { useReducer, useEffect } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import { toPlaytime, convertTimestamp, ignore0 } from "../../api/generic.mjs";
import Tabs from "../Tabs";

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
        case "changeTab": {

            return {
                ...state,
                "selectedTab": action.newTab
            }
        }
    }

    return state;
}


const createGeneralData = (state) =>{

    const headers = {
        "name": "Map",
        "first": "First",
        "last": "Last",
        "matches": "Matches",
        "wins": "Wins",
        //"winRate": "Win Rate",
        "spec": "Spectime",
        "playtime": "Playtime"
        
    };

    const data = state.data.map((d) =>{
        return {
            "name": {
                "value": d.mapName.toLowerCase(), 
                "displayValue": d.mapName,
                "className": "text-left"
            },
            "first": {
                "value": d.first,
                "displayValue": convertTimestamp(d.first, true, true),
                "className": "playtime"
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last, true, true),
                "className": "playtime"
            },
            "matches": {
                "value": d.matches,
            },
            "wins": {
                "value": ignore0(d.wins)
            },/*
            "winRate": {
                "value": d.winrate,
                "displayValue": `${d.winrate.toFixed(2)}%`
            },*/
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

    return {"tableData": data, "headers": headers};
}

const renderData = (state, dispatch) =>{

    if(state.data === null) return null;

    

    let tableData = [];
    let headers = {};

    if(state.selectedTab === 0){
        ({tableData, headers} = createGeneralData(state));
    }

    return <>
        <Tabs options={
                [
                    {"value": 0, "name": "General"},
                    {"value": 1, "name": "Win Rates"}
                ]
            }
            selectedValue={state.selectedTab}
            changeSelected={(value) => { dispatch({"type": "changeTab", "newTab": value})}}
        
        />
        <InteractiveTable width={1} headers={headers} data={tableData} defaultOrder={"name"}/>
    </>;
}

const PlayerMapStats = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "data": null,
        "selectedTab": 0
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
        {renderData(state, dispatch)}
    </div>
}

export default PlayerMapStats;