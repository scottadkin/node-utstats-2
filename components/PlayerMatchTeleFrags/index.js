import { useReducer, useEffect } from "react";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import Loading from "../Loading";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";


const renderTabs = (state, dispatch) =>{

    const options = [
        {"name": "General", "value": 0},
        {"name": "Kills", "value": 1},
    ];

    return <Tabs selectedValue={state.selectedTab} options={options} changeSelected={(newTab) => {
        dispatch({"type": "changeTab", "tab": newTab});
    }} />
}


const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "bLoading": false
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

const renderGeneral = (state, stats) =>{

    const headers = {
        "kills": "Telefrag Kills",
        "deaths": "Telefrag Deaths",
        "bestMulti": "Best Telefrag Multi Kill",
        "bestSpree": "Best Telefrag Spree",
        "discKills": "Disc Kills",
        "discDeaths": "Disc Deaths",
        "discBestMulti": "Best Disc Multi Kill",
        "discBestSpree": "Best Disc Spree",

    };

    console.log(stats);

    const data = {
        "kills": {
            "value": stats.telefrag_kills, 
            "displayValue": Functions.ignore0(stats.telefrag_kills)
        },
        "deaths": {
            "value": stats.telefrag_deaths, 
            "displayValue": Functions.ignore0(stats.telefrag_deaths)
        },
        "bestMulti": {
            "value": stats.telefrag_best_multi, 
            "displayValue": Functions.ignore0(stats.telefrag_best_multi)
        },
        "bestSpree": {
            "value": stats.telefrag_best_spree, 
            "displayValue": Functions.ignore0(stats.telefrag_best_spree)
        },
        "discKills": {
            "value": stats.tele_disc_kills, 
            "displayValue": Functions.ignore0(stats.tele_disc_kills)
        },
        "discDeaths": {
            "value": stats.tele_disc_deaths, 
            "displayValue": Functions.ignore0(stats.tele_disc_deaths)
        },
        "discBestMulti": {
            "value": stats.tele_disc_best_multi, 
            "displayValue": Functions.ignore0(stats.tele_disc_best_multi)
        },
        "discBestSpree": {
            "value": stats.tele_disc_best_spree, 
            "displayValue": Functions.ignore0(stats.tele_disc_best_spree)
        },
    };



    return <InteractiveTable width={1} headers={headers} data={[data]}/>
}

const renderKills = (state) =>{

    if(state.bLoading) return <Loading />;
}

const PlayerMatchTeleFrags = ({data}) =>{

    const [state, dispatch] = useReducer(reducer, {"bLoading": true, "selectedTab": 0});

    if(data.length === 0) return null;//<ErrorMessage title="Telefrags Summary" text="There is no data to display."/>

    return <div>
        <div className="default-header">Telefrags Summary</div>
        {renderTabs(state, dispatch)}
        {renderGeneral(state, data[0])}
        {renderKills(state)}
    </div>
}

export default PlayerMatchTeleFrags;