import styles from './MatchFragTable.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Functions from '../../api/functions';
import {React, useState} from 'react';
import InteractiveTable from '../InteractiveTable';

const MatchFragTable = ({matchId, playerData, totalTeams, bSeparateByTeam, single}) =>{


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
        "playtime": "Playtime",
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
        if(data.length > 1){
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
        }

        

        return <InteractiveTable key={teamId} width={1} headers={headers} data={data} defaultOrder={"score"} bAsc={false}/>
    }

    const tables = [];

    if(bSeparateByTeam && !single && totalTeams > 1){

        for(let i = 0; i < totalTeams; i++){

            tables.push(renderTable(i));
        }

    }else{

        tables.push(renderTable(-1));
    }

    return <div>
        {tables}
    </div>

}

export default MatchFragTable;

