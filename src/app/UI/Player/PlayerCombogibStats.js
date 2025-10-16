"use client"
import Link from "next/link";
import { useState } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import { ignore0, toPlaytime } from "../../../../api/generic.mjs";


function bMatchFilter(mode, d){

    if(mode === 0 && (d.gametype_id !== 0 || d.map_id !== 0)) return false;
    if(mode === 1 && (d.gametype_id === 0 || d.map_id !== 0)) return false;
    if(mode === 2 && (d.gametype_id !== 0 || d.map_id === 0)) return false;

    return true;
}

function setName(mode, d){

    let name = "";

    if(mode === 1) name = d.gametypeName;
    if(mode === 2) name = d.mapName;

    return name;
}

function renderTotalKills(mode, cat, data){


    if(cat !== 0) return null;

    let headers = {
        "matches":"Matches",
        "playtime": "Playtime",
        "combos": "Combo",
        "combosEff": {
            "title": "Combo Eff", 
            "detailedTitle": "Combo Kill Efficiency", 
            "display": "The player's efficiency for combogib kills. Kills/(Kills + Deaths)"},
        "insane": "Insane Combo",
        "insaneEff": {
            "title": "Insane Combo Eff", 
            "detailedTitle": "Insane Combo Kill Efficiency", 
            "display": "The player's efficiency for insane combogib kills. Kills/(Kills + Deaths)"
        },
        "ball": "Shockball",
        "ballEff": {
            "title": "Shockball Eff", 
            "detailedTitle": "Shockball Kill Efficiency", 
            "display": "The player's efficiency for shockball kills. Kills/(Kills + Deaths)"
        },
        "instagib": "Instagib",
        "instagibEff": {
            "title": "Instagib Eff", 
            "detailedTitle": "Instagib Kill Efficiency", 
            "display": "The player's efficiency for instagib kills. Kills/(Kills + Deaths)"
        }
    };

    if(mode !== 0) headers = Object.assign({"name": "Name"}, headers);

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(!bMatchFilter(mode, d)) continue;
        const name = setName(mode, d);

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "matches": {"value": d.total_matches, "displayValue": d.total_matches},
            "playtime": {"value": d.playtime, "displayValue": toPlaytime(d.playtime), "className": "playtime"},
            "combos": {"value": d.combo_kills, "displayValue": ignore0(d.combo_kills)},
            "combosEff": {"value": d.combo_efficiency, "displayValue": `${d.combo_efficiency.toFixed(2)}%`},
            "insane": {"value": d.insane_kills, "displayValue": ignore0(d.insane_kills)},
            "insaneEff": {"value": d.insane_efficiency, "displayValue": `${d.insane_efficiency.toFixed(2)}%`},
            "ball": {"value": d.shockball_kills, "displayValue": ignore0(d.shockball_kills)},
            "ballEff": {"value": d.shockball_efficiency, "displayValue": `${d.shockball_efficiency.toFixed(2)}%`},
            "instagib": {"value": d.primary_kills, "displayValue": ignore0(d.primary_kills)},
            "instagibEff": {"value": d.primary_efficiency, "displayValue": `${d.primary_efficiency.toFixed(2)}%`},
        });
    }


    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

function renderMatchRecords(mode, cat, data){

    if(cat !== 1) return;
    let headers = {
        "combo": "Combo Kills",
        "insane": "Insane Combo Kills",
        "ball": "Shockball Kills",
        "instagib": "Instagib Kills",
    };

    if(mode !== 0) headers = Object.assign({"name": "Name"}, headers);

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(!bMatchFilter(mode, d)) continue;

        const name = setName(mode, d);
        

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "combo": {
                "value": d.max_combo_kills, 
                "displayValue": <Link href={`/pmatch/${d.max_combo_kills_match_id}/?player=${d.player_id}`}>
                    {ignore0(d.max_combo_kills)}
                </Link>
            },
            "insane": {
                "value": d.max_insane_kills, 
                "displayValue": <Link href={`/pmatch/${d.max_insane_kills_match_id}/?player=${d.player_id}`}>{ignore0(d.max_insane_kills)}</Link>
            },
            "ball": {
                "value": d.max_shockball_kills, 
                "displayValue": <Link href={`/pmatch/${d.max_shockball_kills_match_id}/?player=${d.player_id}`}>{ignore0(d.max_shockball_kills)}</Link>
            },
            "instagib": {
                "value": d.max_primary_kills, 
                "displayValue": <Link href={`/pmatch/${d.max_primary_kills_match_id}/?player=${d.player_id}`}>{ignore0(d.max_primary_kills)},</Link>
            }
        });
    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>

}

