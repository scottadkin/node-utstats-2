"use client"
import {useState} from "react";
import CustomGraph from "../CustomGraph";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import InteractiveTable from "../InteractiveTable";
import {MMSS, scalePlaytime, getTeamColor, ignore0, toPlaytime, plural} from "../../../../api/generic.mjs";
import Tabs from "../Tabs";

const renderTestGraph = (graphData, matchStart, matchEnd, bHardcore, newPlayerCaps, teamCaps, pointNames, mode) =>{

    if(mode !== 0) return null;
    const tabs = [];
    const data = [];

    tabs.push({
        "name": "Control Point Captures",
        "title": `Control Point Caps`
    });

    const tempTabs = [];

    for(let i = 0; i < pointNames.length; i++){

        let {id,name} = pointNames[i];

        let title = `Control Point ${name}`;

        if(id === 0){
            name = "Combined";
            title = `All Control Points Combined`;
            
        }

        tabs.push({
            "name": name,
            "title": title
        });

        tempTabs.push({
            "name": `Team ${name}`,
            "title": `Team Totals For ${title}`
        });
    }

    tabs.push(...tempTabs);

    for(let i = 0; i < graphData.data.length; i++){

        const d = graphData.data[i];
        data.push({"name": d.name, "values": d.values});      
    }

    const labelsPrefix = [
        "Total Captures at "
    ];

    const pointLabels = [];

    for(const [key, value] of Object.entries(newPlayerCaps.labels)){

        labelsPrefix.push(`Control Point Caps at `);

        const current = value.map((r) =>{
            return MMSS(scalePlaytime(r - matchStart, bHardcore));
        });

        current.unshift(MMSS(0));
        pointLabels.push(current);
    }



    const labels = graphData.timestamps.map((r) =>{
        return MMSS(scalePlaytime(r - matchStart, bHardcore));
    });

    const teamCapLabels = [];

    for(const [pointId, pointData] of Object.entries(teamCaps.labels)){
        labelsPrefix.push(`Control Point Caps at `);
        teamCapLabels.push(pointData.map((d) =>{
            return MMSS(scalePlaytime(d - matchStart, bHardcore))
        }));
    }

    labels.unshift(MMSS(0));

    return <CustomGraph 
        tabs={tabs}  
        labels={[labels, ...pointLabels, ...teamCapLabels]}
        labelsPrefix={labelsPrefix}
        data={[data, ...newPlayerCaps.data, ...teamCaps.data]}
    />
}

function getPlayerPointCapCount(playerId, pointId, data){

    for(let i = 0; i < data.playerControlPointStats.length; i++){

        const p = data.playerControlPointStats[i];


        if(p.player_id !== playerId) continue;
        if(p.point_id !== pointId) continue;

        return {
            "caps": p.times_taken,
            "timeHeld": p.time_held
        };
        //if(p.player === playerId && p.point === pointId){
        //    return p.total_caps;
       // }
    }

    return {"caps": 0, "timeHeld": 0};
}

function renderTable(headers, teamId, playerData, data, matchId){

    const totals = {};

    for(const key of Object.keys(headers)){

        totals[key] = {"caps": 0, "timeHeld": 0};
    }

    const rows = [];

    for(let i = 0; i < playerData.length; i++){

        const player = playerData[i];
        if(player.team !== teamId && teamId !== -1) continue;

        const current = {
            "player": {
                "value": player.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.player_id}`}>
                    <CountryFlag country={player.country}/>{player.name}
                </Link>,
                "className": `player ${getTeamColor(player.team)}`
            }
        }

        for(let i = 1; i < data.pointNames.length; i++){

            const point = data.pointNames[i];

            const totalCaps = getPlayerPointCapCount(player.player_id, point.id, data);

            totals[point.name].caps += totalCaps.caps;
            totals[point.name].timeHeld += totalCaps.timeHeld;

            current[point.name] = {
                "value": totalCaps.timeHeld,
                "displayValue": <><span className="date">{toPlaytime(totalCaps.timeHeld, true)}</span>
                &nbsp;({totalCaps.caps} {plural(totalCaps.caps, "cap")})</>
            }
        }

        rows.push(current);
        
    }

    if(rows.length > 0){

        const current ={
            "bAlwaysLast": true,
            "player": {"value": "Totals"}
        };

        for(let i = 1; i < data.pointNames.length; i++){

            const point = data.pointNames[i];

            current[point.name] = {
                "displayValue": <><span className="date">{toPlaytime(totals[point.name].timeHeld, true)}</span>
                &nbsp;({totals[point.name].caps} {plural(totals[point.name].caps, "cap")})</>
            }
        }

        rows.push(current);
    }

    if(rows.length === 0) return null;
    
    return <InteractiveTable key={teamId} width={1} headers={headers} data={rows}/>
}

function renderTables(playerData, data, matchId, totalTeams, mode){

    if(mode === 0) return null;

    const headers = {
        "player": "Player"
    };

    //0 is always all
    for(let i = 1; i < data.pointNames.length; i++){

        const {id, name} = data.pointNames[i];
        headers[name] = name;
    }

    const tables = [];

    if(mode === 1){

        for(let i = 0; i < totalTeams; i++){
            tables.push(renderTable(headers, i, playerData, data, matchId));
        }

    }else{
        return renderTable(headers, -1, playerData, data, matchId);
    }

    return tables;
}

export default function MatchDominationSummary({matchId, totalTeams, playerData, matchStart, matchEnd, bHardcore, data}){


    const [mode, setMode] = useState(1);

    if(data === null || data.playerTotals.length === 0) return null;

    const tabOptions = [
        {"name": "Totals By Team", "value": 1},
        {"name": "Totals By Players", "value": 2},
        {"name": "Graph", "value": 0}
    ];


    return <div>
        <div className="default-header">Domination Summary</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(a)}/>
        {renderTables(playerData, data, matchId, totalTeams, mode)}
        {renderTestGraph(data.pointsGraph, matchStart, matchEnd, bHardcore, data.newPlayerCaps, data.teamCaps, data.pointNames, mode)}    
    </div>
}