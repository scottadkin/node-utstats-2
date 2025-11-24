"use client"
import Link from 'next/link';
import MatchResultSmall from '../MatchResultSmall';
import { toPlaytime, convertTimestamp, removeUnr } from '../../../../api/generic.mjs';
import { BasicTable } from "../Tables";
import { useReducer, useEffect } from 'react';
import MatchesDefaultView from "../MatchesDefaultView";


function reducer(state, action){

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "data": action.data
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

/*
let page = 1;
        const recentMatches = await searchMatches(serverId, 0, 0, page - 1, 25, "date", "DESC");
        console.log(recentMatches);

        let matchElems = null;

        if(pageSettings["Default Display Type"] === "default"){
            matchElems = <MatchesDefaultView data={recentMatches}/>;
        }else{
            matchElems = <MatchesTableView data={recentMatches}/>;
        }
        
        pageManager.addComponent("Display Recent Matches", <div key="recent">
            <div className="default-header">Recent Matches</div>
                {matchElems}
            </div>
        );*/

async function loadData(serverId, page, perPage, dispatch){

    try{

        console.log(`load data`);

        const req = await fetch(`/api/matches?mode=search&serverId=${serverId}&gametypeId=0&mapId=0&page=${page - 1}&perPage=${perPage}`);

        const res = await req.json();
        
        if(res.error !== undefined) throw new Error(res.error);
        dispatch({"type": "loaded", "data": res.data});

        console.log(res);

    }catch(err){
        console.trace(err);
    }
}

export default function RecentMatches({serverId, displayMode}){

    const [state, dispatch] = useReducer(reducer, {
        "page": 1,
        "perPage": 25,
        "data": []
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
        pagination here
        {(displayMode === "default") ? <MatchesDefaultView data={state.data}/> : <BasicTable width={1} columnStyles={styles} headers={headers} rows={rows} />}
    </>


}
