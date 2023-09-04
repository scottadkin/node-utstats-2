import {React, useReducer, useEffect, useState} from "react";
import Graph from "../Graph";
import CustomGraph from "../CustomGraph";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import Loading from "../Loading";
import InteractiveTable from "../InteractiveTable";
import {MMSS, scalePlaytime} from "../../api/generic.mjs";


const renderTestGraph = (bLoading, graphData, matchStart, matchEnd, bHardcore) =>{

    if(bLoading) return null;

    const tabs = [];
    const data = [];

    tabs.push({
        "name": "",
        "title": `Control Point Caps`
    });

    for(let i = 0; i < graphData.data.length; i++){

        const d = graphData.data[i];

        
        data.push({"name": d.name, "values": d.values});
        
    }

    const labels = graphData.timestamps.map((r) =>{
        return MMSS(scalePlaytime(r - matchStart, bHardcore));
    });

    labels.unshift(MMSS(0));

    console.log(data);

    return <CustomGraph 
        tabs={tabs}  
        labels={[labels]}
        labelsPrefix={["Total Captures at "]}
        data={[data]}
    />
}

const MatchDominationSummaryNew = ({matchId, mapId, totalTeams, playerData, matchStart, matchEnd, bHardcore}) =>{

    const reducer = (state, action) =>{

        switch(action.type){

            case "load": return {
                "playerCaps": action.payload.playerCaps,
                "playerTotals": action.payload.playerTotals,
                "pointNames": action.payload.pointNames,
                "pointsGraph": action.payload.pointsGraph,
                "bLoading": false
            }
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        "playerCaps": {},
        "playerTotals": [],
        "pointNames": [],
        "pointsGraph": {"data": [], "labels": []},
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

            console.log(res);

            dispatch({
                "type": "load",
                "payload": {
                    "playerTotals": res.playerTotals,
                    "playerCaps": res.playerCaps,
                    "pointNames": res.pointNames,
                    "pointsGraph": res.pointsGraph
                }
            });
        }

        loadData();

    }, [matchId, mapId]);


    const renderGraph = () =>{
        
        if(state.bLoading) return null;

        const data = [];
        const titles = [];

        for(const values of Object.values(state.pointNames)){

            titles.push(values.name);
        }

        for(const [point, pointInfo] of Object.entries(state.pointNames)){

            const current = [];

            for(const [player, capData] of Object.entries(state.playerCaps)){

                const currentPlayer = Functions.getPlayer(playerData, player, true);

                current.push({"name": currentPlayer.name, "data": [...capData[pointInfo.id]]});
            }

            data.push(current);
        }
        
        return <Graph title={titles} data={data}/>
    }

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
        {renderGraph()}
        {renderTestGraph(state.bLoading, state.pointsGraph, matchStart, matchEnd, bHardcore)}
    </div>
}

export default MatchDominationSummaryNew;
