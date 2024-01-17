import {React, useEffect, useState, useReducer} from "react";
import BarChart from "../BarChart";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";
import MatchWeaponBest from "../MatchWeaponBest";
import Tabs from "../Tabs";
import { ignore0, getPlayer, getTeamColor } from "../../api/generic.mjs";

const reducer = (state, action) =>{

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

        case "set-weapon-stats": {
          
            return {
                ...state,
                "weaponStats": {"names": action.value.names, "playerData": action.value.playerData}
            }
        }

        case "set-individual-mode": {
            console.log("CHECK");
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

const orderByName = (a, b) =>{

    a = a.name.value;
    b = b.name.value;

    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

const renderTabs = (state, dispatch) =>{

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

const getMaxStats = (weaponStats, weaponId, type) =>{

    let best = null;

    for(let i = 0; i < weaponStats.length; i++){

        const w = weaponStats[i];

        if(w.weapon_id !== weaponId) continue;

        if(best === null){
            best = w;
            continue;
        }

        if(best[type] < w[type]) best = w;

    }

    return best;
}

const renderBest = (state, matchId, players, totalTeams) =>{

    if(state.mode !== -1) return null;

    const elems = [];

    state.weaponStats.names.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    for(let i = 0; i < state.weaponStats.names.length; i++){

        const {id, name} = state.weaponStats.names[i];

        const bestKills = getMaxStats(state.weaponStats.playerData, id, "kills");
        const bestKillsPlayer = getPlayer(players, bestKills.player_id, true);

        const bestDamage = getMaxStats(state.weaponStats.playerData, id, "damage");
        const bestDamagePlayer = getPlayer(players, bestDamage.player_id, true);

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

const renderIndividualTabs = (state, dispatch) =>{
   
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
        console.log(value);
        dispatch({"type": "set-individual-mode", "value": value});
    }}/>
}

const createPlayerTotalStats = (data, players) =>{

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

        const currentPlayer = getPlayer(players, d.player_id, true);

        if(totalDamage[currentPlayer.team] === undefined) totalDamage[currentPlayer.team] = 0;
        totalDamage[currentPlayer.team] += d.damage;
    }


    const finalData = [];

    for(const [playerId, playerData] of Object.entries(totals)){

        const currentPlayer = getPlayer(players, playerId, true);


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

const renderTotalDamage = (displayMode, matchId, totalData, players, totalTeams) =>{

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

        const player = getPlayer(players, playerId, true);

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

const getPlayerStatType = (stats, playerId, weaponId, statType) =>{

    playerId = parseInt(playerId);
    weaponId = parseInt(weaponId);

    for(let i = 0; i < stats.length; i++){

        const s = stats[i];

        if(s.player_id !== playerId || s.weapon_id !== weaponId) continue;

        return s[statType];
    }

    return 0;
}

const renderByStatsType = (state, dispatch, players) =>{

    if(state.mode !== -3) return null;


    const headers = {
        "player": "Player"
    };
    const rows = [];


    const weaponNames = [...state.weaponStats.names];

    weaponNames.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    for(let i = 0; i < weaponNames.length; i++){

        const w = weaponNames[i];
        headers[`w_${w.id}`] = w.name;
    }

    headers["totals"] = "Total";

    for(const [playerId, playerData] of Object.entries(players)){

        if(playerData.playtime === 0) continue;

        const current = {
            "player": {
                "value": playerData.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={playerData.country}/>{playerData.name}</>,
                "className": `text-left ${getTeamColor(playerData.team)}`
            }
        };

        let total = 0;

        for(let i = 0; i < weaponNames.length; i++){

            const w = weaponNames[i];

            let cValue = getPlayerStatType(state.weaponStats.playerData, playerId, w.id, state.selectedStatType);

            const originalValue = cValue;

            total += cValue;

            if(state.selectedStatType !== "accuracy" || cValue === 0){
                cValue = ignore0(cValue);
            }else{
                cValue = `${cValue.toFixed(2)}%`;
            }

            current[`w_${w.id}`] = {
                "value": originalValue, 
                "displayValue": cValue,  
            };
        
        }

        if(state.selectedStatType === "accuracy"){

            total = total.toFixed(2);
        }

        current.totals = {"value": parseFloat(total), "displayValue": (state.selectedStatType === "accuracy") ? `${total}%` :ignore0(total)};

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
            selectedValue={state.selectedStatType}
            changeSelected={(value) =>{
                dispatch({"type": "set-stats-type", "value": value});
            }}
        />
        <InteractiveTable data={rows} headers={headers} width={1}/>
    </>
}


const renderSingleTable = (state, totalTeams, matchId, playerData) =>{

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

    const weaponName = getWeaponName(state.weaponStats, state.selectedWeaponId);

    const data = [];

    for(let i = 0; i < state.weaponStats.playerData.length; i++){

        const d = state.weaponStats.playerData[i];

        if(d.weapon_id !== state.selectedWeaponId) continue;

        const player = getPlayer(playerData, d.player_id, true);

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

const getWeaponName = (weaponStats, id) =>{

    //console.log(weaponStats, id);

    for(let i = 0; i < weaponStats.names.length; i++){

        const w = weaponStats.names[i]

        if(w.id === id) return w.name;        
    }

    return "Not Found";
}

const renderBarChart = (state, dispatch, playerData) =>{

    if(state.mode !== 0 || state.individualDisplayMode !== 1) return null;

    const weaponName = getWeaponName(state.weaponStats, state.selectedWeaponId);

    const values = [];
    const names = [];

    for(const [playerId, data] of Object.entries(playerData)){
        names.push(data.name);
        values.push(getPlayerWeaponStat(state, parseInt(playerId)));
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

const getPlayerWeaponStat = (state, playerId) =>{

    for(let i = 0; i < state.weaponStats.playerData.length; i++){

        const p = state.weaponStats.playerData[i];

        if(p.player_id === playerId && state.selectedWeaponId === p.weapon_id){

            let value = p[state.selectedStatType];

            if(state.selectedStatType === "accuracy") value = parseFloat(value.toFixed(2));
            return value;
        }
    }

    return 0;
}


const MatchWeaponSummaryCharts = ({matchId, totalTeams, playerData, host}) =>{

    const [error, setError] = useState(null);
    const [totalStats, setTotalStats] = useState([]);

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "mode": -3,
        //"statsType": 0,
        "individualDisplayMode": 0,
        "selectedStatType": "kills",
        "weaponStats": {"names": [], "playerData": []},
        "selectedWeaponId": null
    });


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{
            
            try{
                const req = await fetch("/api/match", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"matchId": matchId, "mode": "weapons"})
                });

                const res = await req.json();

                

                if(res.error !== undefined){
                    setError(res.error.toString());
                }else{

                    setError(null);

                    if(res.names.length > 0){
                        dispatch({"type": "set-selected-weapon", "value": res.names[0].id});
                    }

                    dispatch({"type": "set-weapon-stats", "value": res});

                    setTotalStats(createPlayerTotalStats(res.playerData, playerData));
                }


            }catch(err){
                if(err.name !== "AbortError")
                setError(err.toString());
            }

            dispatch({"type": "set-loading", "value": false});
        }


        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId, playerData]);


    const renderWeaponTabs = (state) =>{

        if(state.mode < 0) return null;
        const tabs = [];

        const names = [...state.weaponStats.names];

        names.sort((a, b) =>{

            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        for(let i = 0; i < names.length; i++){

            const weapon = names[i];

            const styleClass = `tab ${(state.selectedWeaponId === weapon.id) ?  "tab-selected": ""}`;

            tabs.push(<div key={weapon.id} className={styleClass} onClick={() => dispatch({"type": "set-selected-weapon", "value": weapon.id})}>
                {weapon.name}
            </div>);
        }

        if(tabs.length === 0) return null;

        return <div className="tabs">
            {tabs}
        </div>
    }

    

    

    if(error !== null){
        return <ErrorMessage title="Weapon Statistics" text={error}/>
    }

    if(state.bLoading){
        return <Loading />;
    }   


    

    return <div>
        <div className="default-header">Weapon Statistics</div>
        {renderTabs(state, dispatch)}
        {renderIndividualTabs(state, dispatch)}
        {renderWeaponTabs(state)}
        {renderTotalDamage(state.mode, matchId, totalStats, playerData, totalTeams)}
        {renderBest(state, matchId, playerData, totalTeams)}
        {renderBarChart(state, dispatch, playerData)}
        {renderSingleTable(state, totalTeams, matchId, playerData)}
        {renderByStatsType(state, dispatch, playerData)}
    </div>
}

export default MatchWeaponSummaryCharts;
