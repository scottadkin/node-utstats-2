"use client"
import { useReducer, useEffect } from "react";
import {BasicTable} from "../Tables";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import Link from "next/link";
import MatchResultSmall from "../MatchResultSmall";
import PlayerMatchResult from "./PlayerMatchResult";
import Pagination from "../Pagination";
import MatchResultDisplay from "../MatchResultDisplay";
import Tabs from "../Tabs";

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
        case "set-display-mode": {
            return {
                ...state,
                "displayMode": action.value
            }
        }
    }

    return {...state};
}


async function loadData(playerId, page, perPage, dispatch){

    try{

        const req = await fetch("/api/player", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "player-recent-matches", "id": playerId, "page": page, "perPage": perPage})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-data", "data": res.data});

    }catch(err){
        console.trace(err);
    }
}

function renderTable(mode, data, playerId){

    if(data === null || mode !== "table") return null;

    const headers = [
        "Map","Date", "Gametype", "Players", "Playtime", "Match Result", "Result"
    ];

    
    const rows = data.map((d) =>{

        const url = `/pmatch/${d.match_id}/?player=${playerId}`;
  

        return [
            {"className": "text-left", "value": <Link href={url}>{d.mapName}</Link>},
            {"className": "date", "value": <Link href={url}>{convertTimestamp(d.match_date)}</Link>},   
            <Link key="a" href={url}>{d.gametypeName}</Link>,
            <Link key="b" href={url}>{d.players}</Link>,
            {"className": "playtime", "value": <Link href={url}>{toPlaytime(d.playtime)}</Link>},
            <Link key="c" href={url}>
                <MatchResultSmall 
                    totalTeams={d.total_teams} 
                    dmWinner={d.dmWinnerName} 
                    dmScore={d.dm_score} 
                    redScore={d.team_score_0} 
                    blueScore={d.team_score_1} 
                    greenScore={d.team_score_2}
                    yellowScore={d.team_score_3} 
                    bMonsterHunt={d.mh} 
                    endReason={d.end_type}
                />
            </Link>,
            <PlayerMatchResult key="d" playerId={playerId} data={d}/>
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}


function renderDefault(mode, data, playerId){

    if(mode !== "default") return null;
    
    return <div className="t-width-1 center">
        {data.map((d) =>{
            return <MatchResultDisplay  key={d.match_id}
                url={`/pmatch/${d.match_id}?player=${playerId}`}  mode="player" playerResult={<PlayerMatchResult playerId={playerId} data={d}/>}
                mapImage={d.image} mapName={d.mapName} serverName={d.serverName}
                date={d.match_date} gametypeName={d.gametypeName} playtime={d.playtime} players={d.players}>
            </MatchResultDisplay>
        })}
    </div>
}

export default function PlayerRecentMatches({perPage, defaultDisplayMode, playerId, totalMatches}){

    const [state, dispatch] = useReducer(reducer, {
        "page": 1,
        "displayMode": defaultDisplayMode,
        "data": []
    });

    useEffect(() =>{

        loadData(playerId, state.page, perPage, dispatch);

    }, [playerId, state.page, perPage]);


    const tabOptions = [
        {"name": "Default View", "value": "default"},
        {"name": "Table View", "value": "table"}
    ];


    return <>
        <div className="default-header">Recent Matches</div>
        <Tabs options={tabOptions} selectedValue={state.displayMode} changeSelected={(a) =>{
            dispatch({"type": "set-display-mode", "value": a});
        }}/>
        {renderDefault(state.displayMode, state.data, playerId)}
        {renderTable(state.displayMode, state.data, playerId)}
        <Pagination currentPage={state.page} results={totalMatches} perPage={perPage} url={null} event={(a) =>{
            dispatch({"type": "set-page", "value": a});
        }}/>  
    </>
}