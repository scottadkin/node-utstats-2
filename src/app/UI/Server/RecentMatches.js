"use client"
import Link from 'next/link';
import MatchResultSmall from '../MatchResultSmall';
import { toPlaytime, convertTimestamp, removeUnr } from '../../../../api/generic.mjs';
import { BasicTable } from "../Tables";
import { useReducer, useEffect } from 'react';
import MatchesDefaultView from "../MatchesDefaultView";
import Pagination from "../Pagination";


function reducer(state, action){

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "data": action.data,
                "totalMatches": action.totalMatches
            }
        }
        case "set-page": {
            return {
                ...state,
                "page": action.page
            }
        }
    }

    return state;
}

function createRows(matches){

    const rows = [];    

    for(let i = 0; i < matches.length; i++){

        const m = matches[i];

        const url = `/match/${m.id}`;

        rows.push([
            <Link href={url}>{convertTimestamp(m.date, true)}</Link>,
            <Link href={url}>{m.serverName}</Link>,
            <Link href={url}>{m.gametypeName}</Link>,
            <Link href={url}>{removeUnr(m.mapName)}</Link>,
            <Link href={url}>{m.players}</Link>,
            <Link href={url}>{toPlaytime(m.playtime)}</Link>,
            <MatchResultSmall key={i}
                totalTeams={m.total_teams} 
                dmWinner={m.dmWinner} 
                dmScore={m.dm_score} 
                redScore={Math.floor(m.team_score_0)}
                blueScore={Math.floor(m.team_score_1)}
                greenScore={Math.floor(m.team_score_2)}
                yellowScore={Math.floor(m.team_score_3)}
                bMonsterHunt={m.mh}
                endReason={m.end_type}
            />,
        ]);
    }

    return rows;
}


async function loadData(serverId, page, perPage, dispatch){

    try{


        const req = await fetch(`/api/matches?mode=search&serverId=${serverId}&gametypeId=0&mapId=0&page=${page}&perPage=${perPage}`);

        const res = await req.json();
        
        if(res.error !== undefined) throw new Error(res.error);
        dispatch({"type": "loaded", "data": res.matches, "totalMatches": res.totalMatches});

        console.log(res);

    }catch(err){
        console.trace(err);
    }
}

export default function RecentMatches({serverId, displayMode, perPage}){

    const [state, dispatch] = useReducer(reducer, {
        "page": 1,
        "perPage": perPage,
        "data": [],
        "totalMatches": 0
    });


    useEffect(() =>{

        loadData(serverId, state.page, state.perPage, dispatch);

    },[serverId, state.page, state.perPage]);


    const rows = createRows(state.data);

    const headers = ["Date", "Server", "Gametype", "Map", "Players", "Playtime", "Result"];
    
    const styles = [
        "date",
        "small-font",
        "small-font",
        null,
        null,
        "playtime",
        null
    ];


    return <>
        <div className="default-header">Recent Matches</div>
        <Pagination currentPage={state.page} results={state.totalMatches} perPage={state.perPage} url={null} event={(v) =>{
            dispatch({"type": "set-page", "page": v});
        }}/>
        {(displayMode === "default") ? <MatchesDefaultView data={state.data}/> : <BasicTable width={1} columnStyles={styles} headers={headers} rows={rows} />}
    </>


}
