import {React, useReducer, useEffect, useState} from "react";
import Graph from "../Graph";
import CustomGraph from "../CustomGraph";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import Loading from "../Loading";
import InteractiveTable from "../../src/app/UI/InteractiveTable";
import {MMSS, scalePlaytime} from "../../api/generic.mjs";


const renderTestGraph = (bLoading, graphData, matchStart, matchEnd, bHardcore, newPlayerCaps, teamCaps, pointNames) =>{

    if(bLoading) return null;

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


const reducer = (state, action) =>{

    switch(action.type){

        case "load": return {
            "playerCaps": action.payload.playerCaps,
            "teamCaps": action.payload.teamCaps,
            "playerTotals": action.payload.playerTotals,
            "pointNames": action.payload.pointNames,
            "pointsGraph": action.payload.pointsGraph,
            "newPlayerCaps": action.payload.newPlayerCaps,
            "bLoading": false
        }
    }
}

const MatchDominationSummaryNew = ({matchId, mapId, totalTeams, playerData, matchStart, matchEnd, bHardcore}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "playerCaps": {},
        "teamCaps": {"data": [], "labels": []},
        "playerTotals": [],
        "pointNames": [],
        "pointsGraph": {"data": [], "labels": []},
        "newPlayerCaps": [],
        "bLoading": true
    });

    const [separateTeams, setSeparateTeams] = useState(true);

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "playerdomcaps", "matchId": matchId, "mapId": mapId})
            });

            const res = await req.json();

            dispatch({
                "type": "load",
                "payload": {
                    "playerTotals": res.playerTotals,
                    "playerCaps": res.playerCaps,
                    "pointNames": res.pointNames,
                    "pointsGraph": res.pointsGraph,
                    "newPlayerCaps": res.newPlayerCaps,
                    "teamCaps": res.teamCaps
                }
            });
        }

        loadData();

    }, [matchId, mapId]);


    const getPlayerPointCapCount = (playerId, pointId) =>{

        for(let i = 0; i < state.playerTotals.length; i++){

            const p = state.playerTotals[i];

            if(p.player === playerId && p.point === pointId){
                return p.total_caps;
            }
        }

        return 0;
    }


    const renderTable = (headers, teamId) =>{


        const data = [];

        const totals = {};

        for(const key of Object.keys(headers)){

            totals[key] = 0;
        }

        for(const player of Object.values(playerData)){

            if(player.team !== teamId && teamId !== -1) continue;

            const current = {
                "player": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                        <CountryFlag country={player.country}/>{player.name}
                    </Link>,
                    "className": `player ${Functions.getTeamColor(player.team)}`
                }
            }

            for(let i = 1; i < state.pointNames.length; i++){

                const point = state.pointNames[i];

                const totalCaps = getPlayerPointCapCount(player.id, point.id);

                totals[point.name] += totalCaps;

                current[point.name] = {
                    "value": totalCaps,
                    "displayValue": Functions.ignore0(totalCaps)
                }
            }

            data.push(current);
        }

        if(data.length > 0){

            const current ={
                "bAlwaysLast": true,
                "player": {"value": "Totals"}
            };

            for(let i = 1; i < state.pointNames.length; i++){

                const point = state.pointNames[i];

                current[point.name] = {
                    "value": totals[point.name],
                    "displayValue": Functions.ignore0(totals[point.name])
                }
            }

            data.push(current);
        }


        return <InteractiveTable key={teamId} width={2} headers={headers} data={data}/>
    }

    const renderTables = () =>{

        const headers = {
            "player": "Player"
        };

        //0 is always all
        for(let i = 1; i < state.pointNames.length; i++){

            const {id, name} = state.pointNames[i];
            headers[name] = name;
        }

        const tables = [];

        if(separateTeams){

            for(let i = 0; i < totalTeams; i++){
                tables.push(renderTable(headers, i));
            }

        }else{
            return renderTable(headers, -1);
        }

        return tables;
    }

    return <div>
        <div className="default-header">Domination Summary</div>
        <Loading value={!state.bLoading}/>
        <div className="tabs">
            <div className={`tab ${(separateTeams) ? "tab-selected" : ""}`} onClick={() => setSeparateTeams(true)}>Seperate Teams</div>
            <div className={`tab ${(!separateTeams) ? "tab-selected" : ""}`} onClick={() => setSeparateTeams(false)}>Display All</div>
        </div>
        {renderTables()}
        {renderTestGraph(state.bLoading, state.pointsGraph, matchStart, matchEnd, bHardcore, state.newPlayerCaps, state.teamCaps, state.pointNames)}
        
    </div>
}
export default MatchDominationSummaryNew;
