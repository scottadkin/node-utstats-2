"use client"
import {useState, useEffect} from "react";
import Loading from "../Loading";
import styles from"./MatchKillsMatchUp.module.css";
import { getTeamColor, ignore0 } from "../../../../api/generic.mjs";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import ErrorMessage from "../ErrorMessage";


async function loadData(controller, matchId, setError, setKillData){

    try{

        const req = await fetch("/api/match",{
            "signal": controller.signal,
            "headers": {
                "Content-type": "application/json"
            },
            "method": "POST",
            "body": JSON.stringify({"mode": "kmu", "matchId": matchId})
        });

        const res = await req.json();

        if(res.error !== undefined){
            setError(res.error);
        }else{
            setKillData(res.data);
        }

    }catch(err){
        
        if(err.name !== "AbortError"){
            console.trace(err);
        }
    }
}

function getKills(killData, killer, victim){

    for(let i = 0; i < killData.length; i++){

        const d = killData[i];

        if(d.k === killer && d.v === victim){
            return d.kills;
        }
    }

    return 0;
}

function renderTable(matchId, players, killData){

    const headers = [];

    const orderedPlayers = [...players];

    orderedPlayers.sort((a, b) =>{

        if(a.team > b.team) return -1;
        if(a.team < b.team) return 1;

        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        if(aName > bName) return -1;
        if(aName < bName) return 1;
        return 0;
        
    });

    for(let i = 0; i < orderedPlayers.length; i++){

        const player = orderedPlayers[i];

        if(player.spectator || !player.played) continue;

        headers.push(<th key={player.player_id} className={`${styles.th} text-left ${getTeamColor(player.team)}`}>
            <Link href={`/pmatch/${matchId}/?player=${player.player_id}`}>
                
                    <img className={styles.flag} src={`/images/flags/${player.country}.svg`} alt="flag"/>
                    &nbsp;&nbsp;{player.name}
                
            </Link>
        </th>);

    }

    const rows = [];

    for(let i = 0; i < orderedPlayers.length; i++){

        const killer = orderedPlayers[i];

        if(killer.spectator || !killer.played) continue;

        const columns = [];

        for(let x = 0; x < orderedPlayers.length; x++){

            const victim = orderedPlayers[x];

            if(victim.spectator || !victim.played) continue;

            const totalKills = ignore0(getKills(killData, killer.player_id, victim.player_id));

            const key = `km-${i}-${x}`;

            if(killer.id === victim.id){
                columns.push(<td key={key} className="color3">{totalKills}</td>);
            }else{
                columns.push(<td key={key}>{totalKills}</td>);
            }
        }

        rows.push(<tr key={i}>
            <td className={`${getTeamColor(killer.team)} text-left`}>
                <Link href={`/pmatch/${matchId}/?player=${killer.player_id}`}>
                    <CountryFlag country={killer.country}/>{killer.name}
                </Link>
            </td>
            {columns}
        </tr>);
    }


    return <table>
        <tbody>
        <tr>
            <th>&nbsp;</th>
            {headers}
        </tr>
        {rows}
        </tbody>
    </table>
}

const MatchKillsMatchUp = ({matchId, players}) =>{

    const [killData, setKillData] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() =>{

        const controller = new AbortController();


        loadData(controller, matchId, setError, setKillData);

        return () =>{
            controller.abort();
        }

    }, [matchId]);


    if(error !== null) return <ErrorMessage title="Failed to display Match Kills Match Up" text={error}/>;
    if(killData === null) return <Loading />
 

    if(killData.length === 0) return null;

    return <div>
        <div className="default-header">Kills Match Up</div>
        {renderTable(matchId, players, killData)}
    </div>
}

export default MatchKillsMatchUp;
