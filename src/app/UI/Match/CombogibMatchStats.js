"use client"
import CountryFlag from "../CountryFlag";
import ErrorMessage from "../ErrorMessage";
import Link from "next/link";
import Loading from "../Loading";
import { getTeamColor, ignore0, getPlayerFromMatchData } from "../../../../api/generic.mjs";
import { useEffect, useReducer } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";

function reducer(state, action){

    switch(action.type){
        case "set-data": {
            return {
                ...state,
                "data": action.data
            }
        }
        case "set-error": {
            return {
                ...state,
                "error": action.error
            }
        }
        case "set-loading": {
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
        case "set-b-all-players": {
            return {
                ...state,
                "bAllPlayers": action.value
            }
        }
    }
    return {...state};
}

async function loadData(matchId, dispatch){

    const req = await fetch("/api/combogib",{
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "match", "matchId": matchId})
    });

    const res = await req.json();

    if(res.error === undefined){

        let data = res.data;

        if(data.length === 0){
            data = null;
        }

        dispatch({"type": "set-data", "data": data});

    }else{
        dispatch({"type": "set-error", "error": res.error});
    }

    dispatch({"type": "set-loading", "value": false});
}

function getKillsString(kills){

    return (kills === 0) ? "" : `${kills} Kill${(kills === 1) ? "" : "s"}`;
}

function renderTeamTabs(totalTeams, bAllPlayers, dispatch){

    if(totalTeams < 2) return null;

    const options = [
        {"name": "All Players", "value": true},
        {"name": "Separate By Team", "value": false}
    ];

    return <Tabs options={options} selectedValue={bAllPlayers} changeSelected={(a) => dispatch({"type": "set-b-all-players", "value": a})} />
}


