"use client"
import {useState} from 'react';
import { getPlayerFromMatchData, MMSS, toPlaytime, ignore0, getTeamColor, scalePlaytime, getTeamName, plural } from '../../../../api/generic.mjs';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import MouseOver from "../../../../components/MouseOver";


function updateTeamScores(teamScores, teamId, totalTeams){

    if(teamScores.length === 0){

        for(let i = 0; i < totalTeams; i++){
            teamScores.push(0);
        }
    }

    teamScores[teamId]++;
}

function createTeamScoresString(teamScores){

    let string = "";

    for(let i = 0; i < teamScores.length; i++){

        string += `${teamScores[i]}`;

        if(i < teamScores.length - 1){
            string += " - ";
        }
    }

    return string;
}

function createKillHoverData(playerData, kills, teamId){

    kills.sort((a, b) =>{

        a = a.total_events;
        b = b.total_events;

        if(a < b) return 1;
        if(a > b) return -1;
        return 0;
    });


    const found = kills.filter((kill) =>{
        if(kill.player_team === teamId) return true;
    });

    const elems = found.map((kill, index) =>{

        const player = getPlayerFromMatchData(playerData, kill.player_id);

        let end = null;

        if(index < found.length - 1){
            end = ", ";
        }

        return <span key={kill.player_id}>
            <CountryFlag country={player.country}/>{player.name} <b>{kill.total_events}</b>{end}
        </span>
        
    });


    if(elems.length === 0) return null;

    return <div>
        {elems}
    </div>;
}

function createTotalsHoverData(data, playerData, targetKey, invalidTargetKeyValue, alternativeKey){

    const totals = {};

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let current = null;

        if(d[targetKey] === invalidTargetKeyValue){
            current = d[alternativeKey];
        }else{
            current = d[targetKey];
        }

        if(totals[current] === undefined){
            totals[current] = 0;
        }

        totals[current]++;
    }

    const finalData = Object.entries(totals);

    finalData.sort((a, b) =>{
        a = a[1];
        b = b[1];

        if(a < b) return 1;
        if(a > b) return -1;
        return 0;
    });

    const elems = [];

    for(let i = 0; i < finalData.length; i++){

        const d = finalData[i];

        const player = getPlayerFromMatchData(playerData, d[0]);

        let end = "";

        if(i < finalData.length - 1){
            end = ", ";
        }

        elems.push(<span key={d[0]}>
            <CountryFlag country={player.country}/>{player.name} <b>{d[1]}</b>{end}
        </span>);
    }

    return <div>{elems}</div>
}


function createAssistHoverData(assists, playerData){

    const elems = assists.map((assist, index) =>{

        let end = "";

        if(index < assists.length - 1){
            end = `, `;
        }
        const player = getPlayerFromMatchData(playerData, assist.player_id);
        return <span key={assist.id}><CountryFlag country={player.country}/>{player.name} <b>{assist.carry_time} Secs</b>{end}</span>
    });

    return <div>{elems}</div>
}


