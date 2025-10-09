"use client"
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import { scalePlaytime, MMSS, toPlaytime, getTeamColor, getTeamName, getPlayer } from "../../../../api/generic.mjs";

const renderData = (capData, matchStart, player, bHardcode) =>{

    const headers = {
        "info": "Info",
        "type": "Cap Type",
        "taken": "Flag Taken",
        "cap": "Flag Capped",
        "carry_time": "Time Carrying Flag"
    };

  

    const data = capData.map((cap) =>{

        const grabTime = scalePlaytime(cap.grab_time - matchStart, bHardcode);
        const capTime = scalePlaytime(cap.cap_time - matchStart, bHardcode);

        const info = <><CountryFlag country={player.country}/>{player.name} Capped the {getTeamName(cap.flag_team, true)} Flag</>

        const type = (cap.total_assists === 0) ? "Solo Cap" : "Assisted Cap";

        return {
            "info": {"value": "", "displayValue": info, "className": getTeamColor(cap.cap_team)},
            "type": {"value": cap.total_assists, "displayValue": type},
            "taken": {"value": grabTime, "displayValue": MMSS(grabTime)},
            "cap": {"value": capTime, "displayValue": MMSS(capTime)},
            "carry_time": {"value": cap.times.carry_time, "displayValue": <div><span className="playtime">{toPlaytime(scalePlaytime(cap.times.carryTime, bHardcode))}</span> ({cap.times.carryPercent.toFixed(2)}%)</div>}
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>;
}

export default function PlayerMatchCTFCaps({data, matchStart, bHardcore, player}){

    if(data.length === 0) return null;

    return <div>
        <div className="default-header">Player Caps</div>
        {renderData(data, matchStart, player, bHardcore)}
    </div>
}