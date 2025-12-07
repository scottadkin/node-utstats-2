"use client"
import Link from 'next/link';
import MatchResultSmall from './MatchResultSmall';
import { toPlaytime, convertTimestamp, removeUnr } from '../../../api/generic.mjs';
import { BasicTable } from "./Tables";
import { useRouter } from 'next/navigation';


function createRows(matches){

    const rows = [];    

    for(let i = 0; i < matches.length; i++){

        const m = matches[i];

        const url = `/match/${m.id}`;

        rows.push([
            <Link key="a" href={url}>{convertTimestamp(m.date, true)}</Link>,
            <Link key="b" href={url}>{m.serverName}</Link>,
            <Link key="c" href={url}>{m.gametypeName}</Link>,
            <Link key="d" href={url}>{removeUnr(m.mapName)}</Link>,
            <Link key="e" href={url}>{m.players}</Link>,
            <Link key="f" href={url}>{toPlaytime(m.playtime)}</Link>,
            <MatchResultSmall key={i}
                totalTeams={m.total_teams} 
                dmWinner={m.dmWinnerName} 
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


function changeURL(router, newSortBy, currentSortBy, order, server, gametype, map){

    order = order.toLowerCase();

    if(newSortBy === currentSortBy){

        order = (order === "asc") ? "desc" : "asc";
    }

    router.push(`/matches/?sortBy=${newSortBy}&order=${order}&server=${server}&gametype=${gametype}&map=${map}`);
}

export default function MatchesTableView({data, bHome, sortBy, order, server, gametype, map}){

    const router = useRouter();

    if(bHome === undefined) bHome = false;

    const matches = data;

    const rows = createRows(matches);

    let headers = [
        "Date", "Server", "Gametype", "Map", "Players", "Playtime", "Result",
    ];

    if(!bHome){
        headers =[
            
                {"name": "Date", "callback": () =>{
                    changeURL(router, "date", sortBy, order,server, gametype, map);
                }}, 
                {"name": "Server", "callback": () =>{
                    changeURL(router, "server", sortBy, order,server, gametype, map);
                }}, 
                {"name": "Gametype", "callback": () =>{
                    changeURL(router, "gametype", sortBy, order,server, gametype, map);
                }}, 
                {"name": "Map", "callback": () =>{
                    changeURL(router, "map", sortBy, order,server, gametype, map);
                }}, 
                {"name": "Players", "callback": () =>{
                    changeURL(router, "players", sortBy, order,server, gametype, map);
                }}, 
                {"name": "Playtime", "callback": () =>{
                    changeURL(router, "playtime", sortBy, order,server, gametype, map);
                }}, 
                //dont need for result
                "Result",
        ];
    }

    const styles = [
        "date",
        "small-font",
        "small-font",
        null,
        null,
        "playtime",
        null
    ];

    return <BasicTable width={1} columnStyles={styles} headers={headers} rows={rows} />

}
