"use client"
import InteractiveTable from "../InteractiveTable";
import { getTeamName, getTeamColor, MMSS } from "../../../../api/generic.mjs";

const renderData = (teamChanges, matchStart, totalTeams) =>{

    const headers = {
        "time": "Timestamp",
        "info": "Info"
    };

    const data = teamChanges.map((change) =>{

        const team = change.team;
        const timestamp = change.timestamp - matchStart;

        let joinElem = null;

        if(team < 255){
            joinElem = <>Joined the {getTeamName(team)}.</>
        }else{
            joinElem = <>Joined the server as a spectator.</>
        }
        
        return {
            "time": {
                "value": timestamp,
                "displayValue": MMSS(timestamp)
            },
            "info": {
                "value": team,
                "displayValue": joinElem,
                "className": getTeamColor(team)
            }
        }
    });

    return <InteractiveTable width={2} headers={headers} data={data} />
}

export default function PlayerMatchTeamChanges({matchStart, totalTeams, teamChanges}){

    return <>
        <div className="default-header">Team Change History</div>
        {renderData(teamChanges, matchStart, totalTeams)}
    </>
}
