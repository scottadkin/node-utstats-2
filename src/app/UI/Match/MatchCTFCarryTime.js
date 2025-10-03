
"use client"
import InteractiveTable from "../InteractiveTable";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import { getPlayerFromMatchData, ignore0, getTeamColor, toPlaytime } from "../../../../api/generic.mjs";

export default function MatchCTFCarryTime({data, matchId, players}){

    if(data === null) return null;

    const headers = {
        "player": "Player",
        "assists": "Assists",
        "best_assist": "Most Assists(Single Life)",
        "caps": "Caps",
        "best_caps": "Most Caps(Single Life)",
        "total_carry_time": "Total Carry Time",
        "best_carry_time_life": "Best Carry Time(Single Life)"
    };

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const carryData = data[i];

        if(carryData.flag_carry_time === 0) continue;
        const player = getPlayerFromMatchData(players, carryData.player_id);

        rows.push({
            "player": {
                "value": player.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                    
                    <CountryFlag country={player.country}/>{player.name}
                    
                </Link>,
                "className": `text-left ${getTeamColor(player.team)}`
            },
            "assists": {
                "value": carryData.flag_assist,
                "displayValue": ignore0(carryData.flag_assist)
            },
            "best_assist": {
                "value": carryData.flag_assist_best,
                "displayValue": ignore0(carryData.flag_assist_best)
            },
            "caps": {
                "value": carryData.flag_capture,
                "displayValue": ignore0(carryData.flag_capture)
            },
            "best_caps": {
                "value": carryData.flag_capture_best,
                "displayValue": ignore0(carryData.flag_capture_best)
            },
            "total_carry_time": {
                "value": carryData.flag_carry_time,
                "displayValue": toPlaytime(carryData.flag_carry_time),
                "className": "playtime"
            },
            "best_carry_time_life": {
                "value": carryData.flag_carry_time_best,
                "displayValue": toPlaytime(carryData.flag_carry_time_best),
                "className": "playtime"
            }
        });
    }
 

    return <div>
        <div className="default-header">Capture The Flag Carry Times</div>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </div>
}