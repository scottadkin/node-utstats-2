import styles from './MatchFragTable.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Functions from '../../api/functions';
import {React, useState} from 'react';
import InteractiveTable from '../InteractiveTable';

//highlight for pmatch

const MatchFragTable = ({matchId, playerData, totalTeams, bSeparateByTeam, highlight}) =>{


    const bAnyDataType = (type) =>{

        for(let i = 0; i < playerData.length; i++){

            const p = playerData[i];
            if(p[type] !== 0) return true;
        }

        return false;
    }
    

    const types = [
        ["team_kills", "Team Kills"],
        ["spawn_kills", "Spawn Kills"],
        ["headshots", "Headshots"]
    ];

    const headers = {
        "player": "Player",
        "playtime": "playtime",
        "score": "Score",
        "frags": "Frags",
        "kills": "Kills",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "efficiency": "Efficiency"
    };

    for(let i = 0; i < types.length; i++){

        const t = types[i];

        if(bAnyDataType(t[0])){
            headers[t[0]] = t[1];
        }
    }



    const renderTable = (teamId) =>{

        const data = [];

        const totals = {
            "team_kills": 0, 
            "spawn_kills": 0,
            "headshots": 0, 
            "score": 0,
            "frags": 0,
            "kills": 0,
            "deaths": 0,
            "suicides": 0,
            "efficiency": 0
        };

        for(let i = 0; i < playerData.length; i++){

            const p = playerData[i];

            if(teamId !== -1 && p.team !== teamId) continue;
            
            for(const key of Object.keys(totals)){
                totals[key] += p[key];
            }

            data.push({
                "player": {
                    "value": p.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${p.player_id}`}>
                        <a>
                            <CountryFlag country={p.country}/>{p.name}
                        </a>
                    </Link>,
                    "className": `${Functions.getTeamColor(p.team)} player`
                },
                "playtime":{
                    "value": p.playtime,
                    "displayValue": Functions.MMSS(p.playtime),
                },
                "score": {
                    "value": p.score,
                    "displayValue": Functions.ignore0(p.score)
                },
                "frags": {
                    "value": p.frags,
                    "displayValue": Functions.ignore0(p.frags)
                },
                "kills": {
                    "value": p.kills,
                    "displayValue": Functions.ignore0(p.kills)
                },
                "deaths": {
                    "value": p.deaths,
                    "displayValue": Functions.ignore0(p.deaths)
                },
                "suicides": {
                    "value": p.suicides,
                    "displayValue": Functions.ignore0(p.suicides)
                },
                "headshots": {
                    "value": p.headshots,
                    "displayValue": Functions.ignore0(p.headshots)
                },
                "efficiency": {
                    "value": p.efficiency,
                    "displayValue": `${p.efficiency.toFixed(2)}%`
                },
                "team_kills": {
                    "value": p.team_kills,
                    "displayValue": Functions.ignore0(p.team_kills)
                },
                "spawn_kills": {
                    "value": p.spawn_kills,
                    "displayValue": Functions.ignore0(p.spawn_kills)
                },
            });

        }

        let totalEff = 0;

        if(totals.kills > 0){

            if(totals.deaths > 0){
                totalEff = totals.kills / (totals.kills + totals.deaths);
                totalEff *= 100;
            }else{
                totalEff = 100;
            }
        }

        const last = {
            "bAlwaysLast": true,
            "player": "Totals",
            "playtime": "N/A",
            "score": {
                "value": totals.score,
                "displayValue": Functions.ignore0(totals.score)
            },
            "frags": {
                "value": totals.frags,
                "displayValue": Functions.ignore0(totals.frags)
            },
            "kills": {
                "value": totals.kills,
                "displayValue": Functions.ignore0(totals.kills)
            },
            "deaths": {
                "value": totals.deaths,
                "displayValue": Functions.ignore0(totals.deaths)
            },
            "suicides": {
                "value": totals.suicides,
                "displayValue": Functions.ignore0(totals.suicides)
            },
            "headshots": {
                "value": totals.headshots,
                "displayValue": Functions.ignore0(totals.headshots)
            },
            "efficiency": {
                "value": totalEff,
                "displayValue": `${(totalEff).toFixed(2)}%` 
            },
            "team_kills": {
                "value": totals.team_kills,
                "displayValue": Functions.ignore0(totals.team_kills)
            },
            "spawn_kills": {
                "value": totals.spawn_kills,
                "displayValue": Functions.ignore0(totals.spawn_kills)
            },
        }

        data.push(last);

        return <InteractiveTable key={teamId} width={1} headers={headers} data={data}/>
    }

    const tables = [];

    if(bSeparateByTeam){

        for(let i = 0; i < totalTeams; i++){

            tables.push(renderTable(i));
        }

    }else{

        tables.push(renderTable(-1));
    }

    return <div>
        {tables}
    </div>

    //return <InteractiveTable width={1} headers={headers} data={data}/>
}

export default MatchFragTable;

/*
const bAnyData = (data) =>{

    const types = [
        "suicides",
        "team_kills",
        "spawn_kills",
        "headshots",
        "deaths",
        "kills",
        "efficiency",
        "frags",
        "scores"
    ];


    for(let i = 0; i < types.length; i++){

        if(data[types[i]] !== 0) return true;
    }

    return false;
}

const MatchFragTable = ({host, players, team, matchStart, toDisplay, matchId, single}) =>{

    if(players.length === 0) return null;

    let bgColor = Functions.getTeamColor(team);

    const elems = [];
    
    let totalPlaytime = 0;
    let totalSuicides = 0;
    let totalTeamKills = 0;
    let totalSpawnKills = 0;
    let totalDeaths = 0;
    let totalKills = 0;
    let totalFrags = 0;
    let totalScore = 0;
    let totalEff = 0;
    let totalHeadshots = 0;


    for(let i = 0; i < players.length; i++){

        const p = players[i];

        totalPlaytime += p.playtime - matchStart;
        totalSuicides += p.suicides;
        totalTeamKills += p.team_kills;
        totalSpawnKills += p.spawn_kills;
        totalDeaths += p.deaths;
        totalKills += p.kills;
        totalFrags += p.frags;
        totalScore += p.score;
        totalHeadshots += p.headshots;


        if(!p.played) continue;

        if(bAnyData(p)){

            elems.push(<tr key={`frag_tr_${team}_${i}`} >
                {(single) ? null : 
                <td className={`text-left ${bgColor}`}>
                    <CountryFlag key={`frag_country__${team}_${i}`} host={host} country={p.country} />
                    <Link href={`/pmatch/${matchId}/?player=${p.player_id}`}><a>{p.name}</a></Link>
                </td>}
                <td style={(single) ? {textAlign: "center"} : {} }>{Functions.MMSS(p.playtime)}</td>
                <td>{Functions.ignore0(p.score)}</td>
                <td>{Functions.ignore0(p.frags)}</td>
                <td>{Functions.ignore0(p.kills)}</td>
                <td>{Functions.ignore0(p.deaths)}</td>
                {(toDisplay.indexOf('suicides') !== -1) ? <td>{Functions.ignore0(p.suicides)}</td> : null}
                {(toDisplay.indexOf('team_kills') !== -1) ? <td>{Functions.ignore0(p.team_kills)}</td> : null}
                {(toDisplay.indexOf('headshots') !== -1) ? <td>{Functions.ignore0(p.headshots)}</td> : null}
                {(toDisplay.indexOf('spawn_kills') !== -1) ? <td>{Functions.ignore0(p.spawn_kills)}</td> : null}
                <td>{p.efficiency.toFixed(2)}%</td>

            </tr>);
        }
    }

    if(totalKills && totalDeaths > 0){
        totalEff = totalKills / (totalDeaths + totalKills);
        totalEff *= 100;
    }else if(totalKills > 0){
        totalEff = 100;
    }

    if(!single){
        elems.push(<tr key={`frag_tr_total__${team}`} className={`${styles.totals}`}>
            <td className="text-left">Totals</td>
            <td className="small-font grey">N/A</td>
            <td>{Functions.ignore0(totalScore)}</td>
            <td>{Functions.ignore0(totalFrags)}</td>
            <td>{Functions.ignore0(totalKills)}</td>
            <td>{Functions.ignore0(totalDeaths)}</td>
            {(toDisplay.indexOf('suicides') !== -1) ? <td>{Functions.ignore0(totalSuicides)}</td> : null}
            {(toDisplay.indexOf('team_kills') !== -1) ? <td>{Functions.ignore0(totalTeamKills)}</td> : null}
            {(toDisplay.indexOf('headshots') !== -1) ? <td>{Functions.ignore0(totalHeadshots)}</td> : null}
            {(toDisplay.indexOf('spawn_kills') !== -1) ? <td>{Functions.ignore0(totalSpawnKills)}</td> : null}
        
            <td>{totalEff.toFixed(2)}%</td>
        
        </tr>);
    }

    return (<Table2 width={1} players={true}>

        <tr className={bgColor}>
            {(single) ? null : <th className="name-td">Player</th>}
            <th>Playtime</th>
            <th>Score</th>
            <th>Frags</th>
            <th>Kills</th>
            <th>Deaths</th>
            {(toDisplay.indexOf('suicides') !== -1) ? <th>Suicides</th> : null}
            {(toDisplay.indexOf('team_kills') !== -1) ? <th>Team Kills</th> : null}
            {(toDisplay.indexOf('headshots') !== -1) ? <th>Headshots</th> : null}
            {(toDisplay.indexOf('spawn_kills') !== -1) ? <th>Spawn Kills</th> : null}
            <th>Efficiency</th>     
        </tr>
        {elems}
    </Table2>);
}


export default MatchFragTable;*/