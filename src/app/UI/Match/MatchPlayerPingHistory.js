"use client"
import { useEffect, useReducer} from "react";
import CustomGraph from "../CustomGraph";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import {getPlayerFromMatchData, MMSS, scalePlaytime, getTeamColor} from "../../../../api/generic.mjs";


function createGraphData(inputData, bHardcore, matchStart, matchEnd, players){

    const {timestamps, data} = inputData;

    const labels = [];

    for(let i = 0; i < timestamps.length; i++){

        labels.push(`${MMSS(scalePlaytime(timestamps[i] - matchStart, bHardcore))}`);
    }

    labels.push(`${MMSS(scalePlaytime(matchEnd - matchStart, bHardcore))}`);
    

    const graphData = [];

    for(let i = 0; i < data.length; i++){

        const player = getPlayerFromMatchData(players, data[i].id);
        graphData.push({
            "name": player.name,
            "values": [],
        });
    }

    for(let i = 0; i < data.length; i++){

        for(let x = 0; x < data[i].data.length; x++){

            graphData[i].values.push(data[i].data[x]);
        }
    }

    return {"labels": labels, "data": graphData};
}

function reducer(state, action){

    switch(action.type){
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage,
                "data": [],
                "graphData": [],
                "graphLabels": [],
                "graphLabelsPrefix": [],
            }
        }
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "data": action.data
            }
        }
        default: return {...state}
    }
}

function renderTable(players, matchId, bLoading){

    if(bLoading) return null;

    const headers = {
        "player": "Player",
        "min": "Min",
        "average": "Average",
        "max": "Max"
    };

    const data = [];

    for(let i = 0 ; i < players.length; i++){

        const p = players[i];

        if(p.playtime === 0) continue;

        data.push({
            "player": {
                "value": p.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${p.player_id}`}>
                    
                    <CountryFlag country={p.country}/>{p.name}
                    
                </Link>,
                "className": `player ${getTeamColor(p.team)}`
            },
            "min":  {"value": p.ping_min},
            "average":  {"value": p.ping_average},
            "max":  {"value": p.ping_max}
        });

    }

    return <InteractiveTable width={2} headers={headers} data={data}/>;
}

async function loadData(controller, dispatch, matchId, playerIds){

    try{

        const req = await fetch("/api/match", {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "pings", "matchId": matchId, "players": playerIds})
        });

        const res = await req.json();

        if(res.error === undefined){
            
            dispatch({
                "type": "loaded", 
                "data": res.data
            });
        }else{
            dispatch({"type": "error", "errorMessage": res.error});
        }

    }catch(err){

        if(err.name !== "AbortError"){
            console.trace(err);
        }
    }
}

export default function MatchPlayerPingHistory({matchId, players, playerIds, playerData, bHardcore, matchStart, matchEnd}){

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "data": [],
        "graphData": [],
        "graphLabels": [],
        "graphLabelsPrefix": [],
    });

    useEffect(() =>{

        const controller = new AbortController();


        loadData(controller, dispatch, matchId, playerIds);

        return () =>{
            controller.abort();
        }
    }, [matchId, playerIds, matchStart, matchEnd, bHardcore]);

    if(state.bLoading) return <Loading/>;

    if(state.error !== null) return <ErrorMessage title="Player Ping History" text={state.error}/>

    const graphData = createGraphData(state.data, bHardcore, matchStart, matchEnd, players);

    return <div>
        <div className="default-header">Player Ping History</div>
        {renderTable(players, matchId, state.bLoading)}
        <CustomGraph 
            tabs={[
                {"name": "Ping", "title": "Player Ping"}
            ]} 
            data={[graphData.data]} 
            labels={[graphData.labels]} 
            labelsPrefix={[
                "Player Ping @ "
            ]}
        />
    </div>
}