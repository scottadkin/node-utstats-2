"use client"
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import {useState} from "react";
import InteractiveTable from '../InteractiveTable';
import { getPlayerFromMatchData, getTeamName, MMSS, toPlaytime, getTeamColor } from '../../../../api/generic.mjs';
import Tabs from '../Tabs';


function createTeamChangeString(teamId, totalTeams){

    if(totalTeams >= 2 && teamId !== 255){

        return <>Joined the <b>{getTeamName(teamId)}</b>.</>;
    }

    if(totalTeams >= 2 && teamId === 255){
        return <>Joined the server as a spectator.</>;
    }

    return <>Joined the Server.</> 
}

function renderTabs(totalTeams, displayMode, setDisplayMode){

    if(totalTeams < 2) return null;

    const options = [
        {"name": "Team Changes", "value": 0},
        {"name": "Team Playtime", "value": 1},
    ]

    return <Tabs options={options} selectedValue={displayMode} changeSelected={(a) => setDisplayMode(a)}/>
}

function renderTeamChanges(displayMode, teamChanges, players, matchStart, matchId, totalTeams){

    

    if(displayMode !== 0) return null;

    const headers = {
        "time": "Timestamp",
        "player": "Player",
        "info": "Info"
    };

    if(teamChanges === null){
        return <InteractiveTable width={4} headers={headers} data={[]}/>
    }


    const data = teamChanges.map((teamChange) =>{

        const player = getPlayerFromMatchData(players, teamChange.player);

        const teamColor = getTeamColor(teamChange.team);

        return {
            "time": {
                "value": teamChange.timestamp,
                "displayValue": MMSS(teamChange.timestamp - matchStart)
            },
            "player": {
                "value": player.name.toLowerCase(),
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                    
                        <CountryFlag country={player.country}/>{player.name}
                    
                </Link>,
                "className": `player ${teamColor}`
            },
            "info": {
                "value": teamChange.team,
                "displayValue": createTeamChangeString(teamChange.team, totalTeams),
            }
        };
    });

    return <InteractiveTable width={4} headers={headers} data={data}/>
}

function renderPlaytimeInfo(displayMode, players, matchId, totalTeams){

    if(displayMode !== 1) return null;

    const headers = {
        "player": "Player",
        "totalPlaytime": "Playtime"
    };

    for(let i = 0; i < totalTeams; i++){

        headers[`team_${i}_playtime`] = `${getTeamName(i, true)} Playtime`;
    }

    headers[`spec_playtime`] = `Spectator Time`;

    const rows = [];

    for(let i = 0; i < players.length; i++){

        const player = players[i];

        const currentData = {
            "player": {
                "value": player.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.player_id}`}>
                    
                        <CountryFlag country={player.country}/>{player.name}
                    
                </Link>,
                "className": `player`
            },
            "totalPlaytime": {
                "value": player.playtime,
                "displayValue": toPlaytime(player.playtime),
                "className": "playtime"
            }
        }

        for(let x = 0; x < totalTeams; x++){

            currentData[`team_${x}_playtime`] = {
                "value": player[`team_${x}_playtime`],
                "displayValue": toPlaytime(player[`team_${x}_playtime`]),
                "className": "playtime"
            }
        }

        currentData[`spec_playtime`] = {
            "value": player[`spec_playtime`],
            "displayValue": toPlaytime(player[`spec_playtime`]),
            "className": "playtime"
        }

        rows.push(currentData);

     
    }


    return <InteractiveTable width={1} headers={headers} data={rows}/>

}

export default function MatchTeamsSummary({teamChanges, matchId, matchStart, players, playerData, totalTeams}){

    const [displayMode, setDisplayMode] = useState(0);

    return <div>
        <div className="default-header">Teams Summary</div>
        {renderTabs(totalTeams, displayMode, setDisplayMode)}
        {renderTeamChanges(displayMode, teamChanges, players, matchStart, matchId, totalTeams)}
        {renderPlaytimeInfo(displayMode, players, matchId, totalTeams)}
    </div>
}