function renderBestSprees(mode, cat, data){

    if(cat !== 2) return null;

    let headers = {
        "combo": "Best Combo Spree",
        "insane": "Best Insane Combo Spree",
        "ball": "Best Shockball Spree",
        "primary": "Best Instagib Spree"
    };

    if(mode !== 0) headers = Object.assign({"name": "Name"}, headers);


    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(!bMatchFilter(mode, d)) continue;
        const name = setName(mode, d);

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "combo": {
                "value": d.best_combo_spree, 
                "displayValue": <Link href={`/pmatch/${d.best_combo_spree_match_id}?player=${d.player_id}`}>
                    {ignore0(d.best_combo_spree)}
                </Link>
            },
            "insane": {
                "value": d.best_insane_spree, 
                "displayValue": <Link href={`/pmatch/${d.best_insane_spree_match_id}?player=${d.player_id}`}>
                    {ignore0(d.best_insane_spree)}
                </Link>
            },
            "ball": {
                "value": d.best_shockball_spree, 
                "displayValue": <Link href={`/pmatch/${d.best_shockball_spree_match_id}?player=${d.player_id}`}>
                    {ignore0(d.best_shockball_spree)}
                </Link>
            },
            "primary": {
                "value": d.best_primary_spree, 
                "displayValue": <Link href={`/pmatch/${d.best_primary_spree_match_id}?player=${d.player_id}`}>
                    {ignore0(d.best_primary_spree)}
                </Link>
            }
        });
    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

function renderKPM(mode, cat, data){
    
    if(cat !== 4) return null;

    let headers = {
        "combo": "Combo Kills" ,
        "insane": "Insane Combo Kills",
        "ball": "Shockball Kills",
        "instagib": "Instagib Kills"
    };

    if(mode !== 0) headers = Object.assign({"name": "Name"}, headers); 

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(!bMatchFilter(mode, d)) continue;

        const name = setName(mode, d);

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "combo": {"value": d.combo_kpm, "displayValue": d.combo_kpm.toFixed(2)},
            "insane": {"value": d.insane_kpm, "displayValue": d.insane_kpm.toFixed(2)},
            "ball": {"value": d.shockball_kpm, "displayValue": d.shockball_kpm.toFixed(2)},
            "instagib": {"value": d.primary_kpm, "displayValue": d.primary_kpm.toFixed(2)},
        });
    }


    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

function renderBestSingleEvent(mode, cat, data){

    if(cat !== 3) return null;

    let headers = {
        "combo": {
            "title": "Best Single Combo", 
            "detailedTitle": "Most Kills With A Single Combo", 
            "display": "The most kills the player for with a single combo explosion."
        },
        "insane": {
            "title": "Best Single Insane Combo", 
            "detailedTitle": "Most Kills With A Single Insane Combo", 
            "display": "The most kills the player for with a single Insane combo explosion."
        },
        "ball": {
            "title": "Best Single Shockball", 
            "detailedTitle": "Most Kills With A Single Shockball", 
            "display": "The most kills the player for with a single shockball projectile."
        }
    };

    if(mode !== 0) headers = Object.assign({"name": "Name"}, headers);

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(!bMatchFilter(mode, d)) continue;
        const name = setName(mode, d);
        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "combo": {
                "value": d.best_single_combo, 
                "displayValue": <Link href={`/pmatch/${d.player_id}?player=${d.best_single_combo_match_id}`}>{ignore0(d.best_single_combo)}</Link>
            },
            "insane": {
                "value": d.best_single_insane, 
                "displayValue": <Link href={`/pmatch/${d.player_id}?player=${d.best_single_insane_match_id}`}>{ignore0(d.best_single_insane)}</Link>
            },
            "ball": {
                "value": d.best_single_shockball, 
                "displayValue": <Link href={`/pmatch/${d.player_id}?player=${d.best_single_shockball_match_id}`}>{ignore0(d.best_single_shockball)}</Link>
            }
        });
    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>

}

export default function PlayerCombogibStats({data}){

    
    if(data.length === 0) return null;


    const [mode, setMode] = useState(0);
    const [cat, setCat] = useState(0);

    const modeOptions = [
        {"name": "All Time", "value": 0},
        {"name": "Gametype Totals", "value": 1},
        {"name": "Map Totals", "value": 2},
    ];

    const catOptions = [
        {"name": "Total Kills", "value": 0},
        {"name": "Match Kill Records", "value": 1},
        {"name": "Best Kill Type Sprees", "value": 2},
        {"name": "Best Single Kill Event", "value": 3},
        {"name": "Kills Per Minute", "value": 4},
    ];

    return <>
        <div className="default-header">Combogib Summary</div>
        <Tabs options={modeOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        <Tabs options={catOptions} selectedValue={cat} changeSelected={(a) => setCat(() => a)}/>
        {renderTotalKills(mode, cat, data)}
        {renderMatchRecords(mode, cat, data)}
        {renderBestSprees(mode, cat, data)}
        {renderBestSingleEvent(mode, cat, data)}
        {renderKPM(mode, cat, data)}
    </>
}
