"use client"
import {useState} from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import { ignore0, toPlaytime } from "../../../../api/generic.mjs";

function renderGeneral(selectedTab, data, recordType){

    if(selectedTab !== 0) return null;

    let headers = {   
        "grabs": "Grab",
        "pickups": "Pickup",
        "drops": "Dropped",
        "caps":"Capture",
        "soloCaps":"Solo Capture",
        "assists":"Assist",
        "covers":"Cover",
        "seals":"Seal",
        "kills":"Kill",
        "suicides": "Suicides",
        "return":"Return",
        "save":"Close Save"
    };

    if(selectedTab > 2){
        delete headers.suicides;
    }

    if(recordType !== 0){
        headers = Object.assign({"gametype": "Gametype"}, headers);
    }

    const rows = [];

    
    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let name = d.gametypeName;

        if(recordType === 0){

            if(d.gametype_id !== 0 || d.map_id !== 0) continue;
           
        }else if(recordType === 1 || recordType === 3 || recordType === 4){

            if(d.gametype_id === 0 || d.map_id !== 0) continue;

        }else if(recordType === 2){

            if(d.gametype_id !== 0 || d.map_id === 0) continue;
            name = d.mapName;

        }
        
        rows.push({
            "gametype": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "grabs": {"value": d.flag_taken, "displayValue": ignore0(d.flag_taken)},
            "pickups": {"value": d.flag_pickup, "displayValue": ignore0(d.flag_pickup)},
            "drops": {"value": d.flag_dropped, "displayValue": ignore0(d.flag_dropped)},
            "caps": {"value": d.flag_capture, "displayValue": ignore0(d.flag_capture)},
            "soloCaps": {"value": d.flag_solo_capture, "displayValue": ignore0(d.flag_solo_capture)},
            "assists": {"value": d.flag_assist, "displayValue": ignore0(d.flag_assist)},
            "covers": {"value": d.flag_cover, "displayValue": ignore0(d.flag_cover)},
            "seals": {"value": d.flag_seal, "displayValue": ignore0(d.flag_seal)},
            "kills": {"value": d.flag_kill, "displayValue": ignore0(d.flag_kill)},
            "suicides": {"value": d.flag_suicide, "displayValue": ignore0(d.flag_suicide)},
            "return": {"value": d.flag_return, "displayValue": ignore0(d.flag_return)},
            "save": {"value": d.flag_return_save, "displayValue": ignore0(d.flag_return_save)}
        });        
    }

    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

function renderCovers(selectedTab, data, recordType){

    if(selectedTab !== 1) return null;

    let headers = {   
        "cover": "Cover",
        "multi": {"title": "Multi Cover", "detailedTitle": "Flag Multi Cover", "content": "Player covered the flag carrier 3 times when the flag was taken."},
        "spree": {"title": "Cover Spree", "detailedTitle": "Flag Cover Spree", "content": "Player covered the flag carrier 4 or more times when the flag was taken."},
        "bestCover": {"title": "Best Cover", "detailedTitle": "Best Single Cover", "content": "The most covers the player got when the flag was taken."},
        "goodCovers": {"title": "Good Covers", "detailedTitle": "Good Flag Covers", "content": "Covers were the flag was captured."},
        "badCovers": {"title": "Failed Covers", "detailedTitle": "Failed Flag Covers", "content": "Covers were the flag was returned."},
        "coversEff": {"title": "Covers Efficiency", "content": "What percentage of covers were successful."},
        "seal": {"title": "Seals", "detailedTitle": "Flag Seals", "content": "Player sealed off their base when their team had the enemy flag."},
        "bestSeal": {"title": "Best Seals", "detailedTitle": "Best Single Flag Seal", "content": "The most seals the player got in a single go."},
        "goodSeal": {"title": "Good Seals", "detailedTitle": "Good Flag Seals", "content": "Flag seals were the player's team capped the flag."},
        "badSeal": {"title": "Failed Seals", "detailedTitle": "Failed Flag Seals", "content": "Flag seals were the flag was returned by the enemy team."},

    };


    if(recordType !== 0){
        headers = Object.assign({"gametype": "Gametype"}, headers);
    }

    const rows = [];
    
    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(recordType === 0 && (d.gametype_id !== 0 || d.map_id !== 0)) continue;

        if(recordType === 1 || recordType === 3 || recordType === 4){
            if(d.gametype_id === 0 || d.map_id !== 0) continue;
        }

        let name = d.gametypeName;

        if(recordType === 2){

            if(d.gametype_id !== 0) continue;
            if(d.map_id === 0) continue;
            name = d.mapName;
        }
        
        let coverEff = 0;

        if(d.flag_cover > 0){

            if(d.flag_cover_pass > 0){
                coverEff = (d.flag_cover_pass / d.flag_cover) * 100;
            }
        }

        const current = {
            "gametype": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "cover": {"value": d.flag_cover, "displayValue": ignore0(d.flag_cover)},
            "multi": {"value": d.flag_cover_multi, "displayValue": ignore0(d.flag_cover_multi)},
            "spree": {"value": d.flag_cover_spree, "displayValue": ignore0(d.flag_cover_spree)},
            "bestCover": {"value": d.best_single_cover, "displayValue": ignore0(d.best_single_cover)},
            "goodCovers": {"value": d.flag_cover_pass, "displayValue": ignore0(d.flag_cover_pass)},
            "badCovers": {"value": d.flag_cover_fail, "displayValue": ignore0(d.flag_cover_fail)},
            "seal": {"value": d.flag_seal, "displayValue": ignore0(d.flag_seal)},
            "bestSeal": {"value": d.best_single_seal, "displayValue": ignore0(d.best_single_seal)},
            "goodSeal": {"value": d.flag_seal_pass, "displayValue": ignore0(d.flag_seal_pass)},
            "badSeal": {"value": d.flag_seal_fail, "displayValue": ignore0(d.flag_seal_fail)},
            "coversEff": {"value": coverEff, "displayValue": `${coverEff.toFixed(2)}%`},
        };

        rows.push(current);
        
    }

    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

