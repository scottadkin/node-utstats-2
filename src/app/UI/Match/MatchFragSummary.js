"use client"
import {useState} from 'react';
import MatchFragTable from './MatchFragTable';
import MatchFragDistances from './MatchFragDistances';
import Tabs from "../Tabs";

function bAnyDistanceData(playerData){

    const types = [
        "shortest_kill_distance", 
        "average_kill_distance", 
        "longest_kill_distance",
        "k_distance_normal",
        "k_distance_long",
        "k_distance_uber"
    ];

    for(let i = 0; i < playerData.length; i++){

        const p = playerData[i];

        for(let x = 0; x < types.length; x++){

            if(p[types[x]] !== 0){
                return true;
            }
        }
    }

    return false;
}

function renderTabs(playerData, mode, setMode){

    if(!bAnyDistanceData(playerData)) return null;

    return <Tabs options={[
        {"name": "General Data", "value": 0},
        {"name": "Kill Distances", "value": 1},
    ]} selectedValue={mode} changeSelected={(a) => setMode(() => a)} />    
}


function renderTeamTabs(separateByTeam, setSeparateByTeam, single, totalTeams){

    if(single || totalTeams < 2) return null;

    return <Tabs selectedValue={separateByTeam} changeSelected={(a) => setSeparateByTeam(() => a)} options={[
        {"name": "Separate By Team", "value": true},
        {"name": "Display All", "value": false},
    ]}/>
}

export default function MatchFragSummary({matchId, playerData, totalTeams, single}){

    const [mode, setMode] = useState(0);
    const [separateByTeam, setSeparateByTeam] = useState(true);


    return <div>
        <div className="default-header">Frags Summary</div>
        {renderTabs(playerData, mode, setMode)}
        {renderTeamTabs(separateByTeam, setSeparateByTeam, single, totalTeams)}
        {(mode === 0) ? <MatchFragTable 
            playerData={playerData} 
            totalTeams={totalTeams} 
            bSeparateByTeam={separateByTeam} 
            highlight={null}
            matchId={matchId}
            single={single}
        /> : null}

        {(mode === 1) ? <MatchFragDistances 
            playerData={playerData} 
            totalTeams={totalTeams} 
            bSeparateByTeam={separateByTeam} 
            highlight={null}
            matchId={matchId}
            single={single}
        /> : null}
    </div>
}
