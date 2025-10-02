"use client"
import Loading from "../Loading";
import ErrorMessage from "../../../../components/ErrorMessage";
import TablePagination from "../../../../components/TablePagination";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import TabsHeader from "../../../../components/TabsHeader";
import { useReducer, useEffect } from "react";
import { toPlaytime, getPlayer, getOrdinal } from "../../../../api/generic.mjs";
import { BasicTable } from "../Tables";

function reducer(state, action){

    switch(action.type){
        case "set-data-type": {

            return {...state,
                "dataType": action.value,
                "page": 0
            }
        }
        case "set-page": {
            return {
                ...state,
                "page": action.value
            }
        }
        case "set-error": {
            return {
                ...state,
                "error": action.value
            }
        }
        case "set-loaded": {
            return {
                ...state,
                "loaded": action.value
            }
        }
        case "set-data": {
            return {
                ...state,
                "data": action.data,
                "totalResults": action.totalResults,
                "players": action.players,
                "loaded": true,
                "error": null
            }
        }
    }
    return {...state};
}

const titles = {
    "combo_kills": "Most Combos Kills in a match",
    "insane_kills": "Most Insane Combo Kills in a match",
    "shockball_kills": "Most ShockBall Kills in a match",
    "primary_kills": "Most Instagib Kills in a match",
    "best_single_combo": "Most Kills with one Combo",
    "best_single_insane": "Most Kills with one Insane Combo",
    "best_single_shockball": "Most Kills with one Shock Ball",
    "best_combo_spree": "Most Combos Kills in a Life",
    "best_insane_spree": "Most Insane Combos Kills in a Life",
    "best_shockball_spree": "Most Shockball Kills in a Life",
    "best_primary_spree": "Most Instagib Kills in a Life",
};


const tabTitles = {
    "combo_kills": "Combos Kills",
    "insane_kills": "Insane Combo Kills",
    "shockball_kills": "ShockBall Kills",
    "primary_kills": "Instagib Kills",
    "best_single_combo": "Best Combo",
    "best_single_insane": "Best Insane Combo",
    "best_single_shockball": "Best Shock Ball",
    "best_combo_spree": "Best Combo Spree",
    "best_insane_spree": "Best Insane Combo Spree",
    "best_shockball_spree": "Best ShockBall Spree",
    "best_primary_spree": "Best Instagib Spree",
};

function getTitle(type){

    if(type === "*") return tabTitles;

    if(titles[type] === undefined) return "Title doesn't exist!";

    return titles[type];
}

function renderTabs(state, dispatch){

    const titles = getTitle("*");

    const tabs = [];
    
    const tabsRow1 = [];
    const tabsRow2 = [];
    const tabsRow3 = [];

    const tabRow1Types = ["combo_kills", "insane_kills","shockball_kills","primary_kills"];
    const tabRow2Types = ["best_single_combo", "best_single_insane", "best_single_shockball"];
    const tabRow3Types = ["best_combo_spree","best_insane_spree","best_ball_spree","best_primary_spree",];

    for(const [key, value] of Object.entries(titles)){

        const elem = <div key={key} className={`tab ${(state.dataType === key) ? "tab-selected" : ""}`} onClick={(() =>{
            dispatch({"type": "set-data-type", "value": key});
        })}>
            {value}
        </div>

        if(tabRow1Types.indexOf(key) !== -1){
            tabsRow1.push(elem);
        }

        if(tabRow2Types.indexOf(key) !== -1){
            tabsRow2.push(elem);
        }

        if(tabRow3Types.indexOf(key) !== -1){
            tabsRow3.push(elem);
        }    
    }

    return <div>
        <TabsHeader>Kill Types</TabsHeader>
        <div className="tabs">
            {tabsRow1}
        </div>
        <TabsHeader>Best Single Kill Events</TabsHeader>
        <div className="tabs">
            {tabsRow2}
        </div>
        <TabsHeader>Most Kill Types in a Single Life</TabsHeader>
        <div className="tabs">
            {tabsRow3}
        </div>
    </div>
}

function renderTable(state, dispatch){

    if(state.data === null) return null;

    const rows = [];

    for(let i = 0; i < state.data.length; i++){

        const d = state.data[i];

        const place = (state.page * state.perPage) + i + 1;

        const player = getPlayer(state.players, d.player_id, true);

        rows.push([
            `${place}${getOrdinal(place)}`, 
            <Link href={`/player/${d.player_id}`}>   
                <CountryFlag country={player.country}/>
                {player.name}        
            </Link>,
   
            toPlaytime(d.playtime),
            d.best_value
        ]);
    }


    const headers = ["", "Player", "Playtime", "Record"];
    const styles = ["place", "text-left", "playtime", null];
    return <div>
        <BasicTable width={4} headers={headers} title={getTitle(state.dataType)} rows={rows} columnStyles={styles}/>
        <TablePagination previous={() =>{

            let page = state.page;
            page--;
            if(page < 0) page = 0;

            dispatch({"type": "set-page", "value": page});

        }} next={() =>{
            dispatch({"type": "set-page", "value": state.page + 1});
        }} width={4} page={state.page + 1}
            perPage={state.perPage} totalResults={state.totalResults}    
        />
    
    </div>
}

async function loadData(dispatch, mapId, page, perPage, dataType){
        

    const req = await fetch("/api/combogib", {
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({
            "mode": "maprecord", 
            "mapId": mapId,
            "page": page,
            "perPage": perPage,
            "dataType": dataType
        })
    });

    const res = await req.json();

    if(res.error !== undefined){
        dispatch({"type": "set-error", "value": res.error});
    }else{
        dispatch({"type": "set-data", "data": res.data, "totalResults": res.totalResults, "players": res.players});
    }

    dispatch({"type": "set-loaded", "value": true});
   // this.setState({"loaded": true});
}

export default function CombogibMapRecords({mapId}){

     const [state, dispatch] = useReducer(reducer, {
        "data": null, 
        "players": null,
        "totalResults": 0,
        "error": null, 
        "loaded": false, 
        "page": 0, 
        "perPage": 5,
        "dataType": "combo_kills",
       // "mapId": id
     });

    useEffect(() =>{

        loadData(dispatch, mapId, state.page, state.perPage, state.dataType);

    }, [mapId, state.page, state.perPage, state.dataType]);

    if(!state.loaded) return <div><Loading /></div>;
    if(state.error !== null){

        if(state.error !== "none"){
            return <ErrorMessage title="Combogib Stats" text={state.error}/>
        }

        return null;
    }



    return <div>
        <div className="default-header">Combogib Player Records</div>
        {renderTabs(state, dispatch)}
        {renderTable(state, dispatch)}
    </div>
}


