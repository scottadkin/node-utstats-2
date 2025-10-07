"use client"
import {useReducer} from "react";
import BarChart from "../BarChart";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import MatchWeaponBest from "./MatchWeaponBest";
import Tabs from "../Tabs";
import { ignore0, getPlayer, getTeamColor } from "../../../../api/generic.mjs";
import { getPlayerFromMatchData } from "../../../../api/generic.mjs";

function reducer(state, action){

    switch(action.type){

        case "set-loading":{
            return {
                ...state,
                "bLoading": action.value
            }
        }

        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }


        case "set-individual-mode": {
            return {
                ...state,
                "individualDisplayMode": action.value
            }
        }

        case "set-selected-weapon": {
            return {
                ...state,
                "selectedWeaponId": action.value
            }
        }

        case "set-stats-type":{
            return {
                ...state,
                "selectedStatType": action.value
            }
        }

    }

    return state;
}

function orderByName(a, b){

    a = a.name.value;
    b = b.name.value;

    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

function renderTabs(state, dispatch){

    return <Tabs options={[
        {"name": "Total Damage", "value": -2},
        {"name": "Best Stats", "value": -1},
        {"name": "Individual Weapons", "value": 0},
        {"name": "By Stats Type", "value": -3}
       // {"name": "Bar Charts", "value": 1},
    ]} 
        selectedValue={state.mode}
        changeSelected={(value) =>{
            dispatch({"type": "set-mode", "value": value})
        }}
    />
}

function getMaxStats(weaponStats, weaponId, type){

    let best = null;

    for(let i = 0; i < weaponStats.length; i++){

        const w = weaponStats[i];

        if(w.weapon_id !== parseInt(weaponId)) continue;

        if(best === null){
            best = w;
            continue;
        }

        if(best[type] < w[type]) best = w;

    }

    return best;
}

function renderBest(state, matchId, players, totalTeams, weaponNames, weaponStats){

    if(state.mode !== -1) return null;

    const elems = [];

    for(let i = 0; i < weaponNames.length; i++){

        const {id, name} = weaponNames[i];

        const bestKills = getMaxStats(weaponStats.playerData, id, "kills");
        const bestKillsPlayer = getPlayerFromMatchData(players, bestKills.player_id);

        const bestDamage = getMaxStats(weaponStats.playerData, id, "damage");
        const bestDamagePlayer = getPlayerFromMatchData(players, bestDamage.player_id);

        elems.push(<MatchWeaponBest 
            matchId={matchId}
            key={id}
            name={name} 
            bestKills={
                {
                    "data": bestKills,
                    "player": bestKillsPlayer
                }
            }
            bestDamage={
                {
                    "data": bestDamage,
                    "player": bestDamagePlayer 
                }
            }
            totalTeams={totalTeams}
        />);
    }

    return <div>
        {elems}  
    </div>
}

function renderIndividualTabs(state, dispatch){
   
    if(state.mode !== 0) return null;

    const options = [
        {
            "name": "Tables",
            "value": 0
        },
        {
            "name": "Bar Charts",
            "value": 1
        }
    ];

    return <Tabs options={options} selectedValue={state.individualDisplayMode} changeSelected={(value) =>{
        dispatch({"type": "set-individual-mode", "value": value});
    }}/>
}

function createPlayerTotalStats(data, players){

    const totals = {};

    let totalDamage = {};
    let totalKills = 0;

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(totals[d.player_id] === undefined){

            totals[d.player_id] = {"kills": 0, "damage": 0};
        }

        totals[d.player_id].kills += d.kills;
        totals[d.player_id].damage += d.damage;

        totalKills = d.kills;

        const currentPlayer = getPlayerFromMatchData(players, d.player_id);

        if(totalDamage[currentPlayer.team] === undefined) totalDamage[currentPlayer.team] = 0;
        totalDamage[currentPlayer.team] += d.damage;
    }


    const finalData = [];

    for(const [playerId, playerData] of Object.entries(totals)){

        const currentPlayer = getPlayerFromMatchData(players, playerId);


        finalData.push({
            "playerId": parseInt(playerId),
            "kills": playerData.kills,
            "damage": playerData.damage,
            "percent": (playerData.damage > 0 && totalDamage[currentPlayer.team] > 0) 
                ? 
                playerData.damage / totalDamage[currentPlayer.team] * 100
                : 
                0
        });
    }

    finalData.sort((a, b) =>{

        a = a.damage;
        b = b.damage;
        if(a < b) return 1;
        if(a > b) return -1;
        return 0;
    });


    return finalData;
}

