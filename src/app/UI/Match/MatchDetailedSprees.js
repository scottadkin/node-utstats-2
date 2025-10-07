"use client"
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import InteractiveTable from '../InteractiveTable';
import { getPlayerFromMatchData, getTeamColor, MMSS, toPlaytime, scalePlaytime } from '../../../../api/generic.mjs';

export default function MatchDetailedSprees({matchId, players, matchStart, sprees, bHardcore}){

    if(sprees === null) return null;

    matchStart = scalePlaytime(matchStart, bHardcore);

    const headers = {
        "player": "Player",
        "started": "Started",
        "ended": "Ended",
        "spreeTime": "Spree Lifetime",
        "reason": "End Reason",
        "kills": "Total Kills"
    
    };
    const data =[];

    for(let i = 0; i < sprees.length; i++){

        const s = sprees[i];

        const player = getPlayerFromMatchData(players, s.player);

        let endReason = null;

        if(s.killer === -1){
            endReason = <div>Match ended!</div>;
        }

        if(s.killer !== -1 && s.player !== s.killer){

            const killer = getPlayerFromMatchData(players, s.killer);
            endReason = <div><span className="red">Killed by</span> <CountryFlag country={killer.country}/>{killer.name}</div>
        }

        if(s.killer === s.player){
            endReason = <div className="red">Committed Suicide</div>
        }

        const start = scalePlaytime(s.start_timestamp, bHardcore);
        const end = scalePlaytime(s.end_timestamp, bHardcore);

        data.push({
            "player": {
                "value": player.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                    
                        <CountryFlag country={player.country}/>{player.name}
                    
                </Link>,
                "className": `player ${getTeamColor(player.team)}`
            },
            "started": {"value": start, "displayValue": MMSS(start - matchStart)},
            "ended": {"value": end, "displayValue": MMSS(end - matchStart)},
            "spreeTime": {
                "value": s.total_time,
                "displayValue": toPlaytime(scalePlaytime(s.total_time, bHardcore)),
                "className": "playtime"
            },
            "reason": {"value": s.killer, "displayValue": endReason},
            "kills": {"value": s.kills}
        });
    }

   
    if(sprees !== null && sprees.length === 0) return null;

    return <div>
        <div className="default-header">Extended Spree Summary</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </div>
}
