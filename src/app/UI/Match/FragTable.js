"use client"
import Header from "../Header";
import InteractiveTable from "../InteractiveTable";
import { getTeamColorClass, MMSS, ignore0 } from "@/app/lib/generic";
import styles from "./FragTable.module.css";

export default function FragTable({data, playerNames, totalTeams}){

    const headers = {
        "name": {"title": "Player"},
        "playtime": {"title": "Playtime"},
        "score": {"title": "Score"},       
        "frags": {"title": "Frags"},       
        "kills": {"title": "Kills"},       
        "deaths": {"title": "Deaths"},       
        "suicides": {"title": "Suicides"},       
        "efficiency": {"title": "Efficiency"},       
        "spawnKills": {"title": "Spawn Kills"},       
        "teamKills": {"title": "Team Kills"},       
        "headShots": {"title": "Headshots"},       
    };


    const test = {};

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        const name = playerNames[d.player_id] ?? "Not Found";

        let team = 0;

        if(totalTeams > 1){
            team = d.team;
        }
        if(test[team] === undefined){
            test[team] = [];
        }


        test[team].push({
            "name": {
                "value": name.toLowerCase(), 
                "displayValue": name, 
                "className": `${getTeamColorClass((totalTeams > 1) ? d.team : 255)} text-left`
            },
            "playtime": {"value": d.playtime, "displayValue": MMSS(d.playtime)},
            "score": {"value": d.score, "displayValue": ignore0(d.score)},
            "frags": {"value": d.frags, "displayValue": ignore0(d.frags)},       
            "kills": {"value": d.kills, "displayValue": ignore0(d.kills)},       
            "deaths": {"value": d.deaths, "displayValue": ignore0(d.deaths)},       
            "suicides": {"value": d.suicides, "displayValue": ignore0(d.suicides)},       
            "efficiency": {"value": d.efficiency, "displayValue": `${ignore0(d.efficiency.toFixed(2))}%`},       
            "spawnKills": {"value": d.spawn_kills, "displayValue": ignore0(d.spawn_kills)},       
            "teamKills": {"value": d.team_kills, "displayValue": ignore0(d.team_kills)},       
            "headShots": {"value": d.headshots, "displayValue": ignore0(d.headshots)},  
        });
    }

    let elems = [];

    if(totalTeams < 2){

        elems = <InteractiveTable headers={headers} rows={test[0]}/>;

    }else{

        for(const [teamId, players] of Object.entries(test)){
            elems.push(<InteractiveTable key={teamId} headers={headers} rows={players} sortBy="score" order="DESC"/>);
        }   
    }


    return <div className={styles.wrapper}>
        <Header>Frags Summary</Header>
        {elems}
    </div>
}