function renderTotalDamage(displayMode, matchId, totalData, players, totalTeams){

    if(displayMode !== -2) return null;

    const headers = {
        "name": "Player",
        "kills": "Kills",
        "damage": "Damage",
        
    };

    if(totalTeams >= 2){
        headers.percent ="% Of Team Damage";
    }

    const data = totalData.map((d) =>{

        const {playerId, kills, damage, percent} = d;

        const player = getPlayerFromMatchData(players, playerId);

        const current = {
            "name": {
                "value": "", 
                "displayValue": <Link href={`/pmatch/${matchId}?player=${player.id}`}><CountryFlag country={player.country}/>{player.name}</Link>,
                "className": `text-left ${getTeamColor(player.team, totalTeams)}`
            },
            "kills": {"value": kills},
            "damage": {"value": damage}
        };

        current.percent = {"value": percent, "displayValue": <>{percent.toFixed(2)}&#37;</>}

        return current;
    });

    return <>
        <InteractiveTable width={2} headers={headers} data={data}/>
    </>
}

function getPlayerStatType(stats, playerId, weaponId, statType){

    playerId = parseInt(playerId);
    weaponId = parseInt(weaponId);

    for(let i = 0; i < stats.length; i++){

        const s = stats[i];

        if(s.player_id !== playerId || s.weapon_id !== weaponId) continue;

        return s[statType];
    }

    return 0;
}

function renderByStatsType(mode, selectedStatType, weaponStats, weaponNames, dispatch, players){

    if(mode !== -3) return null;

    const headers = {
        "player": "Player"
    };

    const rows = [];
    
    for(let i = 0; i < weaponNames.length; i++){

        const w = weaponNames[i];
        headers[`w_${w.id}`] = w.name;
    }

    headers["totals"] = "Total";

    for(let i = 0; i < players.length; i++){

        const p = players[i];
        const playerId = p.player_id;

        if(p.playtime === 0) continue;

        const current = {
            "player": {
                "value": p.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={p.country}/>{p.name}</>,
                "className": `text-left ${getTeamColor(p.team)}`
            }
        };

        let total = 0;

        for(let x = 0; x < weaponNames.length; x++){

            const w = weaponNames[x];

            let cValue = getPlayerStatType(weaponStats.playerData, playerId, w.id, selectedStatType);

            const originalValue = cValue;

            total += cValue;

            if(selectedStatType !== "accuracy" || cValue === 0){
                cValue = ignore0(cValue);
            }else{
                cValue = `${cValue.toFixed(2)}%`;
            }

            current[`w_${w.id}`] = {
                "value": originalValue, 
                "displayValue": cValue,  
            };
        
        }

        if(selectedStatType === "accuracy"){

            total = total.toFixed(2);
        }

        current.totals = {"value": parseFloat(total), "displayValue": (selectedStatType === "accuracy") ? `${total}%` :ignore0(total)};

        rows.push(current);

    }

    return <>
        <Tabs 
            options={[
                {"name": "Kills", "value": "kills"},
                {"name": "Deaths", "value": "deaths"},
                {"name": "Damage", "value": "damage"},
                {"name": "Shots", "value": "shots"},
                {"name": "Hits", "value": "hits"},
                {"name": "Accuracy", "value": "accuracy"},
            ]}
            selectedValue={selectedStatType}
            changeSelected={(value) =>{
                dispatch({"type": "set-stats-type", "value": value});
            }}
        />
        <InteractiveTable data={rows} headers={headers} width={1}/>
    </>
}


function renderSingleTable(state, totalTeams, matchId, playerData, weaponNames, weaponStats){

    if(state.mode !== 0 || state.individualDisplayMode !== 0) return null;
    
    const headers = {
        "name": "Player",
        "shots": "Shots",
        "hits": "Hits",
        "accuracy": "Accuracy",
        "kills": "Kills",
        "bestKills": {"title": "Best Spree", "content": "Most kills with a weapon in a single life."},
        "teamKills": "Team Kills",
        "deaths": "Deaths",  
        "suicides": "Suicides",
        "eff": "Efficiency",
        "damage": "Damage"
    };

    const weaponName = getWeaponName(weaponNames, state.selectedWeaponId);

    const data = [];

    for(let i = 0; i < weaponStats.playerData.length; i++){

        const d = weaponStats.playerData[i];

        if(d.weapon_id != state.selectedWeaponId) continue;

        const player = getPlayerFromMatchData(playerData, d.player_id);

        data.push({
            "name": {
                "value": player.name.toLowerCase(), 
                "className": `text-left ${getTeamColor(player.team, totalTeams)}`,
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${d.player_id}`}>
                    
                    <CountryFlag country={player.country}/>
                    {player.name} 
                    
                </Link>
            },
            "shots": {"value": d.shots, "displayValue": ignore0(d.shots)},
            "hits": {"value": d.hits, "displayValue": ignore0(d.hits)},
            "accuracy": {"value": d.accuracy, "displayValue": `${d.accuracy.toFixed(2)}%`},
            "deaths": {"value": d.deaths, "displayValue": ignore0(d.deaths)},
            "suicides": {"value": d.suicides, "displayValue": ignore0(d.suicides)},
            "kills": {"value": d.kills, "displayValue": ignore0(d.kills)},
            "bestKills": {"value": d.best_kills, "displayValue": ignore0(d.best_kills)},
            "teamKills": {"value": d.team_kills, "displayValue": ignore0(d.team_kills)},
            "damage": {"value": d.damage, "displayValue": ignore0(d.damage)},
            "eff": {"value": d.efficiency, "displayValue": `${d.efficiency.toFixed(2)}%`}
        });
    }

    data.sort(orderByName);

    return <InteractiveTable key={state.selectedWeaponId} width="1" title={weaponName} headers={headers} data={data}/>
}

function getWeaponName(weaponNames, id){

    for(let i = 0; i < weaponNames.length; i++){

        const w = weaponNames[i]

        if(w.id === id) return w.name;        
    }

    return "Not Found";
}

function renderBarChart(state, dispatch, playerData, weaponNames, weaponStats){

    if(state.mode !== 0 || state.individualDisplayMode !== 1) return null;

    const weaponName = getWeaponName(weaponNames, state.selectedWeaponId);

    const values = [];
    const names = [];

    for(let i = 0; i < playerData.length; i++){
        
        const p = playerData[i];

        names.push(p.name);
        values.push(getPlayerWeaponStat(state, parseInt(p.player_id), weaponStats));
    }

    return <>
        <Tabs options={[
                {"name": "Kills", "value": "kills"},
                {"name": "Deaths", "value": "deaths"},
                {"name": "Damage", "value": "damage"},
                {"name": "Shots", "value": "shots"},
                {"name": "Hits", "value": "hits"},
                {"name": "Accuracy", "value": "accuracy"},
            ]}
            selectedValue={state.selectedStatType}
            changeSelected={(value) => {dispatch({"type": "set-stats-type", "value": value})}}
        />
        <BarChart title={weaponName} label={state.selectedStatType.toUpperCase()} values={values} names={names}/>
    </>
}

function getPlayerWeaponStat(state, playerId, weaponStats){

    for(let i = 0; i < weaponStats.playerData.length; i++){

        const p = weaponStats.playerData[i];

        if(p.player_id == playerId && state.selectedWeaponId == p.weapon_id){

            let value = p[state.selectedStatType];

            if(state.selectedStatType === "accuracy") value = parseFloat(value.toFixed(2));
            return value;
        }
    }

    return 0;
}


function renderWeaponTabs(mode, selectedWeaponId, weaponNames, dispatch){

    if(mode < 0) return null;
    const tabs = [];

    const names = weaponNames;

    for(let i = 0; i < names.length; i++){

        const weapon = names[i];

        const styleClass = `tab ${(selectedWeaponId === weapon.id) ?  "tab-selected": ""}`;

        tabs.push(<div key={weapon.id} className={styleClass} onClick={() => dispatch({"type": "set-selected-weapon", "value": weapon.id})}>
            {weapon.name}
        </div>);
    }

    if(tabs.length === 0) return null;

    return <div className="tabs">
        {tabs}
    </div>
}    

export default function MatchWeaponSummaryCharts({matchId, totalTeams, playerData, weaponStats}){

    if(weaponStats === null) return null;
    
    const [state, dispatch] = useReducer(reducer, {
        "mode": -3,
        //"statsType": 0,
        "individualDisplayMode": 0,
        "selectedStatType": "kills",
        "selectedWeaponId": null
    });

    const totalStats = createPlayerTotalStats(weaponStats.playerData, playerData);

    const weaponNames = [];

    for(const [id, name] of Object.entries(weaponStats.names)){
        weaponNames.push({id, name});
    }

    weaponNames.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    if(weaponNames.length > 0 && state.selectedWeaponId === null){
        dispatch({"type": "set-selected-weapon", "value": weaponNames[0].id});
    }

    return <div>
        <div className="default-header">Weapon Statistics</div>
        {renderTabs(state, dispatch)}
        {renderIndividualTabs(state, dispatch)}
        {renderWeaponTabs(state.mode, state.selectedWeaponId, weaponNames, dispatch)}
        {renderTotalDamage(state.mode, matchId, totalStats, playerData, totalTeams)}
        {renderBest(state, matchId, playerData, totalTeams, weaponNames, weaponStats)}
        {renderBarChart(state, dispatch, playerData, weaponNames, weaponStats)}
        {renderSingleTable(state, totalTeams, matchId, playerData, weaponNames, weaponStats)}
        {renderByStatsType(state.mode, state.selectedStatType, weaponStats, weaponNames, dispatch, playerData)}
    </div>
}