function renderCarry(selectedTab, data, recordType){

    if(selectedTab !== 2) return null;

    let headers = {   
        "time": "Carry Time",
        "kills": "Kills With Flag",
        "bestKills": "Most Kills With Flag",
        "good": {"title": "Good Kills With Flag", "content": "Kills the player got while carrying the flag, and the flag was captured."},
        "bad": {"title": "Failed Kills With Flag", "content": "Kills the player got while carrying the flag, but the flag was returned by the enemy team."},
        "eff": {"title": "Kills Efficiency", "content": "What percentage of the player's kills while carrying the flag were the flag was captured."}
    };

    if(recordType !== 0){
        headers = Object.assign({"gametype": "Gametype"}, headers);
    }

    const rows = [];
    
    for(let i = 0; i < data.length; i++){

        const d = data[i];
    
        if(recordType === 0 && (d.gametype_id !== 0 || d.map_id !== 0)) continue;
    
        if(recordType === 1 || recordType === 3 || recordType === 4){

            if(d.gametype_id === 0 || d.map_id !== 0) continue;
        }

        let name = d.gametypeName;

        if(recordType === 2){
            if(d.map_id === 0 || d.gametype_id !== 0) continue;
            name = d.mapName;
        }
        

        let eff = 0;

        if(d.flag_self_cover > 0){

            if(d.flag_self_cover_pass > 0){
                eff = (d.flag_self_cover_pass / d.flag_self_cover) * 100;
            }
        }

        const current = {
            "gametype": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "time": {"value": d.flag_carry_time, "displayValue": toPlaytime(d.flag_carry_time), "className": "playtime"},
            "kills": {"value": d.flag_self_cover, "displayValue": ignore0(d.flag_self_cover)},
            "bestKills": {"value": d.best_single_self_cover, "displayValue": ignore0(d.best_single_self_cover)},
            "bad": {"value": d.flag_self_cover_fail, "displayValue": ignore0(d.flag_self_cover_fail)},
            "good": {"value": d.flag_self_cover_pass, "displayValue": ignore0(d.flag_self_cover_pass)},
            "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`}

        };

        rows.push(current);     
    }

    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

const renderReturns = (selectedTab, data, recordType) =>{

    if(selectedTab !== 3) return null;

    let headers = {   
            "returns": "Returns",
            "returnBase": "Base Returns",
            "returnMid": "Mid Returns",
            "returnEnemy": "Enemy Base Returns",
            "save": "Close Save",
        };


    if(recordType !== 0){
        headers = Object.assign({"gametype": "Gametype"}, headers);
    }

    const rows = [];
    
    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let name = d.gametypeName;

        if(recordType === 0){

            if(d.gametype_id !== 0 || d.map_id !== 0) continue;
            
        }else if(recordType === 1 || recordType === 3 || recordType === 4){

            if(d.gametype_id === 0 || d.map_id !== 0) continue;

        }else if(recordType === 2){

            if(d.gametype_id !== 0 || d.map_id === 0) continue;
            name = d.mapName;
        }

        const current = {
            "gametype": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "returns": {"value": d.flag_return, "displayValue": ignore0(d.flag_return)},
            "returnBase": {"value": d.flag_return_base, "displayValue": ignore0(d.flag_return_base)},
            "returnMid": {"value": d.flag_return_mid, "displayValue": ignore0(d.flag_return_mid)},
            "returnEnemy": {"value": d.flag_return_enemy_base, "displayValue": ignore0(d.flag_return_enemy_base)},
            "save": {"value": d.flag_return_save, "displayValue": ignore0(d.flag_return_save)},
        };

        rows.push(current);
        
    }

    
    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}


function bAnyData(data){

    const keys = ["totals", "best", "bestLife"];

    for(let i = 0; i < keys.length; i++){

        if(data[keys[i]].length > 0) return true;
    }

    return false;
}


function getTabs(){

    const tabs = [
        {"name": "General", "value": 0},
        {"name": "Covers", "value": 1},
        {"name": "Carry Stats", "value": 2},
        {"name": "Returns", "value": 3}
    ];

    return tabs;
}


export default function PlayerCTFSummary({ctfData}){

    const [selectedMode, setSelectedMode] = useState(2);
    const [recordType, setRecordType] = useState(0);

    const options = [
        {"name": "Totals", "value": 0},
        {"name": "Gametype Totals", "value": 1},
        {"name": "Map Totals", "value": 2},
        {"name": "Match Records", "value": 3},
        {"name": "Single Life Records", "value": 4}
    ];

    let data = [];

    if(recordType < 3) data = ctfData.totals;
    if(recordType === 3) data = ctfData.best;
    if(recordType === 4) data = ctfData.bestLife;

    return <div>
        <div className="default-header">Capture The Flag Summary</div>
        <Tabs selectedValue={selectedMode} options={getTabs()} changeSelected={setSelectedMode}/>
        <Tabs options={options} selectedValue={recordType} changeSelected={setRecordType}/> 
    
        
    
        {renderGeneral(selectedMode, data, recordType)}
        {renderCovers(selectedMode, data, recordType)}
        {renderCarry(selectedMode, data, recordType)}
        {renderReturns(selectedMode, data, recordType)}
    </div>
}