function renderBasic(mode, data, players, bAllPlayers, totalTeams, matchId){

    if(mode !== 0) return null;

    const rows = [];


    const teamData = [[],[],[],[]];

    const teamTotals = [
        {"combos": 0, "shockBalls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0},
        {"combos": 0, "shockBalls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0},
        {"combos": 0, "shockBalls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0},
        {"combos": 0, "shockBalls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0}
    ];

    const allTotals = {"combos": 0, "shockBalls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0};

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        const bestKillString = getKillsString(d.best_single_combo);
        const bestBallKillString = getKillsString(d.best_single_shockball);
        const bestInsaneKillString = getKillsString(d.best_single_insane);

        let currentPlayer = getPlayerFromMatchData(players, d.player_id);

        const teamColor = (totalTeams >= 2) ? getTeamColor(currentPlayer.team) : "team-none";

        const currentRow = {
            "player": {
                "value": currentPlayer.name.toLowerCase(), 
                "className": `${teamColor} player`,
                "displayValue": <><CountryFlag country={currentPlayer.country}/>
                    <Link href={`/pmatch/${matchId}?player=${d.player_id}`}>{currentPlayer.name}</Link>
                </>
            },"combo": {"value": d.combo_kills, "displayValue": ignore0(d.combo_kills)},
            "insane": {"value": d.insane_kills, "displayValue": ignore0(d.insane_kills)},
            "shockball":{"value": d.shockball_kills, "displayValue": ignore0(d.shockball_kills)},
            "primary":  {"value": d.primary_kills, "displayValue": ignore0(d.primary_kills)},
            "bestBall": {"value": bestBallKillString  },
            "bestInsane":{"value": bestInsaneKillString },
            "bestKill":{"value": bestKillString },
        };

        if(bAllPlayers){

            rows.push(currentRow);

            allTotals.combos += d.combo_kills;
            allTotals.shockBalls += d.shockball_kills;
            allTotals.primary += d.primary_kills;
            allTotals.insane += d.insane_kills;

            if(d.best_single_combo > allTotals.bestSingle){
                allTotals.bestSingle = d.best_single_combo;
            }

            if(d.best_single_shockball > allTotals.bestSingleShockBall){
                allTotals.bestSingleShockBall = d.best_single_shockball;
            }

            if(d.best_single_insane > allTotals.bestSingleInsane){
                allTotals.bestSingleInsane = d.best_single_insane;
            }

        }else{

            if(currentPlayer.team === -1) continue;

            if(currentPlayer.team === 255){

                if(totalTeams >= 2){
                    continue;
                }
            }

            teamData[currentPlayer.team].push(currentRow);

            const teamTotal = teamTotals[currentPlayer.team];

            teamTotal.combos += d.combo_kills;            
            teamTotal.shockBalls += d.shockball_kills;  
            teamTotal.primary += d.primary_kills;
            teamTotal.insane += d.insane_kills;
    
            if(d.best_single_combo > teamTotal.bestSingle){
                teamTotal.bestSingle = d.best_single_combo;
            }

            if(d.best_single_shockball > teamTotal.bestSingleShockBall){
                teamTotal.bestSingleShockBall = d.best_single_shockball;
            }

            if(d.best_single_insane > teamTotal.bestSingleInsane){
                teamTotal.bestSingleInsane = d.best_single_insane;
            }
        }
    }

    if(rows.length > 0){

        const bestSingle = getKillsString(allTotals.bestSingle);
        const bestSingleBall = getKillsString(allTotals.bestSingleShockBall);
        const bestInsane = getKillsString(allTotals.bestSingleInsane);

        rows.push({
            "bAlwaysLast": true,
            "player": {
                "value": null, 
                "className": `team-none player`,
                "displayValue": <>Totals/Best</>
            },"combo": {"value": allTotals.combos, "displayValue": ignore0(allTotals.combos)},
            "insane": {"value": allTotals.insane, "displayValue": ignore0(allTotals.insane)},
            "shockball":{"value": allTotals.shockBalls, "displayValue": ignore0(allTotals.shockBalls)},
            "primary":  {"value": allTotals.primary, "displayValue": ignore0(allTotals.primary)},
            "bestBall": {"value": bestSingleBall  },
            "bestInsane":{"value": bestInsane },
            "bestKill":{"value": bestSingle },
        });

    }

    const tableHeaders = {
        "player": "Player",
        "combo": "Combo Kills",
        "insane": "Insane Combo Kills",
        "shockball": "Shock Ball Kills",
        "primary": "Instagib Kills",
        "bestBall": "Best ShockBall",
        "bestInsane": "Best Insane Combo",
        "bestKill": "Best Combo"
    };

    if(bAllPlayers){

        return <InteractiveTable width={1} key={"all"} headers={tableHeaders} data={rows} />

    }else{

        const tables = [];

        for(let i = 0; i < teamData.length; i++){

            const teamRows = teamData[i];

            if(teamRows.length === 0) continue;

            const t = teamTotals[i];

            const bestSingle = getKillsString(t.bestSingle);
            const bestSingleBall = getKillsString(t.bestSingleShockBall);
            const bestInsane = getKillsString(t.bestSingleInsane);

            teamRows.push({
                "bAlwaysLast": true,
                "player": {
                    "value": null, 
                    "className": `team-none player`,
                    "displayValue": <>Totals/Best</>
                },"combo": {"value": t.combos, "displayValue": ignore0(t.combos)},
                "insane": {"value": t.insane, "displayValue": ignore0(t.insane)},
                "shockball":{"value": t.shockBalls, "displayValue": ignore0(t.shockBalls)},
                "primary":  {"value": t.primary, "displayValue": ignore0(t.primary)},
                "bestBall": {"value": bestSingleBall },
                "bestInsane":{"value": bestInsane },
                "bestKill":{"value": bestSingle },
            });

            tables.push(<InteractiveTable key={i} width={1} headers={tableHeaders} data={teamRows} />);
        }

        return <>{tables}</>;
    }
}

function getTypeTitles(mode){

    if(mode === 1 || mode === 2 || mode === 4){

        let bestTitle = null;

        if(mode === 1){
            bestTitle = "Best Combo";
        }else if(mode === 2){
            bestTitle = "Best Single Ball";
        }else{
            bestTitle = "Best Insane Combo";
        }
        
        return {
            "player": "Player",
            "deaths": "Deaths",
            "kills": "Kills",
            "eff": "Efficiency",
            "most-kills": "Most Kills in 1 Life",
            "best": bestTitle,
            "kpm": "Kills Per Minute"
        };

    }else if(mode !== 0){

        return {
            "player": "Player",
            "deaths": "Deaths",
            "kills": "Kills",
            "eff": "Efficiency",
            "most-kills": "Most Kills in 1 Life",
            "kpm": "Kills Per Minute"
        };
    }

    return {};
}

function getTypeRow(mode, totalTeams, matchId, data, players){

    if(mode === 0) return null;

    const player = getPlayerFromMatchData(players, data.player_id);

    const teamColor = (totalTeams >= 2) ? getTeamColor(player.team) : "team-none";

    const playerElem = <Link href={`/pmatch/${matchId}?player=${data.player_id}`}>
            <CountryFlag country={player.country}/>{player.name}
        </Link>;
   

    if(mode === 1 || mode === 2 || mode === 4){

        let bestKills = 0;
        let kills = 0;
        let deaths = 0;
        let eff = 0;
        let bestOfType = 0;
        let kpm = 0;

        if(mode === 1){

            bestKills = data.best_combo_spree;
            kills = data.combo_kills;
            deaths = data.combo_deaths;
            eff = data.combo_efficiency;
            bestOfType =  data.best_single_combo;
            kpm = data.combo_kpm;

        }else if(mode === 2){

            bestKills = data.best_shockball_spree;
            kills = data.shockball_kills;
            deaths = data.shockball_deaths;
            eff = data.shockball_efficiency;
            bestOfType = data.best_single_shockball;
            kpm = data.shockball_kpm;

        }else if(mode === 4){

            bestKills = data.best_insane_spree;
            kills = data.insane_kills;
            deaths = data.insane_deaths;
            eff = data.insane_efficiency;
            bestOfType = data.best_single_insane;
            kpm = data.insane_kpm;
        }


        return {
            "player": {"value": "", "displayValue": playerElem, "className": `player ${teamColor}`},
            "deaths": {"value": deaths, "displayValue": ignore0(deaths)},
            "kills": {"value": kills, "displayValue": ignore0(kills)},
            "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`},
            "most-kills":{"value": bestKills, "displayValue": ignore0(bestKills)},
            "best":{"value": bestOfType, "displayValue": getKillsString(bestOfType)},
            "kpm":{"value": kpm, "displayValue": kpm.toFixed(2)},
        };

    }else{

        let kills =  data.primary_kills;
        let deaths = data.primary_deaths;
        let best =  data.best_primary_spree;
        let kpm = data.primary_kpm;

        const eff = data.primary_efficiency;

        return {
            "player": {"value": "", "displayValue": playerElem, "className": `player ${teamColor}`},
            "deaths": {"value": deaths, "displayValue": ignore0(deaths)},
            "kills": {"value": kills, "displayValue": ignore0(kills)},
            "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`},
            "most-kills":{"value": best, "displayValue": ignore0(best)},
            "kpm":{"value": kpm, "displayValue": kpm.toFixed(2)},
        };
    }
}

function updateTeamTotal(mode, teamTotals, data, player){

    let t = 0;
    //null for all time totals
    if(player !== null){
        t = teamTotals[player.team];
    }else{
        t = teamTotals[0];
    }
    const d = data;

    const keys = {
        1: "combo",
        2: "shockball",
        3: "primary",
        4: "insane",
    };

    const k = keys[mode];

    t.kills += d[`${k}_kills`];
    t.deaths += d[`${k}_deaths`];

    if(d[`best_${k}_spree`] > t.mostKills){
        t.mostKills += d[`best_${k}_spree`];
    }

    if(d[`${k}_kpm`] > t.bestKPM){
        t.bestKPM = d[`${k}_kpm`];
    }

    if(mode !== 3){

        if(d[`best_single_${k}`] > t.bestSingle){
            t.bestSingle = d[`best_single_${k}`];
        }
    }

}

function renderTypeStats(mode, totalTeams, matchId, data, bAllPlayers, players){

    if(mode === 0) return null;

    const titlesRow = getTypeTitles(mode);

    const rows = [];

    const teamRows = [[],[],[],[]];

    const teamTotals = [
        {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0,"bestKPM":0},
        {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0,"bestKPM":0},
        {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0,"bestKPM":0},
        {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0,"bestKPM":0}
    ];


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(bAllPlayers){
            
            updateTeamTotal(mode, teamTotals, d, null);
            rows.push(getTypeRow(mode, totalTeams, matchId, d, players));
            //rows.push(this.getTypeRow(d));

        }else{

            const player = getPlayerFromMatchData(players, d.player_id);//this.getPlayer(d.player_id);

            if(player.team >= 0 && player.team < 4){

                updateTeamTotal(mode, teamTotals, d, player);
                
                teamRows[player.team].push(getTypeRow(mode, totalTeams, matchId, d, players));
            }
        }
    }

    const elems = [];

    if(bAllPlayers){

        const t = teamTotals[0];

        let eff = 0;
        
        if(t.kills > 0){

            if(t.deaths > 0){
                eff = (t.kills / (t.kills + t.deaths)) * 100
            }else{
                eff = 100;
            }
        }

        rows.push({
            "bAlwaysLast": true,
            "player": {"value": "", "displayValue": "Totals/Best", "className": `player team-node`},
            "deaths": {"value": t.deaths, "displayValue": ignore0(t.deaths)},
            "kills": {"value": t.kills, "displayValue": ignore0(t.kills)},
            "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`},
            "most-kills":{"value": t.mostKills, "displayValue": ignore0(t.mostKills)},
            "best":{"value": t.bestSingle, "displayValue": getKillsString(t.bestSingle)},
            "kpm":{"value": t.bestKPM, "displayValue": t.bestKPM.toFixed(2)},
        });

        return <InteractiveTable width={1} headers={titlesRow} data={rows}/>
    }

    for(let x = 0; x < totalTeams; x++){

        let eff = 0;

        const t = teamTotals[x];

        if(t.kills > 0){

            if(t.deaths > 0){
                eff = (t.kills / (t.kills + t.deaths)) * 100
            }else{
                eff = 100;
            }
        }

        teamRows[x].push({
            "bAlwaysLast": true,
            "player": {"value": "", "displayValue": "Totals/Best", "className": `player team-node`},
            "deaths": {"value": t.deaths, "displayValue": ignore0(t.deaths)},
            "kills": {"value": t.kills, "displayValue": ignore0(t.kills)},
            "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`},
            "most-kills":{"value": t.mostKills, "displayValue": ignore0(t.mostKills)},
            "best":{"value": t.bestSingle, "displayValue": getKillsString(t.bestSingle)},
            "kpm":{"value": t.bestKPM, "displayValue": t.bestKPM.toFixed(2)},
        });

        elems.push(<InteractiveTable key={x} width={1} headers={titlesRow} data={teamRows[x]}/>);


    }
        
    

    return elems;
}

export default function CombogibMatchStats({matchId, totalTeams, players}){

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "data": null, 
        "error": null, 
        "mode": 0, 
        "sortType": "name", 
        "statsSortBy": "kills",
        "bAscendingOrder": true,
        "bAllPlayers": (totalTeams >= 2) ? false : true
    });

    useEffect(() =>{

        loadData(matchId, dispatch);

    },[matchId]);

    if(state.error !== null){

        return <ErrorMessage title="Combogib Stats" text={state.error}/>
    }


    if(state.data === null) return null;

    if(state.bLoading) return <Loading />;

    const tabOptions = [
        {"name": "General Stats", "value": 0},
        {"name": "Combo Stats", "value": 1},
        {"name": "Insane Combo Stats", "value": 4},
        {"name": "Shockball Stats", "value": 2},
        {"name": "Instagib Stats", "value": 3},
    ];

    return <div>
        <div className="default-header">Combogib Stats</div> 
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(a) => dispatch({"type": "set-mode", "value": a})}/>
        {renderTeamTabs(totalTeams, state.bAllPlayers, dispatch)}
        {renderBasic( state.mode, state.data, players, state.bAllPlayers, totalTeams, matchId)}
        {renderTypeStats(state.mode, totalTeams, matchId, state.data, state.bAllPlayers, players)}
    </div>
}