function createTableData(displayMode, matchId, playerData, totalTeams, matchStart, bHardcore, data){

    if(data === undefined) return [];

    const rows = [];

    const teamScores = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        updateTeamScores(teamScores, d.cap_team, totalTeams);

        //const grabPlayer = Functions.getPlayer(playerData, d.grab_player);
        const capPlayer = getPlayerFromMatchData(playerData, d.cap_player);

        const suicideElem = (d.total_suicides === 0) ? null : 
        <span className="grey small-font">
            &nbsp;({d.total_suicides} {plural(d.total_suicides, "Suicide")})
        </span>

        const deathsElem = <>
            {ignore0(d.total_deaths)}
            {suicideElem}
        </>

        const capTime = scalePlaytime(d.cap_time - matchStart, bHardcore);

        const currentRow = {
            "score": {
                "value": i, 
                "displayValue": createTeamScoresString(teamScores),
                "className": getTeamColor(d.cap_team)
            },
            "cap": {
                "value": capTime,
                "displayValue": MMSS(capTime)
            }
            
        };

        if(displayMode === 0){
            
            currentRow["cap_player"] = {
                "value": capPlayer.name.toLowerCase(),
                "displayValue": <>
                    <Link href={`/pmatch/${matchId}/?player=${capPlayer.id}`}>
                        
                        <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                        
                    </Link>
                </>,
                "className": getTeamColor(d.cap_team)
            };

            currentRow["travel_time"] = {
                "value": d.travel_time,
                "displayValue": toPlaytime(scalePlaytime(d.travel_time, bHardcore)),
                "className": "playtime"
            };

            currentRow["carry_time"] = {
                "value": d.carry_time,
                "displayValue": toPlaytime(scalePlaytime(d.carry_time, bHardcore)),
                "className": "playtime"
            };

            currentRow["time_dropped"] = {
                "value": d.drop_time,
                "displayValue": toPlaytime(scalePlaytime(d.drop_time, bHardcore)),
                "className": "playtime"
            };

            currentRow["drops"] = {
                "value": d.total_drops,
                "displayValue": <MouseOver title="Flag Drops" display={createTotalsHoverData(d.flagDrops, playerData, "player_id", null, "")}>
                    {ignore0(d.total_drops)}
                </MouseOver>
            };

            currentRow["covers"] = {
                "value": d.total_covers,
                "displayValue": <MouseOver title="Covers" display={createTotalsHoverData(d.coverData, playerData, "killer_id", null, "")}>
                    {ignore0(d.total_covers)}
                </MouseOver>
            };

            currentRow["self_covers"] = {
                "value": d.total_self_covers,
                "displayValue": <MouseOver title="Self Covers" display={createTotalsHoverData(d.selfCoverData, playerData, "killer_id", null, "")}>
                    {ignore0(d.total_self_covers)}
                </MouseOver>
            };

            currentRow["seals"] = {
                "value": d.total_seals,
                "displayValue": <MouseOver 
                    title="Seals" 
                    display={createTotalsHoverData(d.flagSeals, playerData, "killer_id", null, "")}>{ignore0(d.total_seals)}
                </MouseOver>
            };

            currentRow["assists"] = {
                "value": d.total_assists,
                "displayValue": <MouseOver title="Flag Assists" display={createAssistHoverData(d.flagAssists, playerData)}>
                    {ignore0(d.total_assists)}
                </MouseOver>
            };

            currentRow["deaths"] = {
                "value": d.total_deaths,
                "displayValue": <MouseOver 
                    title="Flag Deaths" 
                    display={createTotalsHoverData(d.flagDeaths, playerData, "victim_id", -1, "killer_id")}>{deathsElem}
                </MouseOver>
            };
        }

        if(displayMode === 1){

            for(let x = 0; x < totalTeams; x++){

                currentRow[`team_${x}_kills`] = {
                    "value": d[`team_${x}_kills`],
                    "displayValue": 
                    <MouseOver title="Kills" display={createKillHoverData(playerData, d.capKills, x)}>
                        {ignore0(d[`team_${x}_kills`])}
                    </MouseOver>
                };

                currentRow[`team_${x}_suicides`] = {
                    "value": d[`team_${x}_suicides`],
                    "displayValue": <MouseOver title="Suicides" display={createKillHoverData(playerData, d.capSuicides, x)}>
                    {ignore0(d[`team_${x}_suicides`])}
                </MouseOver>
                };
            }
        }

        rows.push(currentRow);
    }

    return rows;
}

export default function MatchCTFCaps({matchId, playerData, totalTeams, matchStart, bHardcore, capData}){

    if(capData === null) return null;
    
    const [displayMode, setDisplayMode] = useState(0);

    if(playerData.length > 0 && playerData[0].ctfData === undefined) return null;

    const headers = {
        "score": "Score",
    };

    let tableWidth = 1;

    if(displayMode === 0){

       // headers["taken"] = "Taken";
        //headers["taken_player"] = "Grab Player";
        headers["cap"] = "Capped";
        
        headers["cap_player"] = "Cap Player";
        headers["travel_time"] =  "Travel Time";
        headers["carry_time"] = "Carry Time";
        headers["time_dropped"] = "Time Dropped";
        headers["drops"] = "Drops";
        headers["deaths"] = "Deaths";
        headers["covers"] = "Covers";
        headers["self_covers"] = "Self Covers";
        headers["seals"] = "Seals";
        headers["assists"] = "Assists"; 

    }else if(displayMode === 1){

        headers["cap"] = "Capped";

        for(let i = 0; i < totalTeams; i++){

            headers[`team_${i}_kills`] = `${getTeamName(i, true)} Kills`;
            headers[`team_${i}_suicides`] = `${getTeamName(i, true)} Suicides`;
        }

        tableWidth = 2;
    }

    const tableData = createTableData(displayMode, matchId, playerData, totalTeams, matchStart, bHardcore, capData);

    return <div>
        <div className="default-header">Capture The Flag Caps</div>
        <div className="tabs">
            <div className={`tab ${(displayMode === 0) ? "tab-selected" : ""}`} 
            onClick={() =>{ setDisplayMode(0)}}>
                General
            </div>
            <div className={`tab ${(displayMode === 1) ? "tab-selected" : ""}`} 
            onClick={() =>{ setDisplayMode(1)}}>
                Team Frags
            </div>
        </div>
        <InteractiveTable width={tableWidth} data={tableData} headers={headers}/>
    </div>
}
