import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import {useReducer, useEffect} from "react";
import Tabs from "../Tabs";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";


const loadData = async (dispatch, playerId, signal) =>{

    try{

        const req = await fetch("/api/player", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "telefrags", "playerId": playerId})
        });

        const res = await req.json();

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error});
            return;
        }

        dispatch({"type": "loaded", "data": res.data, "mapNames": res.mapNames, "gametypeNames": res.gametypeNames});

    }catch(err){

        if(err.name === "AbortError") return;
        console.trace(err);
    }
}

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data,
                "mapNames": action.mapNames,
                "gametypeNames": action.gametypeNames
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        case "changeTab": {
            return {
                ...state,
                "selectedTab": action.tab
            }
        }
    }

    return state;
}

const renderGametypeTotals = (state) => {

    if(state.bLoading) return null;

    const headers = {
        "gametype": "Gametype",
        "matches": "Matches",
        "playtime": "Playtime",
        "kills": "Kills",
        "deaths": "Deaths",
        "eff": "Efficiency",
        "mostKills": {"title": "Most Kills", "content": "The most amount of kills a player had in a single match."},
        "mostDeaths": {"title": "Most Deaths", "content": "The most amount of deaths a player had in a single match."},
        "bestMulti": {
            "title": "Best Multi Kill", 
            "content": `The player's best multi kill of type ${(state.selectedTab === 0) ? "Telefrag Kill" : "Disc Kill"} in a short amount of time`
        },
        "bestSpree": {"title": "Best Spree", "content": `The most amount of ${(state.selectedTab === 0) ? "Telefrag" : "Disc"} kills in a single life`},
    };

    const tableData = [];

    for(let i = 0; i < state.data.length; i++){

        const data = state.data[i];

        if(data.map_id !== 0) continue;

        const kills = (state.selectedTab === 0) ? data.tele_kills : data.disc_kills;
        const deaths = (state.selectedTab === 0) ? data.tele_deaths : data.disc_deaths;
        const mostKills = (state.selectedTab === 0) ? data.best_tele_kills : data.best_disc_kills;
        const mostDeaths = (state.selectedTab === 0) ? data.worst_tele_deaths : data.worst_disc_deaths;
        const bestMulti = (state.selectedTab === 0) ? data.best_tele_multi : data.best_disc_multi;
        const bestSpree = (state.selectedTab === 0) ? data.best_tele_spree : data.best_disc_spree;

        let eff = 0;

        if(kills > 0){
            if(deaths === 0){
                eff = 100;
            }else{
                eff = (kills / (kills + deaths)) * 100;
            }
        }
    
        tableData.push({
                "gametype": {"value": state.gametypeNames[data.gametype_id] ?? "Not Found"},
                "matches": {"value": data.total_matches},
                "playtime": {"value": data.playtime, "displayValue": Functions.toPlaytime(data.playtime), "className": "playtime"},
                "kills": {"value": kills, "displayValue": Functions.ignore0(kills)},
                "deaths": {"value": deaths, "displayValue": Functions.ignore0(deaths)},
                "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`},
                "mostKills": {"value": mostKills, "displayValue": Functions.ignore0(mostKills)},
                "mostDeaths": {"value": mostDeaths, "displayValue": Functions.ignore0(mostDeaths)},
                "bestMulti": {"value": bestMulti, "displayValue": Functions.ignore0(bestMulti)},
                "bestSpree": {"value": bestSpree, "displayValue": Functions.ignore0(bestSpree)},
            });
    }
    

    return <InteractiveTable width={1} headers={headers} data={tableData}/>

    
}

const PlayerTeleFrags = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "error": null,
        "data": [],
        "gametypeNames": {},
        "mapNames": {},
        "selectedTab": 0
    });


    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, playerId, controller.signal);

        return () =>{
            controller.abort();
        }

    }, [playerId]);


    const options = [
        {"name": "Telefrags", "value": 0},
        {"name": "Disc Kills", "value": 1}
    ];

    if(state.error !== null){

        return <ErrorMessage title="Telefrag Summary" text={state.error}/>
    }

    return <div>
        <div className="default-header">Telefrag Summary</div>
        <Loading value={!state.bLoading}/>
        <Tabs options={options} selectedValue={state.selectedTab} changeSelected={(value) => { dispatch({"type": "changeTab", "tab": value})}}/>
        {renderGametypeTotals(state)}
    </div>
}

export default PlayerTeleFrags;