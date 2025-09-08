"use client"
import { useReducer } from "react";
import Tabs from "../Tabs/";
import { removeUnr } from "../../../../api/generic.mjs";


function reducer(state, action){

    switch(action.type){
        case "set-server": {
            return {
                ...state,
                "selectedServer": action.value
            }
        }
        case "set-gametype": {
            return {
                ...state,
                "selectedGametype": action.value
            }
        }
        case "set-map": {
            return {
                ...state,
                "selectedMap": action.value
            }
        }
        case "set-per-page": {
            return {
                ...state,
                "perPage": parseInt(action.value)
            }
        }
    }

    return state;
}


function getPerPageOptions(){

    return [
        <option key="0" value="5">5</option>,
        <option key="1"value="10">10</option>,
        <option key="2" value="25">25</option>,
        <option key="3" value="50">50</option>,
        <option key="4" value="75">75</option>,
        <option key="5" value="100">100</option>,
    ];
}

export default function SearchForm({serverNames, gametypeNames, mapNames}){

    const [state, dispatch] = useReducer(reducer, {
        "selectedServer": 0,
        "selectedGametype": 0,
        "selectedMap": 0,
        "displayMode": "",
        "perPage": 5,
        "images": {},
        "totalMatches": 0,
        "data": []
    });

    const tabOptions = [
        {"value": "0", "displayValue": "Default View"},
        {"value": "1", "displayValue": "Table View"},
    ];

    const serverOptions = [
        <option key="0" value="0">Any</option>
    ];

    for(const [id, name] of Object.entries(serverNames)){
        serverOptions.push(<option key={id} value={id}>{name}</option>);
    }

    const gametypeOptions = [
        <option key="0" value="0">Any</option>
    ];

    for(const [id, name] of Object.entries(gametypeNames)){
        gametypeOptions.push(<option key={id} value={id}>{name}</option>);
    }

    const mapOptions = [
        <option key="0" value="0">Any</option>
    ];

    for(const [id, name] of Object.entries(mapNames)){
        mapOptions.push(<option key={id} value={id}>{removeUnr(name)}</option>);
    }
   
    
    return <div className="form m-bottom-25">
        <div className="form-row">
            <label htmlFor="server">Server</label>
            <select className="default-select" value={state.selectedServer} onChange={(e) =>{
                dispatch({"type": "set-server", "value": e.target.value});
            }}>
               {serverOptions}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="gametype">Gametype</label>
            <select className="default-select" value={state.selectedGametype} onChange={(e) =>{
                dispatch({"type": "set-gametype", "value": e.target.value});
            }}>
               {gametypeOptions}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="map">Map</label>
            <select className="default-select" value={state.selectedMap} onChange={(e) =>{
                dispatch({"type": "set-map", "value": e.target.value});
            }}>
               {mapOptions}
            </select>
        </div>

        <div className="form-row">
            <label htmlFor="map">Results Per Page</label>
            <select className="default-select" value={state.perPage} onChange={(e) =>{
                dispatch({"type": "set-per-page", "value": e.target.value});
            }}>
               {getPerPageOptions()}
            </select>
        </div>
    </div>

    /*return <div key="s-f" className="form m-bottom-25">
        <DropDown 
            dName="Results Per Page" 
            fName="perPage" 
            originalValue={state.perPage.toString()} 
            data={getPerPageData()} 
            changeSelected={changeSelected}
        />
        <DropDown 
            dName="Display Style" 
            fName="displayMode" 
            originalValue={state.displayMode.toString()} 
            data={getDisplayModeData()} 
            changeSelected={changeSelected}
        />
    </div>;*/
}