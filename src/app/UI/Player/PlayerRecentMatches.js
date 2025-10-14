"use client"
import { useReducer, useEffect } from "react";
import {BasicTable} from "../Tables";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import Link from "next/link";
import MatchResultSmall from "../MatchResultSmall";
import PlayerMatchResult from "./PlayerMatchResult";
import Pagination from "../Pagination";

function reducer(state, action){

    switch(action.type){

        case "set-data": {

            return {
                ...state,
                "data": action.data   
            }
        }
        case "set-page": {
            return {
                ...state,
                "page": action.value
            }
        }
    }

    return {...state};
}


async function loadData(playerId, page, dispatch){

    try{

        console.log("loadData");

        const req = await fetch("/api/player", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "player-recent-matches", "id": playerId, "page": page})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-data", "data": res.data});

    }catch(err){
        console.trace(err);
    }
}

function renderTable(data, playerId){

    if(data === null) return null;

    const headers = [
        "Map","Date", "Gametype", "Players", "Playtime", "Match Result", "Result"
    ];

    
    const rows = data.map((d) =>{

        const url = `/pmatch/${d.match_id}/?player=${playerId}`;
  

        return [
            {"className": "text-left", "value": <Link href={url}>{d.mapName}</Link>},
            {"className": "date", "value": <Link href={url}>{convertTimestamp(d.match_date)}</Link>},   
            <Link href={url}>{d.gametypeName}</Link>,
            <Link href={url}>{d.players}</Link>,
            {"className": "playtime", "value": <Link href={url}>{toPlaytime(d.playtime)}</Link>},
            <Link href={url}>
                <MatchResultSmall 
                    totalTeams={d.total_teams} 
                    dmWinner={d.dmWinner} 
                    dmScore={d.dm_score} 
                    redScore={d.team_score_0} 
                    blueScore={d.team_score_1} 
                    greenScore={d.team_score_2}
                    yellowScore={d.team_score_3} 
                    bMonsterHunt={d.mh} 
                    endReason={d.end_type}
                />
            </Link>,
            <PlayerMatchResult playerId={playerId} data={d}/>
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

export default function PlayerRecentMatches({perPage, defaultDisplayMode, playerId, totalMatches}){

    const [state, dispatch] = useReducer(reducer, {
        "page": 1,
        "displayMode": defaultDisplayMode,
        "data": null
    });

    useEffect(() =>{

        loadData(playerId, state.page, dispatch);

    }, [playerId, state.page]);


    return <>
        <div className="default-header">Recent Matches</div>
        <Pagination currentPage={state.page} results={totalMatches} perPage={perPage} url={null} event={(a) =>{
            dispatch({"type": "set-page", "value": a});
        }}/>
        {renderTable(state.data, playerId)}
        
    </>
}