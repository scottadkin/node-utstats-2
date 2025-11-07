"use client";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import { useState } from "react";
import { ignore0, toPlaytime } from "../../../../api/generic.mjs";

function renderModeTabs(mode, setMode){

    const tabOptions = [
        {"name": "All Time", "value": "all"},
        {"name": "Gametypes", "value": "gametypes"},
        {"name": "Maps", "value": "maps"}
    ];

    return <Tabs options={tabOptions} selectedValue={mode} changeSelected={(v) => setMode(() => v)}/>
}

function renderCatTabs(cat, setCat){

    const tabOptions = [
        {"name": "General", "value": "general"},
        {"name": "Match Records & Sprees", "value": "best"},
        {"name": "End Reasons", "value": "end"}
    ];

    return <Tabs options={tabOptions} selectedValue={cat} changeSelected={(v) => setCat(() => v)}/>
}

function renderPowerupTabs(powerupNames, selectedPowerup, setSelectedPowerup){

    const tabOptions = [];

    for(let i = 0; i < powerupNames.length; i++){

        const p = powerupNames[i];

        if(i === 0 && selectedPowerup === null){
            setSelectedPowerup(() => p);
        }

        tabOptions.push({"name": p, "value": p});
    }

    return <Tabs options={tabOptions} selectedValue={selectedPowerup} changeSelected={(v) =>{
        setSelectedPowerup(() => v);
    }}/>;
}

function renderData(mode, selectedPowerup, data, cat){


    const generalHeaders = {
        "matches": "Total Matches",
        "used": "Times Used",
        "kills": "Total Kills",
        "carryTime": {"title": "Carry Time", "detailedTitle": "Powerup Carry Time", "display": `Total time the player has held this item`},
        "carrierKills": {
            "title": "Carrier Kills", 
            "detailedTitle": "Powerup Carrier Kills", 
            "display": "Kills on enemies that were carrying this item when you killed them."
        }
    };

    const bestHeaders = {
        "mostUses": "Most Uses(Match)",
        "bestCarryTime": "Most Carry Time",
        "bestKills": "Most Kills(Match)",
        "bestSpree": "Best Spree",
        "bestCarrier": "Most Carrier Kills(Match)",
        "bestCarrierSpree": "Most Carrier Kills(Life)"
    };

    const endHeaders = {
        "deaths": "By Deaths",
        "suicides": "By Suicides",
        "timeouts": "By Item Expire",
        "matchEnd": "By Match Finished"
    };

    let headers = {};

    let width = 1;

    if(cat === "general"){

        headers = generalHeaders;

    }else if(cat === "best"){

        headers = bestHeaders;

    }else if(cat === "end"){

        headers = endHeaders;
        width = 4;
    }

    if(mode !== "all"){
        headers = Object.assign({"name": "Name"}, headers);
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(mode === "all" && (d.gametype_id !== 0 || d.map_id !== 0)) continue;
        if(mode === "gametypes" && (d.gametype_id === 0 || d.map_id !== 0)) continue;
        if(mode === "maps" && (d.gametype_id !== 0 || d.map_id === 0)) continue;
        if(d.powerupName !== selectedPowerup) continue;

        let currentRow = {};

        if(cat === "general"){
            currentRow = {
                "matches": {"value": d.total_matches},
                "used": {"value": d.times_used, "displayValue": ignore0(d.times_used)},
                "kills": {"value": d.total_kills, "displayValue": ignore0(d.total_kills)},
                "carryTime": {"value": d.carry_time, "displayValue": toPlaytime(d.carry_time), "className": "date"},
                "carrierKills": {"value": d.total_carrier_kills, "displayValue": ignore0(d.total_carrier_kills)}
            };
        }

 
        if(cat === "best"){

            currentRow = {
                "mostUses": {"value": d.times_used_best, "displayValue": ignore0(d.times_used_best)},
                "bestCarryTime": {"value": d.carry_time_best, "displayValue": toPlaytime(d.carry_time_best), "className": "date"},
                "bestKills": {"value": d.best_kills, "displayValue": ignore0(d.best_kills)},
                "bestSpree": {"value": d.best_kills_single_use, "displayValue": ignore0(d.best_kills_single_use)},
                "bestCarrier": {"value": d.carrier_kills_best, "displayValue": ignore0(d.carrier_kills_best)},
                "bestCarrierSpree": {"value": d.carrier_kills_single_life, "displayValue": ignore0(d.carrier_kills_single_life)}
            };
        }

        if(cat === "end"){

           currentRow = {
                "deaths": {"value": d.end_deaths, "displayValue": ignore0(d.end_deaths)},
                "suicides": {"value": d.end_suicides, "displayValue": ignore0(d.end_suicides)},
                "timeouts": {"value": d.end_timeouts, "displayValue": ignore0(d.end_timeouts)},
                "matchEnd": {"value": d.end_match_end, "displayValue": ignore0(d.end_match_end)},
            };
        }

        if(mode !== "all"){

            let name = "";
            
            if(mode === "gametypes") name = d?.gametypeName ?? "Not Found";
            if(mode === "maps") name = d?.mapName ?? "Not Found";

            currentRow = Object.assign(currentRow, {"name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"}});
        }

        rows.push(currentRow);
    }


    return <InteractiveTable width={width} headers={headers} data={rows}/>;
}

export default function PlayerPowerupSummary({data}){

    const [selectedPowerup, setSelectedPowerup] = useState(null);
    const [mode, setMode] = useState("all");
    const [cat, setCat] = useState("general");

    if(data.length === 0) return null;

    let gametypeNames = new Set();
    let mapNames = new Set();
    let powerupNames = new Set();

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        powerupNames.add(d.powerupName);
        if(d.gametype_id !== 0) gametypeNames.add(d.gametypeName);
        if(d.map_id !== 0) mapNames.add(d.mapName);
    }

    gametypeNames = [...gametypeNames];
    mapNames = [...mapNames];
    powerupNames = [...powerupNames];


    return <>
        <div className="default-header">Powerup Summary</div>
        {renderModeTabs(mode, setMode)}
        {renderCatTabs(cat, setCat)}
        {renderPowerupTabs(powerupNames, selectedPowerup, setSelectedPowerup)}
        {renderData(mode, selectedPowerup, data, cat)}
    </>
}